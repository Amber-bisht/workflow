import { prisma } from "@nextflow/database";
import { OpenRouterService } from "./OpenRouterService";
import { TelegramService } from "./TelegramService";
import { ResendService } from "./ResendService";
import { TavilyService } from "./TavilyService";
import { WebsiteMonitorService } from "./WebsiteMonitorService";
import { CredentialService } from "./CredentialService";
import { BillingService, CREDIT_COSTS } from "./BillingService";
import { EventEmitter } from "events";

export const workflowEvents = new EventEmitter();

interface WorkflowRunOptions {
  workflowId: string;
  workflowRunId: string;
  scope: "FULL" | "PARTIAL" | "SINGLE";
  selectedNodeIds?: string[];
  userId?: string;
}

export class WorkflowEngine {
  /**
   * Resolve text content from an upstream node output for a given edge
   */
  private static resolveText(srcOutput: any, edge: any): string {
    if (!srcOutput) return "";
    if (edge.sourceHandle && srcOutput[edge.sourceHandle]) return String(srcOutput[edge.sourceHandle]);
    if (typeof srcOutput === "string") return srcOutput;
    if (srcOutput.response) return srcOutput.response;
    if (srcOutput.answer) return srcOutput.answer;
    if (srcOutput.text_field) return srcOutput.text_field;
    return JSON.stringify(srcOutput);
  }

  /**
   * Resolve image URL from an upstream node output
   */
  private static resolveImage(srcOutput: any, edge: any): string | null {
    if (!srcOutput) return null;
    if (edge.sourceHandle && srcOutput[edge.sourceHandle] && String(srcOutput[edge.sourceHandle]).startsWith("http"))
      return srcOutput[edge.sourceHandle];
    if (typeof srcOutput === "string" && (srcOutput.startsWith("http") || srcOutput.startsWith("data:image")))
      return srcOutput;
    if (srcOutput.outputImage) return srcOutput.outputImage;
    if (srcOutput.image_field) return srcOutput.image_field;
    return null;
  }

  /**
   * Run workflow DAG execution pipeline
   */
  static async executeWorkflow(options: WorkflowRunOptions): Promise<void> {
    const { workflowId, workflowRunId, scope, selectedNodeIds = [], userId } = options;
    console.log(`[WorkflowEngine] Starting run ${workflowRunId} (Scope: ${scope})`);
    const startOverall = Date.now();

    try {
      const run = await prisma.workflowRun.findUnique({
        where: { id: workflowRunId },
        include: { workflow: { include: { user: true } } },
      });

      if (!run) throw new Error(`Workflow run ${workflowRunId} not found`);

      const resolvedUserId = userId || run.workflow.userId;
      const nodes = (run.nodesData as any)?.nodes || [];
      const edges = (run.nodesData as any)?.edges || [];

      // 2. Identify nodes in execution scope (exclude passthrough nodes)
      let nodesToRun: string[] = [];
      const PASSTHROUGH = ["RequestInputs", "Response"];
      if (scope === "FULL") {
        nodesToRun = nodes
          .filter((n: any) => !PASSTHROUGH.includes(n.type))
          .map((n: any) => n.id);
      } else {
        nodesToRun = nodes
          .filter((n: any) => selectedNodeIds.includes(n.id) && !PASSTHROUGH.includes(n.type))
          .map((n: any) => n.id);
      }

      await prisma.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "RUNNING" },
      });
      workflowEvents.emit("status", { runId: workflowRunId, status: "RUNNING", timestamp: new Date().toISOString() });

      if (nodesToRun.length === 0) {
        await prisma.workflowRun.update({ where: { id: workflowRunId }, data: { status: "SUCCESS", duration: 0 } });
        workflowEvents.emit("status", { runId: workflowRunId, status: "SUCCESS", timestamp: new Date().toISOString() });
        return;
      }

      // Initialize node outputs — seed from RequestInputs
      const nodeOutputs: Record<string, any> = {};
      nodes.forEach((n: any) => {
        if (n.type === "RequestInputs") {
          const fieldsOutput: Record<string, any> = {};
          n.data?.fields?.forEach((f: any) => { fieldsOutput[f.id] = f.value; });
          nodeOutputs[n.id] = fieldsOutput;
        } else if (n.data?.outputImage) {
          nodeOutputs[n.id] = { outputImage: n.data.outputImage };
        } else if (n.data?.response) {
          nodeOutputs[n.id] = { response: n.data.response };
        }
      });

      // 3. Execute nodes in order
      for (const nodeId of nodesToRun) {
        const node = nodes.find((n: any) => n.id === nodeId);
        if (!node) continue;

        const nodeRunStart = Date.now();

        const nodeRun = await prisma.nodeRun.create({
          data: {
            workflowRunId,
            nodeId,
            nodeType: node.type,
            status: "RUNNING",
            startedAt: new Date(),
          },
        });

        workflowEvents.emit("nodeStatus", { runId: workflowRunId, nodeId, status: "RUNNING", timestamp: new Date().toISOString() });

        try {
          // ── CREDIT CHECK ────────────────────────────────────────────────
          await BillingService.checkAndDeduct(resolvedUserId, node.type, workflowRunId, nodeRun.id);

          let output: any = {};
          const incomingEdges = edges.filter((e: any) => e.target === nodeId);

          // ── LLM / OpenRouter / Gemini ───────────────────────────────────
          if (node.type === "LLM" || node.type === "OpenRouter" || node.type === "Gemini") {
            let promptText = node.data?.prompt || "";
            const systemInstruction = node.data?.systemPrompt || "";
            const images: string[] = [];

            for (const edge of incomingEdges) {
              const src = nodeOutputs[edge.source];
              if (!src) continue;
              const img = this.resolveImage(src, edge);
              if (img) images.push(img);
              else promptText += `\n${this.resolveText(src, edge)}`;
            }

            const llmResponse = await OpenRouterService.generateContent({
              prompt: promptText.trim(),
              systemInstruction,
              images,
              model: "openai/gpt-4o",
              temperature: node.data?.temperature ?? 0.7,
            });

            output = { response: llmResponse };

          // ── HTTP Request ────────────────────────────────────────────────
          } else if (node.type === "HTTPRequest") {
            const method = (node.data?.method || "GET").toUpperCase();
            let url = node.data?.url || "";
            let body = node.data?.body || "";

            // Template variable substitution from upstream nodes
            for (const edge of incomingEdges) {
              const src = nodeOutputs[edge.source];
              if (!src) continue;
              const text = this.resolveText(src, edge);
              url = url.replace("{{input}}", text);
              body = body.replace("{{input}}", text);
            }

            const headers: Record<string, string> = {};
            try {
              const parsed = JSON.parse(node.data?.headers || "{}");
              Object.assign(headers, parsed);
            } catch {}

            const fetchOptions: RequestInit = { method, headers: { "Content-Type": "application/json", ...headers } };
            if (method !== "GET" && body) fetchOptions.body = body;

            const res = await fetch(url, fetchOptions);
            let responseBody: any;
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              responseBody = await res.json();
            } else {
              responseBody = await res.text();
            }

            output = {
              statusCode: res.status,
              body: responseBody,
              response: typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody),
            };

          // ── Telegram Send ───────────────────────────────────────────────
          } else if (node.type === "TelegramSend") {
            let messageText = node.data?.message || "";

            for (const edge of incomingEdges) {
              const src = nodeOutputs[edge.source];
              if (!src) continue;
              messageText = this.resolveText(src, edge);
              break; // use first upstream text
            }

            // Resolve bot token from credential vault or direct config
            let botToken = node.data?.botToken || "";
            if (node.data?.credentialId) {
              const creds = await CredentialService.getDecrypted(resolvedUserId, node.data.credentialId);
              botToken = creds.token || creds.botToken || "";
            }

            const chatId = node.data?.chatId || "";
            if (!botToken) throw new Error("TelegramSend: Bot token is required (set in node config or Credential Vault)");
            if (!chatId) throw new Error("TelegramSend: Chat ID is required");

            const result = await TelegramService.sendMessage(botToken, chatId, messageText);
            output = result;

          // ── Resend Email ────────────────────────────────────────────────
          } else if (node.type === "ResendEmail") {
            let emailBody = node.data?.body || "";

            for (const edge of incomingEdges) {
              const src = nodeOutputs[edge.source];
              if (!src) continue;
              emailBody = this.resolveText(src, edge);
              break;
            }

            let apiKey = node.data?.apiKey || process.env.RESEND_API_KEY || "";
            if (node.data?.credentialId) {
              const creds = await CredentialService.getDecrypted(resolvedUserId, node.data.credentialId);
              apiKey = creds.apiKey || "";
            }

            if (!apiKey) throw new Error("ResendEmail: API key is required");

            const result = await ResendService.sendEmail(
              apiKey,
              node.data?.from || "noreply@automation.amberbisht.me",
              node.data?.to || "",
              node.data?.subject || "Workflow Notification",
              emailBody
            );
            output = result;

          // ── Tavily Search ───────────────────────────────────────────────
          } else if (node.type === "TavilySearch") {
            let query = node.data?.query || "";

            for (const edge of incomingEdges) {
              const src = nodeOutputs[edge.source];
              if (!src) continue;
              const upstream = this.resolveText(src, edge);
              if (upstream) query = upstream;
              break;
            }

            let apiKey = node.data?.apiKey || process.env.TAVILY_API_KEY || "";
            if (node.data?.credentialId) {
              const creds = await CredentialService.getDecrypted(resolvedUserId, node.data.credentialId);
              apiKey = creds.apiKey || "";
            }

            if (!apiKey) throw new Error("TavilySearch: API key is required");

            const result = await TavilyService.search(
              apiKey,
              query,
              node.data?.maxResults ?? 5,
              node.data?.searchDepth ?? "basic"
            );
            output = { ...result, response: result.answer || result.results.map(r => r.content).join("\n\n") };

          // ── Website Monitor ─────────────────────────────────────────────
          } else if (node.type === "WebsiteMonitor") {
            let url = node.data?.url || "";

            for (const edge of incomingEdges) {
              const src = nodeOutputs[edge.source];
              if (!src) continue;
              const upstream = this.resolveText(src, edge);
              if (upstream.startsWith("http")) { url = upstream; break; }
            }

            if (!url) throw new Error("WebsiteMonitor: URL is required");

            const result = await WebsiteMonitorService.check(
              url,
              node.data?.expectedStatus ?? 200,
              node.data?.timeoutMs ?? 8000
            );
            output = {
              ...result,
              response: result.isUp
                ? `✅ ${url} is UP (${result.statusCode}) in ${result.responseTimeMs}ms`
                : `❌ ${url} is DOWN — ${result.error || `Status: ${result.statusCode}`}`,
            };
          }

          nodeOutputs[nodeId] = output;
          const nodeDuration = (Date.now() - nodeRunStart) / 1000;

          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: { status: "SUCCESS", outputs: output, duration: nodeDuration, completedAt: new Date() },
          });

          workflowEvents.emit("nodeStatus", {
            runId: workflowRunId, nodeId, status: "SUCCESS", outputs: output, timestamp: new Date().toISOString(),
          });

        } catch (nodeError: any) {
          console.error(`[WorkflowEngine] Error in node ${nodeId}:`, nodeError);
          const nodeDuration = (Date.now() - nodeRunStart) / 1000;

          await prisma.nodeRun.update({
            where: { id: nodeRun.id },
            data: { status: "FAILED", error: nodeError.message || "Execution error", duration: nodeDuration, completedAt: new Date() },
          });

          workflowEvents.emit("nodeStatus", {
            runId: workflowRunId, nodeId, status: "FAILED", error: nodeError.message, timestamp: new Date().toISOString(),
          });

          throw nodeError;
        }
      }

      // 4. Resolve Response node
      const responseNode = nodes.find((n: any) => n.type === "Response");
      if (responseNode) {
        const incomingEdge = edges.find((e: any) => e.target === responseNode.id);
        if (incomingEdge && nodeOutputs[incomingEdge.source]) {
          const src = nodeOutputs[incomingEdge.source];
          responseNode.data = {
            ...responseNode.data,
            value: typeof src === "object" ? src.response || src.answer || JSON.stringify(src) : src,
          };
        }
      }

      const totalDuration = (Date.now() - startOverall) / 1000;
      await prisma.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "SUCCESS", duration: totalDuration },
      });
      workflowEvents.emit("status", { runId: workflowRunId, status: "SUCCESS", timestamp: new Date().toISOString() });

    } catch (overallError: any) {
      console.error(`[WorkflowEngine] Run ${workflowRunId} failed:`, overallError);
      const totalDuration = (Date.now() - startOverall) / 1000;
      await prisma.workflowRun.update({
        where: { id: workflowRunId },
        data: { status: "FAILED", duration: totalDuration },
      });
      workflowEvents.emit("status", { runId: workflowRunId, status: "FAILED", timestamp: new Date().toISOString() });
    }
  }
}
