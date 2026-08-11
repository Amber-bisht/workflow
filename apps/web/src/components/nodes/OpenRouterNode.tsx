"use client";

import { Position, Handle } from "@xyflow/react";
import { Bot } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface OpenRouterNodeProps {
  id: string;
  data: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    prompt?: string;
    systemPrompt?: string;
    response?: string;
  };
  selected?: boolean;
}

export default function OpenRouterNode({ id, data, selected }: OpenRouterNodeProps) {
  const { runningNodeIds, setSelectedNodeId } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const model = data.model || "google/gemini-2.0-flash-001";

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      <div
        className={`w-[85px] h-[85px] bg-[#14151f] border-2 ${
          isRunning
            ? "border-purple-400 ring-4 ring-purple-400/30 animate-pulse"
            : selected
            ? "border-purple-400 ring-2 ring-purple-400/50 shadow-xl"
            : "border-neutral-800 hover:border-purple-400/70 shadow-lg"
        } rounded-2xl flex flex-col items-center justify-center relative transition-all`}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="prompt"
          className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-left-2"
        />

        <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-md group-hover:scale-110 transition-transform">
          <Bot className="w-6 h-6" />
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="response"
          className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-right-2"
        />
      </div>

      <div className="mt-2 text-center max-w-[140px]">
        <h4 className="font-bold text-neutral-900 text-xs tracking-tight truncate group-hover:text-purple-600 transition-colors">
          LLM Engine
        </h4>
        <span className="text-[10px] text-neutral-700 font-mono font-semibold block truncate">
          {model.split("/").pop()}
        </span>
      </div>
    </div>
  );
}
