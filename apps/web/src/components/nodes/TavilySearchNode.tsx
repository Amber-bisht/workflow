"use client";

import { Position, Handle } from "@xyflow/react";
import { Search, X, Sparkles } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { WiredInput } from "./WiredInput";

interface TavilySearchNodeProps {
  id: string;
  data: {
    query?: string;
    outputResults?: string;
  };
  selected?: boolean;
}

export default function TavilySearchNode({ id, data, selected }: TavilySearchNodeProps) {
  const { updateNodeData, runningNodeIds, deleteNode } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const query = data.query || "";
  const results = data.outputResults || "";

  return (
    <div
      className={`w-[290px] bg-white text-neutral-800 border ${
        isRunning
          ? "node-running"
          : selected
          ? "border-cyan-500/85 shadow-[0_4px_20px_rgba(6,182,212,0.15)]"
          : "border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      } rounded-xl text-xs transition-all relative`}
    >
      {/* Node Header */}
      <div className="bg-neutral-50/80 border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200/60">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-800 leading-tight">Tavily Web Search</h4>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">Web Search API (3 Credits)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
              <Sparkles className="h-2.5 w-2.5 animate-pulse text-cyan-500" /> Searching
            </span>
          )}
          <button
            type="button"
            onClick={() => deleteNode(id)}
            title="Delete node"
            className="p-1 rounded text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Input Handle for Search Query */}
      <div className="py-2.5 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20 relative">
        <Handle
          type="target"
          position={Position.Left}
          id="query"
          className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white transition-transform hover:!scale-125"
        />
        <div className="flex-1">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Search Query
          </label>
          <WiredInput
            nodeId={id}
            handleId="query"
            label="Search Query"
            value={query}
            onChange={(val) => updateNodeData(id, "query", val)}
            placeholder="Search topic or question..."
            type="textarea"
          />
        </div>
      </div>

      {/* Results Output */}
      {results && (
        <div className="p-3 bg-neutral-50 rounded-b-xl border-t border-neutral-200/60 max-h-[140px] overflow-y-auto">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Search Results Payload
          </span>
          <pre className="text-[10px] font-mono text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {results}
          </pre>
        </div>
      )}

      {/* Output Handle for Results */}
      <div className="relative py-2 px-4 flex items-center justify-end bg-neutral-50/50 rounded-b-xl">
        <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mr-2">
          Search Output
        </span>
        <Handle
          type="source"
          position={Position.Right}
          id="outputResults"
          className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white transition-transform hover:!scale-125"
        />
      </div>
    </div>
  );
}
