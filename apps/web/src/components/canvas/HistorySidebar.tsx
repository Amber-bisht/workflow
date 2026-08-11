"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Activity,
  Loader2,
  X,
  Sparkles,
  Copy,
  Check,
  GripVertical
} from "lucide-react";

interface NodeRun {
  id: string;
  nodeId: string;
  nodeType: string;
  status: string;
  duration: number | null;
  error: string | null;
  inputs: any;
  outputs: any;
  startedAt: string | null;
  completedAt: string | null;
}

interface WorkflowRun {
  id: string;
  status: string;
  duration: number | null;
  scope: string;
  triggerSource: string;
  createdAt: string;
  nodeRuns: NodeRun[];
}

interface HistorySidebarProps {
  runs: WorkflowRun[];
  onClose: () => void;
  onSelectRunSnapshot?: (snapshot: any) => void;
}

function StatusIcon({ status, size = 16 }: { status: string; size?: number }) {
  if (status === "SUCCESS")
    return <CheckCircle2 className="text-emerald-600 shrink-0" style={{ width: size, height: size }} />;
  if (status === "FAILED")
    return <XCircle className="text-red-600 shrink-0" style={{ width: size, height: size }} />;
  return (
    <Loader2 className="text-amber-500 animate-spin shrink-0" style={{ width: size, height: size }} />
  );
}

const formatDuration = (sec: number | null) => {
  if (sec === null || sec === undefined) return "N/A";
  return sec < 1 ? `${(sec * 1000).toFixed(0)}ms` : `${sec.toFixed(1)}s`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${dateStr}, ${timeStr}`;
};

function nodeLabel(nodeType: string) {
  if (nodeType === "RequestInputs") return "Request Inputs";
  if (nodeType === "CropImage") return "Crop Image";
  if (nodeType === "Gemini" || nodeType === "OpenRouter") return "AI LLM Engine";
  if (nodeType === "Response") return "Workflow Output";
  if (nodeType === "TavilySearch") return "Web Search";
  if (nodeType === "ResendEmail") return "Resend Email";
  if (nodeType === "Telegram" || nodeType === "TelegramSend") return "Telegram Alert";
  return nodeType;
}

// Extract main output response from a run
function getRunFinalResponse(run: WorkflowRun): string | null {
  if (!run.nodeRuns || run.nodeRuns.length === 0) return null;
  for (const node of run.nodeRuns) {
    if (node.outputs) {
      const resp = node.outputs.response || node.outputs.answer || node.outputs.result;
      if (resp && typeof resp === "string" && resp.trim() !== "") {
        return resp;
      }
    }
  }
  return null;
}

function NodeRow({ node }: { node: NodeRun }) {
  const [expanded, setExpanded] = useState(false);
  const responseText = node.outputs?.response || node.outputs?.answer;

  return (
    <div className="flex flex-col border border-neutral-200 rounded-lg overflow-hidden bg-white mb-2">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between p-3 hover:bg-neutral-50 transition-colors w-full text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusIcon status={node.status} size={16} />
          <span className="text-xs font-bold text-neutral-900 truncate">
            {nodeLabel(node.nodeType)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-neutral-500 font-semibold">
            {formatDuration(node.duration)}
          </span>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/70 space-y-3 text-xs">
          {node.outputs && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                Output
              </span>
              {responseText && typeof responseText === "string" ? (
                <div className="p-2.5 bg-white border border-neutral-200 rounded text-neutral-800 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {responseText}
                </div>
              ) : (
                <pre className="p-2.5 bg-white border border-neutral-200 rounded text-neutral-700 font-mono text-[11px] max-h-48 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(node.outputs, null, 2)}
                </pre>
              )}
            </div>
          )}

          {node.error && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 block">
                Error Details
              </span>
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                {node.error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RunRow({ run, defaultExpanded }: { run: WorkflowRun; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setExpanded(defaultExpanded); }, [defaultExpanded]);

  const finalResponse = getRunFinalResponse(run);
  const isRunning = run.status === "RUNNING";
  const isSuccess = run.status === "SUCCESS";
  const isFailed = run.status === "FAILED";

  const handleCopyOutput = () => {
    if (finalResponse) {
      navigator.clipboard.writeText(finalResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`border rounded-xl bg-white shadow-sm overflow-hidden transition-all ${
        isRunning
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : isFailed
          ? "border-neutral-300"
          : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      {/* Run Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full p-3.5 text-left flex flex-col gap-2 hover:bg-neutral-50/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSuccess
                  ? "bg-emerald-500"
                  : isFailed
                  ? "bg-red-500"
                  : "bg-blue-500 animate-pulse"
              }`}
            />
            <span className="text-xs font-black text-neutral-900 uppercase tracking-wide">
              {run.status}
            </span>
          </div>

          <span className="text-[11px] font-mono text-neutral-500" suppressHydrationWarning>
            {formatDate(run.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between w-full pt-1 text-xs">
          <span className="text-neutral-500 font-medium">Duration:</span>
          <span className="font-mono font-bold text-neutral-800">
            {formatDuration(run.duration)}
          </span>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-neutral-200 p-3.5 bg-neutral-50 space-y-4">
          {/* Output Card */}
          {finalResponse && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Workflow Output Summary</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  className="text-[10px] text-neutral-600 hover:text-black font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Output</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-900 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans shadow-sm">
                {finalResponse}
              </div>
            </div>
          )}

          {/* Node Checklist */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">
              Node Execution Checklist ({run.nodeRuns.length})
            </span>

            {run.nodeRuns.length === 0 ? (
              <span className="text-xs text-neutral-400 block py-1">
                No node data recorded yet...
              </span>
            ) : (
              run.nodeRuns.map((node) => (
                <NodeRow key={node.id} node={node} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistorySidebar({ runs, onClose }: HistorySidebarProps) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "RUNNING" | "SUCCESS" | "FAILED">("ALL");
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 320 && newWidth <= 850) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const filteredRuns = runs.filter((run) => {
    if (statusFilter === "ALL") return true;
    return run.status === statusFilter;
  });

  return (
    <aside 
      style={{ width: sidebarWidth }}
      className="border-l border-neutral-800 bg-white h-full flex flex-col z-40 relative shadow-2xl transition-none select-none"
    >
      {/* Left Drag Resizer Handle */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className="absolute top-0 bottom-0 -left-2.5 w-5 cursor-ew-resize hover:bg-sky-500/30 active:bg-sky-500/50 z-50 flex items-center justify-center transition-colors group"
        title="Click & drag left/right to resize drawer"
      >
        <div className="w-1 h-10 rounded-full bg-neutral-400/60 group-hover:bg-sky-500 transition-colors flex items-center justify-center">
          <GripVertical className="w-3 h-3 text-white opacity-0 group-hover:opacity-100" />
        </div>
      </div>

      {/* Solid Black Header Section */}
      <div className="p-5 border-b border-neutral-800 bg-[#09090b] flex items-center justify-between shrink-0 text-white">
        <div>
          <h2 className="font-extrabold text-white text-base tracking-tight">
            Execution History
          </h2>
          <p className="text-xs text-neutral-400 font-medium">Real-time workflow run logs</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Header */}
      <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-neutral-50">
        <span className="text-xs font-bold text-neutral-600">
          Total Runs ({filteredRuns.length})
        </span>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="text-xs font-bold text-neutral-800 bg-white border border-neutral-300 rounded px-2.5 py-1 focus:outline-none focus:border-neutral-900 cursor-pointer"
        >
          <option value="ALL">All Runs</option>
          <option value="SUCCESS">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="RUNNING">Running</option>
        </select>
      </div>

      {/* Run List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50">
        {filteredRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
            <Activity className="w-8 h-8 text-neutral-300" />
            <span className="text-xs font-bold text-neutral-600">No execution logs found</span>
            <span className="text-[11px] text-neutral-400 text-center max-w-[200px]">
              Click "Run Flow" on the canvas to execute your workflow.
            </span>
          </div>
        ) : (
          filteredRuns.map((run, i) => (
            <RunRow key={run.id} run={run} defaultExpanded={i === 0} />
          ))
        )}
      </div>
    </aside>
  );
}
