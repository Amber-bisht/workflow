"use client";

import { Handle, Position } from "@xyflow/react";
import { FileText } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface ResponseNodeProps {
  id: string;
  data: {
    value?: string;
  };
  selected?: boolean;
}

export default function ResponseNode({ id, data, selected }: ResponseNodeProps) {
  const { runningNodeIds, setSelectedNodeId } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const resultValue = data.value || "";

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      <div
        className={`w-[85px] h-[85px] bg-[#14151f] border-2 ${
          isRunning
            ? "border-blue-400 ring-4 ring-blue-400/30 animate-pulse"
            : selected
            ? "border-blue-400 ring-2 ring-blue-400/50 shadow-xl"
            : "border-neutral-800 hover:border-blue-400/70 shadow-lg"
        } rounded-2xl flex flex-col items-center justify-center relative transition-all`}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="value"
          className="!w-3.5 !h-3.5 !bg-blue-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-left-2"
        />

        <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-md group-hover:scale-110 transition-transform">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-2 text-center max-w-[140px]">
        <h4 className="font-bold text-neutral-900 text-xs tracking-tight truncate group-hover:text-blue-600 transition-colors">
          Workflow Response
        </h4>
        <span className="text-[10px] text-neutral-700 font-mono font-semibold block truncate">
          {resultValue ? "Complete Result" : "Output Payload"}
        </span>
      </div>
    </div>
  );
}
