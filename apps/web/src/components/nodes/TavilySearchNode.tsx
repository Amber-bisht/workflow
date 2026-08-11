"use client";

import { Position, Handle } from "@xyflow/react";
import { Globe } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface TavilySearchNodeProps {
  id: string;
  data: {
    query?: string;
    outputResult?: string;
  };
  selected?: boolean;
}

export default function TavilySearchNode({ id, data, selected }: TavilySearchNodeProps) {
  const { runningNodeIds, setSelectedNodeId } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const query = data.query || "";

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      <div
        className={`w-[85px] h-[85px] bg-[#14151f] border-2 ${
          isRunning
            ? "border-emerald-400 ring-4 ring-emerald-400/30 animate-pulse"
            : selected
            ? "border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl"
            : "border-neutral-800 hover:border-emerald-400/70 shadow-lg"
        } rounded-2xl flex flex-col items-center justify-center relative transition-all`}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="query"
          className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-left-2"
        />

        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-md group-hover:scale-110 transition-transform">
          <Globe className="w-6 h-6" />
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="outputResult"
          className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-right-2"
        />
      </div>

      <div className="mt-2 text-center max-w-[140px]">
        <h4 className="font-bold text-neutral-900 text-xs tracking-tight truncate group-hover:text-emerald-600 transition-colors">
          Tavily Web Search
        </h4>
        <span className="text-[10px] text-neutral-700 font-mono font-semibold block truncate">
          {query ? query : "Live Search"}
        </span>
      </div>
    </div>
  );
}
