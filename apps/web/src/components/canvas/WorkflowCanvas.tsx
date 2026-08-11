"use client";

import { useEffect, useState, useRef } from "react";
import { 
  ReactFlow, 
  Background, 
  BackgroundVariant,
  Controls, 
  MiniMap, 
  ReactFlowProvider, 
  useReactFlow,
  useViewport,
  Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { 
  Undo2, 
  Redo2, 
  Plus, 
  Play, 
  Download, 
  Upload, 
  History, 
  ArrowLeft, 
  Settings2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Minus,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Move,
  Map,
  Key
} from "lucide-react";
import Link from "next/link";

import { useWorkflowStore } from "@/lib/store";
import { nodeTypes } from "../nodes";
import NodePicker from "./NodePicker";
import HistorySidebar from "./HistorySidebar";
import { updateWorkflow } from "@/app/actions/workflow";
import type { Connection } from "@xyflow/react";

// ── Connection type helpers ───────────────────────────────────────────────────
const IMAGE_HANDLES = new Set(["outputImage", "inputImage", "image"]);
const isImageHandle = (h: string) =>
  IMAGE_HANDLES.has(h) || h.includes("image");
const isTextHandle = (h: string) =>
  h === "response" || h === "prompt" || h === "systemPrompt" ||
  h === "result" || h.includes("text");

// Detect if adding source→target would create a cycle (BFS)
function wouldCycle(edges: any[], source: string, target: string): boolean {
  if (source === target) return true;
  const visited = new Set<string>();
  const queue = [target];
  while (queue.length) {
    const node = queue.shift()!;
    if (node === source) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    edges.filter(e => e.source === node).forEach(e => queue.push(e.target));
  }
  return false;
}

interface WorkflowCanvasProps {
  workflowId: string;
  initialName: string;
  initialNodes: any[];
  initialEdges: any[];
  initialRuns: any[];
}

function CanvasInner({ 
  workflowId, 
  initialName, 
  initialNodes, 
  initialEdges, 
  initialRuns 
}: WorkflowCanvasProps) {
  const { 
    nodes, 
    edges, 
    setNodes, 
    setEdges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    undo,
    redo,
    undoStack,
    redoStack,
    updateNodeData,
    importLayout,
    runningNodeIds,
    setRunningNodes,
    runStatus,
    setRunStatus,
    activeRunId,
    setActiveRunId
  } = useWorkflowStore();

  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();

  // Component UI State
  const [runs, setRuns] = useState<any[]>(initialRuns);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isStartingRun, setIsStartingRun] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Viewport / Zoom Controls State
  const { zoom } = useViewport();
  const [isLocked, setIsLocked] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);

  // 1. Initialize canvas state
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    console.info("[NextFlow Canvas] Grid initialized:", {
      workflowId,
      nodesCount: initialNodes.length,
      edgesCount: initialEdges.length,
      background: "White Canvas + 28px Linear Grid",
    });
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // 2. Auto-save layout on changes
  // Debounce saving to avoid excessive db writes
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await updateWorkflow(workflowId, nodes, edges);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [nodes, edges, workflowId]);

  // Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // 3. Execution Polling — stops automatically after 5 minutes or on completion
  useEffect(() => {
    if (!activeRunId) return;

    const MAX_POLLS = 150; // 150 × 2s = 5 minutes max
    let pollCount = 0;

    const stopPolling = (interval: ReturnType<typeof setInterval>) => {
      clearInterval(interval);
      setActiveRunId(null);
      setRunningNodes([]);
      setIsStartingRun(false);
    };

    let pollInterval = setInterval(async () => {
      pollCount++;

      // Safety: stop after 5 minutes to prevent infinite loops
      if (pollCount >= MAX_POLLS) {
        console.warn("[Polling] Timeout reached — marking run as FAILED");
        stopPolling(pollInterval);
        setRunStatus("FAILED");
        setRuns(prev => prev.map(r =>
          r.id === activeRunId ? { ...r, status: "FAILED" } : r
        ));
        return;
      }

      try {
        const response = await fetch(`/api/workflow/run/${activeRunId}`);
        if (!response.ok) return;
        const runData = await response.json();

        // Update run status
        setRunStatus(runData.status);
        
        // Update nodes output data to show visual feedback inline
        if (runData.nodesData?.nodes) {
          setNodes(runData.nodesData.nodes);
        }

        const activeNodeIds = runData.nodeRuns
          .filter((nr: any) => nr.status === "RUNNING")
          .map((nr: any) => nr.nodeId);
        setRunningNodes(activeNodeIds);

        // Live-update the runs list with actual nodeRuns from the DB
        if (runData.nodeRuns?.length > 0) {
          setRuns(prev => prev.map(r =>
            r.id === activeRunId
              ? { ...r, status: runData.status, nodeRuns: runData.nodeRuns }
              : r
          ));
        }

        // Check if finished
        if (runData.status === "SUCCESS" || runData.status === "FAILED") {
          stopPolling(pollInterval);
          // Final update with complete run data
          setRuns(prev => prev.map(r =>
            r.id === activeRunId ? { ...r, ...runData } : r
          ));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [activeRunId, setActiveRunId, setRunStatus, setNodes, setRunningNodes]);

  // 4. Trigger Executions
  const handleRun = async () => {
    setIsStartingRun(true);
    setRunStatus("RUNNING");

    try {
      const res = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
        }),
      });

      const data = await res.json();
      if (data.success && data.runId) {
        setActiveRunId(data.runId);
        
        // Add draft pending run to history immediately with all nodes visible
        const mockRun = {
          id: data.runId,
          status: "PENDING",
          scope: "FULL",
          triggerSource: "MANUAL",
          createdAt: new Date().toISOString(),
          duration: null,
          nodeRuns: nodes.map(node => ({
            id: `node-run-${node.id}`,
            nodeId: node.id,
            nodeType: node.type || "Unknown",
            status: "PENDING",
            duration: null,
            error: null,
            inputs: null,
            outputs: null,
          })),
        };
        setRuns(prev => [mockRun, ...prev]);
        setIsSidebarOpen(true);
      } else {
        throw new Error(data.error || "Failed to trigger execution");
      }
    } catch (err: any) {
      alert(`Execution Error: ${err.message}`);
      setRunStatus("FAILED");
    } finally {
      setIsStartingRun(false);
    }
  };

  // Add new custom nodes from picker
  const handleAddNode = (type: string) => {
    const x = window.innerWidth / 2 - 140;
    const y = window.innerHeight / 2 - 100;
    const position = screenToFlowPosition({ x, y });
    const id = `${type.toLowerCase()}_${Date.now()}`;

    let defaultData: any = {};
    if (type === "CropImage") {
      defaultData = { x: 0, y: 0, w: 100, h: 100 };
    } else if (type === "Gemini" || type === "OpenRouter") {
      defaultData = { model: "openai/gpt-4o", temperature: 0.7, prompt: "" };
    } else if (type === "TavilySearch") {
      defaultData = { query: "Latest AI news" };
    } else if (type === "WebsiteMonitor") {
      defaultData = { url: "https://automation.amberbisht.me" };
    } else if (type === "Telegram") {
      defaultData = { message: "System Alert: Canvas pipeline step completed." };
    } else if (type === "ResendEmail") {
      defaultData = { subject: "Workflow Alert", body: "Automation report" };
    } else if (type === "RequestInputs") {
      defaultData = { prompt: "Default input prompt" };
    } else if (type === "Response") {
      defaultData = {};
    }

    const newNode = {
      id,
      type,
      position,
      data: defaultData,
    };
    setNodes([...nodes, newNode]);
    setIsPickerOpen(false);
  };

  // ── Type-safe connection validator ─────────────────────────────────────────
  const isValidConnection = (connection: Connection | any) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return false;
    // No self-loops
    if (source === target) return false;
    // DAG: no cycles
    if (wouldCycle(edges, source, target)) {
      console.warn("[NextFlow] Connection rejected: would create a cycle");
      return false;
    }
    const sh = sourceHandle || "";
    const th = targetHandle || "";
    // Type guard: image → text or text → image rejected
    if (isImageHandle(sh) && isTextHandle(th)) {
      console.warn("[NextFlow] Connection rejected: image output → text input");
      return false;
    }
    if (isTextHandle(sh) && isImageHandle(th)) {
      console.warn("[NextFlow] Connection rejected: text output → image input");
      return false;
    }
    return true;
  };

  // Export layout to JSON
  const handleExport = () => {
    const layout = {
      workflowId,
      name: initialName,
      exportedAt: new Date().toISOString(),
      schemaVersion: 2,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        animated: edge.animated,
        style: edge.style,
      })),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layout, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${initialName.replace(/\s+/g, "_")}_layout.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import layout from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const layout = JSON.parse(event.target?.result as string);
        if (Array.isArray(layout.nodes) && Array.isArray(layout.edges)) {
          const processedNodes = layout.nodes.map((n: any) => ({
            id: n.id,
            type: n.type,
            position: n.position || { x: 100, y: 100 },
            data: n.data || {},
          }));
          importLayout(processedNodes, layout.edges);
        } else {
          alert("Invalid layout file structure.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const getStatusIndicator = () => {
    switch (runStatus) {
      case "RUNNING":
        return (
          <div className="flex items-center text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 text-xs font-semibold">
            Running
          </div>
        );
      case "SUCCESS":
        return (
          <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-xs font-semibold">
            Success
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 text-xs font-semibold">
            Failed
          </div>
        );
      default:
        return (
          <div className="flex items-center text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800 text-xs font-semibold">
            Idle
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white text-neutral-900 overflow-hidden relative">
      {/* Upper Panel / Navigation Header Layout Wrapper */}
      <header className={`absolute top-4 left-4 z-40 flex items-center justify-between gap-6 pointer-events-none transition-all duration-300 ${
        isSidebarOpen ? "right-[376px]" : "right-4"
      }`}>
        {/* Left Floating Card: Back Button & Workflow Name */}
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl text-white pointer-events-auto">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white border border-transparent hover:border-white/10 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight leading-tight">{initialName}</h1>
          </div>
        </div>

        {/* Right Floating Card: Status & Execution Controls */}
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl text-white pointer-events-auto">
          {getStatusIndicator()}

          {/* Run Execution */}
          <button
            onClick={handleRun}
            disabled={isStartingRun}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:opacity-50 text-black rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current text-black" />
            Run Flow
          </button>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Workflow Secrets Vault Link (Opens in New Tab) */}
          <Link
            href={`/workflow/${workflowId}/vault`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Open Workflow Vault in New Tab (TG_BOT_1, TG_BOT_2...)"
          >
            <Key className="h-4 w-4" />
          </Link>

          {/* Toggle MiniMap button */}
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showMiniMap
                ? "bg-blue-600 border-blue-500 text-white shadow-md"
                : "border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
            title={showMiniMap ? "Hide MiniMap" : "View MiniMap"}
          >
            <Map className="h-4 w-4" />
          </button>

          {/* Toggle sidebar button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSidebarOpen
                ? "bg-blue-600 border-blue-500 text-white shadow-md"
                : "border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
            }`}
            title="Execution History"
          >
            <History className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 h-full w-full relative bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          className="w-full h-full"
          panOnDrag={!isLocked}
          zoomOnScroll={!isLocked}
        >

          {/* MiniMap Floating Overlay */}
          {showMiniMap && (
            <Panel position="bottom-right" className="!m-6 !z-50">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-neutral-900/95 backdrop-blur-2xl p-1 pointer-events-auto">
                <MiniMap
                  zoomable
                  pannable
                  nodeColor={(node) => {
                    if (node.type === "RequestInputs") return "#F59E0B";
                    if (node.type === "CropImage") return "#f97316";
                    if (node.type === "Gemini" || node.type === "OpenRouter") return "#a855f7";
                    if (node.type === "TavilySearch") return "#06b6d4";
                    if (node.type === "WebsiteMonitor") return "#10b981";
                    if (node.type === "Telegram") return "#0ea5e9";
                    if (node.type === "ResendEmail") return "#f43f5e";
                    return "#3b82f6";
                  }}
                  maskColor="rgba(15, 23, 42, 0.75)"
                  style={{
                    position: "relative",
                    bottom: "auto",
                    right: "auto",
                    background: "#090d16",
                    borderRadius: "12px",
                    width: 200,
                    height: 130,
                    margin: 0,
                  }}
                />
                <button
                  onClick={() => setShowMiniMap(false)}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-neutral-950/90 hover:bg-neutral-800 border border-white/15 rounded-lg shadow-md text-neutral-400 hover:text-white cursor-pointer transition-all z-[60]"
                  title="Close MiniMap"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>

        {/* Searchable Picker Popover */}
        {isPickerOpen && (
          <NodePicker
            onSelectNode={handleAddNode}
            onClose={() => setIsPickerOpen(false)}
          />
        )}

        {/* Custom Bottom floating toolbar (Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl text-white">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Add node - only show when workflow is not running */}
          {runStatus !== "RUNNING" && (
            <>
              <button
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-black" />
                Add Node
              </button>
              <div className="h-4 w-[1px] bg-white/10" />
            </>
          )}

          {/* Import/Export */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExport}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Export Layout JSON"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Import Layout JSON"
            >
              <Upload className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Custom Bottom Left Viewport & Zoom Controls */}
        <div className="absolute bottom-6 left-6 z-40 bg-neutral-900/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-2xl text-white transition-all">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title={isControlsCollapsed ? "Expand controls" : "Collapse controls"}
          >
            {isControlsCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {!isControlsCollapsed && (
            <>
              <div className="h-4 w-[1px] bg-white/10" />
              
              {/* Zoom In */}
              <button
                onClick={() => zoomIn()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Zoom In"
              >
                <Plus className="h-4 w-4" />
              </button>

              {/* Zoom Percentage */}
              <span className="text-xs font-mono font-bold text-neutral-300 min-w-[36px] text-center select-none">
                {Math.round(zoom * 100)}%
              </span>

              {/* Zoom Out */}
              <button
                onClick={() => zoomOut()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="h-4 w-[1px] bg-white/10" />

              {/* Fit View */}
              <button
                onClick={() => fitView()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Fit View"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* Viewport Interaction Lock */}
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isLocked ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
                title={isLocked ? "Unlock Viewport" : "Lock Viewport"}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </button>

              {/* Move/Pan Mode Indicator */}
              <div 
                className="p-1 text-neutral-400 cursor-default select-none"
                title={isLocked ? "Viewport locked" : "Pan mode active"}
              >
                <Move className="h-4 w-4" />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Right History Panel */}
      {isSidebarOpen && (
        <HistorySidebar
          runs={runs}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
