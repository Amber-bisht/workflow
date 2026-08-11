"use client";

import { Handle, Position } from "@xyflow/react";
import { Sliders } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface RequestInputsNodeProps {
  id: string;
  data: {
    fields?: {
      id: string;
      name: string;
      type: "text" | "image";
      value: string;
    }[];
  };
  selected?: boolean;
}

export default function RequestInputsNode({ id, data, selected }: RequestInputsNodeProps) {
  const { setSelectedNodeId } = useWorkflowStore();
  const fields = data?.fields || [];

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      <div
        className={`w-[85px] h-[85px] bg-[#14151f] border-2 ${
          selected
            ? "border-amber-400 ring-2 ring-amber-400/50 shadow-xl"
            : "border-neutral-800 hover:border-amber-400/70 shadow-lg"
        } rounded-2xl flex flex-col items-center justify-center relative transition-all`}
      >
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-md group-hover:scale-110 transition-transform">
          <Sliders className="w-6 h-6" />
        </div>

        {/* Output handles for fields */}
        {fields.map((f, i) => (
          <Handle
            key={f.id}
            type="source"
            position={Position.Right}
            id={f.id}
            style={{ top: `${((i + 1) * 100) / (fields.length + 1)}%` }}
            className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-right-2"
          />
        ))}
        {fields.length === 0 && (
          <Handle
            type="source"
            position={Position.Right}
            id="text_1"
            className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-right-2"
          />
        )}
      </div>

      <div className="mt-2 text-center max-w-[140px]">
        <h4 className="font-bold text-neutral-900 text-xs tracking-tight truncate group-hover:text-amber-600 transition-colors">
          Workflow Config
        </h4>
        <span className="text-[10px] text-neutral-700 font-mono font-semibold block truncate">
          {fields.length > 0 ? `${fields.length} Inputs` : "Manual Form"}
        </span>
      </div>
    </div>
  );
}
