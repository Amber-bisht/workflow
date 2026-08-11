"use client";

import { useState, useEffect } from "react";
import { Position, Handle } from "@xyflow/react";
import { Send } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface TelegramNodeProps {
  id: string;
  data: {
    message?: string;
    chatId?: string;
    credentialId?: string;
    secretTag?: string;
    outputResult?: string;
  };
  selected?: boolean;
}

export default function TelegramNode({ id, data, selected }: TelegramNodeProps) {
  const { runningNodeIds, workflowId, setSelectedNodeId } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const credentialId = data.credentialId || data.secretTag || "";

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      {/* Solid Compact Card */}
      <div
        className={`w-[85px] h-[85px] bg-[#14151f] border-2 ${
          isRunning
            ? "border-sky-400 ring-4 ring-sky-400/30 animate-pulse"
            : selected
            ? "border-sky-400 ring-2 ring-sky-400/50 shadow-xl"
            : "border-neutral-800 hover:border-sky-400/70 shadow-lg"
        } rounded-2xl flex flex-col items-center justify-center relative transition-all`}
      >
        {/* Target input handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="message"
          className="!w-3.5 !h-3.5 !bg-sky-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-left-2"
        />

        <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-md group-hover:scale-110 transition-transform">
          <Send className="w-6 h-6" />
        </div>

        {/* Source output handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="outputResult"
          className="!w-3.5 !h-3.5 !bg-sky-400 !border-2 !border-[#14151f] transition-transform hover:!scale-125 !-right-2"
        />
      </div>

      {/* High-contrast solid text labels below node */}
      <div className="mt-2 text-center max-w-[140px]">
        <h4 className="font-bold text-neutral-900 text-xs tracking-tight truncate group-hover:text-sky-600 transition-colors">
          Telegram Bot
        </h4>
        <span className="text-[10px] text-neutral-700 font-mono font-semibold block truncate">
          {credentialId ? credentialId : "Default Bot"}
        </span>
      </div>
    </div>
  );
}
