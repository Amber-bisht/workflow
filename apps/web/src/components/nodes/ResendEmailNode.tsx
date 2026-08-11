"use client";

import { Position, Handle } from "@xyflow/react";
import { useWorkflowStore } from "@/lib/store";

interface ResendEmailNodeProps {
  id: string;
  data: {
    to?: string;
    subject?: string;
    body?: string;
    credentialId?: string;
    secretTag?: string;
    outputResult?: string;
  };
  selected?: boolean;
}

// Real Resend Mail Vector Logo
function ResendMailLogo({ className = "w-5 h-5 text-rose-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  );
}

export default function ResendEmailNode({ id, data, selected }: ResendEmailNodeProps) {
  const { runningNodeIds, setSelectedNodeId } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const to = data.to || "";

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      {/* Solid Compact Card */}
      <div
        className={`w-[85px] h-[85px] bg-[#14151f] border-2 ${
          isRunning
            ? "border-rose-400 ring-4 ring-rose-400/30 animate-pulse"
            : selected
            ? "border-rose-400 ring-2 ring-rose-400/50 shadow-xl"
            : "border-neutral-800 hover:border-rose-400/70 shadow-lg"
        } rounded-2xl flex flex-col items-center justify-center relative transition-all`}
      >
        {/* Target input handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="body"
          className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-left-2"
        />

        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-md group-hover:scale-110 transition-transform">
          <ResendMailLogo className="w-6 h-6 text-rose-400" />
        </div>

        {/* Source output handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="outputResult"
          className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-right-2"
        />
      </div>

      {/* High-contrast solid text labels below node */}
      <div className="mt-2 text-center max-w-[140px]">
        <h4 className="font-bold text-neutral-900 text-xs tracking-tight truncate group-hover:text-rose-600 transition-colors">
          Resend Email
        </h4>
        <span className="text-[10px] text-neutral-700 font-mono font-semibold block truncate">
          {to ? to : "Transactional Email"}
        </span>
      </div>
    </div>
  );
}
