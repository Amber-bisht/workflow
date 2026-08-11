"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Activity,
  Loader2,
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

// ── Status Dot component (100% like screenshot) ──────────────────────────────
function StatusDot({ status }: { status: string }) {
  let color = "#9ca3af"; // grey for PENDING/CANCELED
  if (status === "RUNNING") color = "#3b82f6"; // blue
  if (status === "SUCCESS") color = "#10b981"; // green
  if (status === "FAILED") color = "#ef4444"; // red
  
  return (
    <span style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: color,
      display: "inline-block",
      marginRight: 8,
    }} />
  );
}

function statusLabel(status: string) {
  if (status === "RUNNING") return "Running";
  if (status === "SUCCESS") return "Completed";
  if (status === "FAILED") return "Failed";
  return "Canceled";
}

// ── Status icon (Inside Node Checklist) ────────────────────────────────────────
function StatusIcon({ status, size = 16 }: { status: string; size?: number }) {
  if (status === "SUCCESS")
    return <CheckCircle2 style={{ width: size, height: size, color: "#22c55e", flexShrink: 0 }} />;
  if (status === "FAILED")
    return <XCircle style={{ width: size, height: size, color: "#ef4444", flexShrink: 0 }} />;
  return (
    <Loader2 style={{
      width: size, height: size, color: "#f59e0b", flexShrink: 0,
      animation: "spin 1s linear infinite",
    }} />
  );
}

const formatDuration = (sec: number | null) => {
  if (sec === null || sec === undefined) return "N/A";
  return sec < 1 ? `${(sec * 1000).toFixed(0)}ms` : `${sec.toFixed(1)}s`;
};

// Date format 100% same as screenshot: DD/MM/YYYY, HH:MM:SS
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `${dateStr}, ${timeStr}`;
};

// ── Output / Input renderers ───────────────────────────────────────────────────
function renderOutput(outputs: any) {
  if (!outputs) return null;
  const response = outputs?.response ?? outputs?.result;
  if (typeof response === "string") {
    return (
      <div style={{
        fontSize: 13, color: "#262626", lineHeight: 1.6,
        backgroundColor: "#f9fafb", border: "1px solid #e5e5e5",
        borderRadius: 6, padding: "10px 12px",
        overflowY: "auto", maxHeight: 320,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {response}
      </div>
    );
  }
  return (
    <pre style={{
      fontSize: 12, fontFamily: "monospace", color: "#404040",
      backgroundColor: "#f9fafb", border: "1px solid #e5e5e5",
      borderRadius: 6, padding: "10px 12px",
      overflow: "auto", maxHeight: 260,
      whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
    }}>
      {JSON.stringify(outputs, null, 2)}
    </pre>
  );
}

function renderInputs(inputs: any) {
  if (!inputs) return null;
  const clean = JSON.parse(JSON.stringify(inputs));
  if (clean.images) {
    const imgs = Array.isArray(clean.images) ? clean.images : [clean.images];
    clean.images = imgs.map((img: string) =>
      typeof img === "string" && img.startsWith("data:image") ? "[base64 — truncated]" : img
    );
  }
  if (clean.fields) {
    clean.fields = clean.fields.map((f: any) =>
      typeof f.value === "string" && f.value.startsWith("data:image")
        ? { ...f, value: "[base64 — truncated]" }
        : f
    );
  }
  return (
    <pre style={{
      fontSize: 12, fontFamily: "monospace", color: "#737373",
      backgroundColor: "#f9fafb", border: "1px solid #e5e5e5",
      borderRadius: 6, padding: "10px 12px",
      overflow: "auto", maxHeight: 200,
      whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
    }}>
      {JSON.stringify(clean, null, 2)}
    </pre>
  );
}

function nodeLabel(nodeType: string) {
  if (nodeType === "RequestInputs") return "Request Inputs";
  if (nodeType === "CropImage") return "Crop Image";
  if (nodeType === "Gemini") return "Gemini";
  if (nodeType === "Response") return "Response";
  return nodeType;
}

// ── NodeRow ────────────────────────────────────────────────────────────────────
function NodeRow({ node }: { node: NodeRun }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          borderRadius: 6, border: "none", background: "transparent",
          cursor: "pointer", width: "100%", textAlign: "left",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        {/* Left: status + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <StatusIcon status={node.status} size={14} />
          <span style={{
            fontSize: 13, fontWeight: 500, color: "#262626",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {nodeLabel(node.nodeType)}
          </span>
        </div>

        {/* Right: duration + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "#737373" }}>
            {formatDuration(node.duration)}
          </span>
          {expanded
            ? <ChevronDown style={{ width: 13, height: 13, color: "#737373" }} />
            : <ChevronRight style={{ width: 13, height: 13, color: "#737373" }} />}
        </div>
      </button>

      {/* Node detail panel */}
      {expanded && (
        <div style={{
          marginLeft: 0, marginTop: 2, marginBottom: 4,
          border: "1px solid #e5e5e5", borderRadius: 8,
          padding: "12px 14px", backgroundColor: "#f9fafb",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {node.outputs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#16a34a" }}>
                Output
              </span>
              {renderOutput(node.outputs)}
            </div>
          )}
          {node.inputs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#737373" }}>
                Inputs
              </span>
              {renderInputs(node.inputs)}
            </div>
          )}
          {node.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ef4444" }}>
                Error
              </span>
              <div style={{
                fontSize: 12, color: "#b91c1c",
                backgroundColor: "rgba(220,38,38,0.04)",
                border: "1px solid rgba(220,38,38,0.12)",
                borderRadius: 6, padding: "10px 12px",
                overflowY: "auto", maxHeight: 200,
                whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6,
              }}>
                {node.error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── RunRow (Expanded visual styling matching screenshot) ──────────────────────
function RunRow({
  run,
  defaultExpanded,
}: {
  run: WorkflowRun;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  useEffect(() => { setExpanded(defaultExpanded); }, [defaultExpanded]);

  const isRunning = run.status === "RUNNING";

  return (
    <div style={{
      border: isRunning 
        ? "1.5px solid #2563eb" 
        : expanded 
        ? "1px solid rgba(37,99,235,0.3)" 
        : "1px solid #e5e5e5",
      borderRadius: 12,
      backgroundColor: isRunning 
        ? "#f0f7ff" 
        : expanded 
        ? "#f9fafb" 
        : "#ffffff",
      overflow: "hidden",
      transition: "all 0.15s",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    }}>
      {/* Run header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          display: "flex", 
          flexDirection: "column",
          padding: "14px 18px",
          width: "100%", 
          textAlign: "left",
          background: "transparent", 
          border: "none", 
          cursor: "pointer",
          gap: 6,
        }}
      >
        {/* Top Line: Dot, Status Text, and Timestamp */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <StatusDot status={run.status} />
            <span style={{ 
              fontSize: 14, 
              fontWeight: 650, 
              color: isRunning ? "#1d4ed8" : "#1f2937" 
            }}>
              {statusLabel(run.status)}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#9ca3af" }} suppressHydrationWarning>
            {formatDate(run.createdAt)}
          </span>
        </div>

        {/* Bottom Line: Duration only */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {formatDuration(run.duration)}
          </span>
        </div>
      </button>

      {/* Node checklist details */}
      {expanded && (
        <div style={{
          borderTop: "1px solid #e5e5e5",
          padding: "12px 14px",
          backgroundColor: "#fafafa",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#8e8e8e",
            marginBottom: 6, display: "block",
          }}>
            Node Checklist
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {run.nodeRuns.length === 0 ? (
              <span style={{ fontSize: 12, color: "#a3a3a3", padding: "6px 0" }}>
                No node data yet…
              </span>
            ) : (
              run.nodeRuns.map(node => (
                <NodeRow key={node.id} node={node} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main sidebar ───────────────────────────────────────────────────────────────
export default function HistorySidebar({ runs, onClose }: HistorySidebarProps) {
  const [activeTab, setActiveTab] = useState<"ui" | "api">("ui");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "RUNNING" | "SUCCESS" | "FAILED">("ALL");

  // Filtering runs based on current active tab and filter choice
  const filteredRuns = runs.filter(run => {
    // API runs mockup filters
    if (activeTab === "api") return false;
    
    if (statusFilter === "ALL") return true;
    return run.status === statusFilter;
  });

  return (
    <aside style={{
      width: 360,
      borderLeft: "1px solid #e5e5e5",
      backgroundColor: "#ffffff",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      zIndex: 40,
      position: "relative",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px 10px 24px",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        flexShrink: 0,
      }}>
        <h2 style={{ fontWeight: 700, color: "#111827", fontSize: 18, margin: 0 }}>
          Execution History
        </h2>
        <button
          onClick={onClose}
          style={{
            fontSize: 14,
            fontWeight: 500,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#4b5563",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#111827"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; }}
        >
          Close
        </button>
      </div>

      {/* Tab panel selector */}
      <div style={{ padding: "0 24px 16px 24px", flexShrink: 0 }}>
        <div style={{
          display: "flex",
          backgroundColor: "#f3f4f6",
          padding: 4,
          borderRadius: 12,
        }}>
          <button
            onClick={() => setActiveTab("ui")}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: activeTab === "ui" ? "#ffffff" : "transparent",
              color: activeTab === "ui" ? "#1f2937" : "#6b7280",
              boxShadow: activeTab === "ui" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            UI Runs
          </button>
          <button
            onClick={() => setActiveTab("api")}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: activeTab === "api" ? "#ffffff" : "transparent",
              color: activeTab === "api" ? "#1f2937" : "#6b7280",
              boxShadow: activeTab === "api" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            API Runs
          </button>
        </div>
      </div>

      {/* Subheader: Filter & Run History Label */}
      <div style={{
        padding: "0 24px 12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>
          Run history
        </span>
        <div>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            style={{
              fontSize: 12,
              color: "#374151",
              border: "1px solid #e5e5e5",
              borderRadius: 6,
              backgroundColor: "#ffffff",
              padding: "4px 8px",
              outline: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <option value="ALL">All</option>
            <option value="RUNNING">Running</option>
            <option value="SUCCESS">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Run list — scrollable */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 24px 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {activeTab === "api" ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            paddingTop: 80, gap: 12, color: "#737373",
          }}>
            <Activity style={{ width: 36, height: 36, color: "#d4d4d4" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#525252" }}>
              No API executions yet
            </span>
            <span style={{ fontSize: 11, color: "#737373", textAlign: "center", maxWidth: 220, lineHeight: 1.6 }}>
              Trigger runs via our REST API to see them logged here.
            </span>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            paddingTop: 80, gap: 12, color: "#737373",
          }}>
            <Activity style={{ width: 36, height: 36, color: "#d4d4d4" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#525252" }}>
              No executions found
            </span>
            <span style={{ fontSize: 11, color: "#737373", textAlign: "center", maxWidth: 220, lineHeight: 1.6 }}>
              Trigger runs using the "Run Flow" button to see them listed here.
            </span>
          </div>
        ) : (
          filteredRuns.map((run, i) => (
            <RunRow
              key={run.id}
              run={run}
              defaultExpanded={i === 0} // latest run auto-expanded
            />
          ))
        )}
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}
