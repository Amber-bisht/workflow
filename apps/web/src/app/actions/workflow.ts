"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@nextflow/database";
import { revalidatePath } from "next/cache";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getWorkflows() {
  const userId = await getAuthUserId();

  return prisma.workflow.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      runs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getWorkflow(id: string) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.findFirst({
    where: { id, userId },
  });

  if (!workflow) return null;
  return workflow;
}

export async function createWorkflow(name: string, description?: string) {
  const userId = await getAuthUserId();

  const initialNodes = [
    {
      id: "request-inputs",
      type: "RequestInputs",
      position: { x: 100, y: 150 },
      deletable: false,
      data: {
        fields: [
          { id: "text_field", name: "text_field", type: "text", value: "Enter prompt or input text..." },
          { id: "image_field", name: "image_field", type: "image", value: "" },
        ],
      },
    },
    {
      id: "response",
      type: "Response",
      position: { x: 900, y: 250 },
      deletable: false,
      data: {
        value: "",
      },
    },
  ];

  const initialEdges: any[] = [];

  const workflow = await prisma.workflow.create({
    data: {
      name,
      description: description || "",
      userId,
      nodes: initialNodes,
      edges: initialEdges,
    },
  });

  revalidatePath("/dashboard");
  return workflow;
}

export async function createExampleWorkflow() {
  const userId = await getAuthUserId();

  const exampleNodes = [
    {
      id: "input_1",
      type: "RequestInputs",
      position: { x: 50, y: 200 },
      data: {
        fields: [
          { id: "query_field", name: "User Query", type: "text", value: "Latest AI & LLM breakthroughs today" }
        ]
      }
    },
    {
      id: "tavily_1",
      type: "TavilySearch",
      position: { x: 320, y: 200 },
      data: {
        query: "Latest AI & LLM breakthroughs today"
      }
    },
    {
      id: "gemini_1",
      type: "OpenRouter",
      position: { x: 590, y: 200 },
      data: {
        model: "openrouter/free",
        systemPrompt: "You are an expert tech newsletter editor. Summarize web research findings into an engaging 3-bullet summary.",
        prompt: "Summarize research results."
      }
    },
    {
      id: "telegram_1",
      type: "Telegram",
      position: { x: 860, y: 110 },
      data: {
        chatId: "",
        message: "AI Report summary ready."
      }
    },
    {
      id: "resend_1",
      type: "ResendEmail",
      position: { x: 860, y: 290 },
      data: {
        to: "",
        subject: "⚡ AI Breakthroughs Digest Report",
        body: "Attached automated report."
      }
    },
    {
      id: "response_1",
      type: "Response",
      position: { x: 1130, y: 200 },
      data: {
        value: ""
      }
    }
  ];

  const exampleEdges = [
    {
      id: "e-input_1-query_field-tavily_1-query",
      source: "input_1",
      sourceHandle: "query_field",
      target: "tavily_1",
      targetHandle: "query",
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2.5 }
    },
    {
      id: "e-tavily_1-outputResult-gemini_1-prompt",
      source: "tavily_1",
      sourceHandle: "outputResult",
      target: "gemini_1",
      targetHandle: "prompt",
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2.5 }
    },
    {
      id: "e-gemini_1-response-telegram_1-message",
      source: "gemini_1",
      sourceHandle: "response",
      target: "telegram_1",
      targetHandle: "message",
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2.5 }
    },
    {
      id: "e-gemini_1-response-resend_1-body",
      source: "gemini_1",
      sourceHandle: "response",
      target: "resend_1",
      targetHandle: "body",
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2.5 }
    },
    {
      id: "e-gemini_1-response-response_1-value",
      source: "gemini_1",
      sourceHandle: "response",
      target: "response_1",
      targetHandle: "value",
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2.5 }
    }
  ];

  const workflow = await prisma.workflow.create({
    data: {
      name: "⚡ AI Web Research & Dual Alert Pipeline",
      description: "Pre-wired end-to-end automation: Request Inputs -> Web Search -> LLM Engine -> Telegram Bot & Send Email",
      userId,
      nodes: exampleNodes as any,
      edges: exampleEdges as any,
    },
  });

  revalidatePath("/dashboard");
  return workflow;
}

export async function updateWorkflow(id: string, nodes: any[], edges: any[]) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.updateMany({
    where: { id, userId },
    data: {
      nodes: nodes as any,
      edges: edges as any,
    },
  });

  return workflow;
}

export async function renameWorkflow(id: string, name: string, description?: string) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.updateMany({
    where: { id, userId },
    data: {
      name,
      ...(description !== undefined ? { description } : {}),
    },
  });

  revalidatePath("/dashboard");
  return workflow;
}

export async function deleteWorkflow(id: string) {
  const userId = await getAuthUserId();

  await prisma.workflow.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getWorkflowRuns(workflowId: string) {
  const userId = await getAuthUserId();

  return prisma.workflowRun.findMany({
    where: {
      workflowId,
      workflow: {
        userId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      nodeRuns: {
        orderBy: {
          startedAt: "asc",
        },
      },
    },
  });
}

export async function importWorkflow(name: string, nodes: any[], edges: any[], description?: string) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.create({
    data: {
      name,
      description: description || "Imported workflow layout JSON",
      userId,
      nodes: nodes as any,
      edges: edges as any,
    },
  });

  revalidatePath("/dashboard");
  return workflow;
}

export async function getUserCredits() {
  const userId = await getAuthUserId();
  let record = await prisma.userCredits.findUnique({ where: { userId } });
  if (!record) {
    record = await prisma.userCredits.create({
      data: { userId, freeCredits: 100, paidCredits: 0, cycleStartDate: new Date() },
    });
  }
  const total = record.freeCredits + record.paidCredits;
  const cycleStart = new Date(record.cycleStartDate);
  const resetDate = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    freeCredits: record.freeCredits,
    paidCredits: record.paidCredits,
    total,
    resetDate: resetDate.toISOString(),
  };
}

export async function testTelegramConnection(chatId: string, secretTag?: string) {
  if (!chatId || !chatId.trim()) {
    return { success: false, error: "Chat ID cannot be empty." };
  }

  let botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  if (secretTag && secretTag.trim()) {
    const sec = await prisma.workflowSecret.findFirst({
      where: { key: secretTag.toUpperCase() }
    });
    if (sec && sec.encryptedVal) {
      botToken = sec.encryptedVal;
    }
  }

  const rawId = chatId.trim();
  const candidateIds = [rawId];
  if (!rawId.startsWith("-") && !rawId.startsWith("@")) {
    candidateIds.push(`-100${rawId}`);
    candidateIds.push(`@${rawId}`);
  }

  let lastError = "";

  for (const candidate of candidateIds) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: candidate,
          text: "👋 Hello World! Your Telegram Chat is successfully connected to NextFlow Automation.",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        return {
          success: true,
          formattedChatId: candidate,
          message: `Hello World test message sent successfully to Chat ID (${candidate})!`,
        };
      } else {
        lastError = data.description || "Bad Request: Chat not found.";
      }
    } catch (err: any) {
      lastError = err.message || "Network error connecting to Telegram API.";
    }
  }

  return {
    success: false,
    error: `Telegram Error (${lastError}). Make sure to add @asprin_dev_bot to your group/channel and send a message first!`,
  };
}

export async function getLatestTelegramChatId(secretTag?: string) {
  let botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  if (secretTag && secretTag.trim()) {
    const sec = await prisma.workflowSecret.findFirst({
      where: { key: secretTag.toUpperCase() }
    });
    if (sec && sec.encryptedVal) {
      botToken = sec.encryptedVal;
    }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const data = await res.json();
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      const lastUpdate = data.result[data.result.length - 1];
      const chat = lastUpdate.message?.chat || lastUpdate.channel_post?.chat || lastUpdate.my_chat_member?.chat;
      if (chat && chat.id) {
        return {
          success: true,
          chatId: String(chat.id),
          chatTitle: chat.title || chat.username || chat.first_name || "Detected Chat",
        };
      }
    }
    return {
      success: false,
      error: "No recent messages found. Please add @asprin_dev_bot to your chat/group and send /start or a message, then try auto-detecting again!"
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch updates from Telegram." };
  }
}

export async function testResendEmailConnection(toEmail: string, secretTag?: string) {
  if (!toEmail || !toEmail.trim()) {
    return { success: false, error: "Recipient Email address is required." };
  }

  let apiKey = process.env.RESEND_API_KEY || "";

  if (secretTag && secretTag.trim()) {
    const sec = await prisma.workflowSecret.findFirst({
      where: { key: secretTag.toUpperCase() }
    });
    if (sec && sec.encryptedVal) {
      apiKey = sec.encryptedVal;
    }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "notifications@amberbisht.me",
        to: [toEmail.trim()],
        subject: "⚡ NextFlow Test Ping: Email Connection Verified",
        html: "<p>👋 Hello World!</p><p>Your Resend Email service is successfully connected to <strong>NextFlow Automation</strong>.</p>",
      }),
    });

    const data = await res.json();
    if (res.ok) {
      return {
        success: true,
        message: `Hello World test email sent successfully to ${toEmail.trim()}!`,
      };
    } else {
      return {
        success: false,
        error: data.message || data.name || "Failed to send email via Resend API.",
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Network error connecting to Resend API." };
  }
}

