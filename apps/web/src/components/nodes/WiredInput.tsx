"use client";

import React from "react";
import { useWorkflowStore } from "@/lib/store";
import { Link2 } from "lucide-react";

interface WiredInputProps {
  nodeId: string;
  handleId: string;
  label: string;
  type?: string;
  value?: any;
  onChange?: (val: any) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function WiredInput({
  nodeId,
  handleId,
  label,
  type = "text",
  value = "",
  onChange,
  placeholder,
  children,
}: WiredInputProps) {
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);

  // Check if this input handle is targeted by any edge
  const incomingEdge = edges.find(
    (e) => e.target === nodeId && e.targetHandle === handleId
  );

  const isConnected = !!incomingEdge;

  // Get name of upstream node for the badge
  const sourceNode = incomingEdge
    ? nodes.find((n) => n.id === incomingEdge.source)
    : null;

  const sourceNodeName = sourceNode
    ? `${sourceNode.type === "RequestInputs" ? "Request" : sourceNode.type}`
    : "Upstream";

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">
        <span>{label}</span>
        {isConnected && (
          <span className="flex items-center gap-0.5 text-violet-400 font-medium lowercase bg-violet-500/10 px-1 rounded border border-violet-500/20">
            <Link2 className="h-2.5 w-2.5" />
            connected to {sourceNodeName}
          </span>
        )}
      </div>

      {children ? (
        <div className={isConnected ? "opacity-50 pointer-events-none" : ""}>
          {children}
        </div>
      ) : type === "textarea" ? (
        <textarea
          disabled={isConnected}
          placeholder={isConnected ? "Linked to connection..." : placeholder}
          value={isConnected ? "" : value}
          onChange={(e) => onChange && onChange(e.target.value)}
          rows={4}
          className={`w-full bg-white border text-neutral-800 placeholder-neutral-400 rounded-md p-2 focus:outline-none transition-all resize-y overflow-y-auto min-h-[80px] ${
            isConnected
              ? "border-neutral-200 bg-neutral-50/50 text-neutral-400 cursor-not-allowed select-none opacity-60"
              : "border-neutral-200 focus:border-violet-500/40"
          }`}
        />
      ) : (
        <input
          type={type}
          disabled={isConnected}
          placeholder={isConnected ? "Linked to connection..." : placeholder}
          value={isConnected ? "" : value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={`w-full bg-white border text-neutral-800 placeholder-neutral-400 rounded-md px-2.5 py-1.5 focus:outline-none transition-all ${
            isConnected
              ? "border-neutral-200 bg-neutral-50/50 text-neutral-400 cursor-not-allowed select-none opacity-60"
              : "border-neutral-200 focus:border-violet-500/40"
          }`}
        />
      )}
    </div>
  );
}
