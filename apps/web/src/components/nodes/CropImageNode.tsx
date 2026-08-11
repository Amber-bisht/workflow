"use client";

import { Handle, Position } from "@xyflow/react";
import { Crop } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface CropImageNodeProps {
  id: string;
  data: {
    x?: number | string;
    y?: number | string;
    w?: number | string;
    h?: number | string;
    outputImage?: string;
  };
  selected?: boolean;
}

export default function CropImageNode({ id, data, selected }: CropImageNodeProps) {
  const { runningNodeIds, setSelectedNodeId } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      <div
        className={`w-[85px] h-[85px] bg-[#14151f] border-2 ${
          isRunning
            ? "border-indigo-400 ring-4 ring-indigo-400/30 animate-pulse"
            : selected
            ? "border-indigo-400 ring-2 ring-indigo-400/50 shadow-xl"
            : "border-neutral-800 hover:border-indigo-400/70 shadow-lg"
        } rounded-2xl flex flex-col items-center justify-center relative transition-all`}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="inputImage"
          className="!w-3.5 !h-3.5 !bg-indigo-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-left-2"
        />

        <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-md group-hover:scale-110 transition-transform">
          <Crop className="w-6 h-6" />
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="outputImage"
          className="!w-3.5 !h-3.5 !bg-indigo-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-right-2"
        />
      </div>

      <div className="mt-2 text-center max-w-[140px]">
        <h4 className="font-bold text-neutral-900 text-xs tracking-tight truncate group-hover:text-indigo-600 transition-colors">
          Crop Image
        </h4>
        <span className="text-[10px] text-neutral-700 font-mono font-semibold block truncate">
          Media Tool
        </span>
      </div>
    </div>
  );
}
