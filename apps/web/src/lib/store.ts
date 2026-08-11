import { create } from "zustand";
import { 
  Connection, 
  Edge, 
  Node, 
  addEdge, 
  OnNodesChange, 
  OnEdgesChange, 
  applyNodeChanges, 
  applyEdgeChanges 
} from "@xyflow/react";

export interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  undoStack: { nodes: Node[]; edges: Edge[] }[];
  redoStack: { nodes: Node[]; edges: Edge[] }[];
  
  // Execution & UI View State
  workflowId: string | null;
  selectedNodeId: string | null;
  viewMode: "COMPACT" | "EXPANDED";
  runningNodeIds: string[];
  runStatus: "IDLE" | "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL";
  activeRunId: string | null;

  setWorkflowId: (workflowId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setViewMode: (mode: "COMPACT" | "EXPANDED") => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  
  // Undo / Redo
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Modifying custom node values
  updateNodeData: (nodeId: string, key: string, value: any) => void;
  updateNodeFieldVal: (nodeId: string, fieldId: string, value: any) => void;
  
  // Request-Inputs field actions
  addField: (nodeId: string, type: "text" | "image", name: string) => void;
  removeField: (nodeId: string, fieldId: string) => void;
  renameField: (nodeId: string, fieldId: string, newName: string) => void;

  // Delete an entire node and its edges
  deleteNode: (nodeId: string) => void;

  // Running nodes
  setRunningNodes: (ids: string[]) => void;
  setRunStatus: (status: "IDLE" | "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL") => void;
  setActiveRunId: (runId: string | null) => void;
  
  // Clear layout (when importing)
  importLayout: (nodes: Node[], edges: Edge[]) => void;
}

// Port matching helper
export const getPortType = (nodeType: string | undefined, handleId: string | null): string => {
  if (!nodeType || !handleId) return "text";
  
  if (nodeType === "RequestInputs") {
    if (handleId.startsWith("text_")) return "text";
    if (handleId.startsWith("image_")) return "image";
  }
  if (nodeType === "CropImage") {
    if (handleId === "inputImage" || handleId === "outputImage") return "image";
    return "text"; // x, y, w, h are text/numbers
  }
  if (nodeType === "Gemini") {
    if (handleId === "response" || handleId === "prompt" || handleId === "systemPrompt") return "text";
    if (handleId === "image") return "image";
    if (handleId === "video") return "video";
    if (handleId === "audio") return "audio";
    if (handleId === "file") return "file";
  }
  if (nodeType === "Response") {
    return "text";
  }
  return "text";
};

// DAG check helper
export const checkCycle = (
  targetId: string,
  sourceId: string,
  edges: { source: string; target: string }[]
): boolean => {
  if (targetId === sourceId) return true;
  const downstream = edges.filter((e) => e.source === targetId);
  for (const edge of downstream) {
    if (checkCycle(edge.target, sourceId, edges)) return true;
  }
  return false;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  undoStack: [],
  redoStack: [],
  workflowId: null,
  selectedNodeId: null,
  viewMode: "COMPACT",
  runningNodeIds: [],
  runStatus: "IDLE",
  activeRunId: null,

  setWorkflowId: (workflowId) => set({ workflowId }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  takeSnapshot: () => {
    const { nodes, edges, undoStack } = get();
    // Keep max 50 snapshots
    const nextStack = [...undoStack, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
    if (nextStack.length > 50) nextStack.shift();
    set({
      undoStack: nextStack,
      redoStack: [], // clear redo
    });
  },

  undo: () => {
    const { undoStack, redoStack, nodes, edges } = get();
    if (undoStack.length === 0) return;
    
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const newRedo = [...redoStack, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      undoStack: newUndo,
      redoStack: newRedo,
    });
  },

  redo: () => {
    const { undoStack, redoStack, nodes, edges } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    const newUndo = [...undoStack, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];

    set({
      nodes: next.nodes,
      edges: next.edges,
      undoStack: newUndo,
      redoStack: newRedo,
    });
  },

  onNodesChange: (changes) => {
    const oldNodes = get().nodes;
    const newNodes = applyNodeChanges(changes, oldNodes);
    
    // We only take a snapshot on meaningful change, e.g. when dragging stops or dimensions change,
    // not on every single pixel movement (which happens during position changes).
    const hasFinishedDrag = changes.some((c) => c.type === "position" && !c.dragging);
    const hasSelection = changes.some((c) => c.type === "select");
    const hasRemoval = changes.some((c) => c.type === "remove");

    if (hasFinishedDrag || hasRemoval) {
      get().takeSnapshot();
    }

    set({ nodes: newNodes });
  },

  onEdgesChange: (changes) => {
    const oldEdges = get().edges;
    const newEdges = applyEdgeChanges(changes, oldEdges);
    
    const hasRemoval = changes.some((c) => c.type === "remove");
    if (hasRemoval) {
      get().takeSnapshot();
    }

    set({ edges: newEdges });
  },

  onConnect: (connection) => {
    const { nodes, edges } = get();
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return;

    // 1. Type check
    const sourceType = getPortType(sourceNode.type, connection.sourceHandle);
    const targetType = getPortType(targetNode.type, connection.targetHandle);
    
    if (sourceType !== targetType) {
      // Types do not match! Invalid drag.
      return;
    }

    // 2. DAG check (prevent cycles)
    const wouldCreateCycle = checkCycle(connection.target, connection.source, edges);
    if (wouldCreateCycle) {
      return;
    }

    get().takeSnapshot();
    
    const strokeColor = sourceType === "image" ? "#3b82f6" : "#f97316";

    // Add edge with dynamic styling (blue for images, orange for text)
    const newEdge: Edge = {
      ...connection,
      id: `e-${connection.source}-${connection.sourceHandle || ""}-${connection.target}-${connection.targetHandle || ""}`,
      animated: true,
      style: { stroke: strokeColor, strokeWidth: 2.5 },
    } as Edge;

    set({
      edges: addEdge(newEdge, edges),
    });
  },

  updateNodeData: (nodeId, key, value) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              [key]: value,
            },
          };
        }
        return n;
      }),
    });
  },

  updateNodeFieldVal: (nodeId, fieldId, value) => {
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId && n.type === "RequestInputs") {
          const fields = (n.data.fields as any[]).map((f) => 
            f.id === fieldId ? { ...f, value } : f
          );
          return { ...n, data: { ...n.data, fields } };
        }
        return n;
      }),
    });
  },

  addField: (nodeId, type, name) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId && n.type === "RequestInputs") {
          // Generate unique ID
          const fields = [...(n.data.fields as any[])];
          const id = `${type}_field_${Date.now()}`;
          fields.push({ id, name, type, value: "" });
          return {
            ...n,
            data: { ...n.data, fields },
          };
        }
        return n;
      }),
    });
  },

  removeField: (nodeId, fieldId) => {
    get().takeSnapshot();
    
    // 1. Remove the field from the RequestInputs node
    const updatedNodes = get().nodes.map((n) => {
      if (n.id === nodeId && n.type === "RequestInputs") {
        const fields = (n.data.fields as any[]).filter((f) => f.id !== fieldId);
        return {
          ...n,
          data: { ...n.data, fields },
        };
      }
      return n;
    });

    // 2. Remove any connected edges sourcing from this field ID
    const updatedEdges = get().edges.filter(
      (e) => !(e.source === nodeId && e.sourceHandle === fieldId)
    );

    set({
      nodes: updatedNodes,
      edges: updatedEdges,
    });
  },

  renameField: (nodeId, fieldId, newName) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.map((n) => {
        if (n.id === nodeId && n.type === "RequestInputs") {
          const fields = (n.data.fields as any[]).map((f) => 
            f.id === fieldId ? { ...f, name: newName } : f
          );
          return {
            ...n,
            data: { ...n.data, fields },
          };
        }
        return n;
      }),
    });
  },

  setRunningNodes: (ids) => set({ runningNodeIds: ids }),
  setRunStatus: (status) => set({ runStatus: status }),
  setActiveRunId: (runId) => set({ activeRunId: runId }),

  deleteNode: (nodeId) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    });
  },

  importLayout: (nodes, edges) => {
    get().takeSnapshot();
    set({
      nodes,
      edges,
      redoStack: [],
    });
  },
}));
