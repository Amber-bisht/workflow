"use client";

import { Handle, Position } from "@xyflow/react";
import { Check, Clipboard, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useWorkflowStore } from "@/lib/store";

interface ResponseNodeProps {
  id: string;
  data: {
    value?: string;
  };
  selected?: boolean;
}

export default function ResponseNode({ id, data, selected }: ResponseNodeProps) {
  const { runningNodeIds, deleteNode } = useWorkflowStore();
  const [copied, setCopied] = useState(false);

  const isRunning = runningNodeIds.includes(id);
  const resultValue = data.value || "";

  const handleCopy = () => {
    if (!resultValue) return;
    navigator.clipboard.writeText(resultValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`w-[280px] bg-white text-neutral-800 border ${
        isRunning
          ? "node-running"
          : selected
          ? "border-violet-500/85 shadow-[0_4px_20px_rgba(139,92,246,0.15)]"
          : "border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      } rounded-xl text-xs transition-all relative`}
    >
      {/* Node Header */}
      <div className="bg-neutral-50/80 border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <div>
            <span className="font-bold text-neutral-800 block">Response</span>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">Final Output</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <Sparkles className="h-2.5 w-2.5 animate-pulse text-blue-500" /> Capturing
            </span>
          )}
          <button
            type="button"
            onClick={() => deleteNode(id)}
            title="Delete node"
            className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Target Result Port (Left Side) */}
      <div className="relative py-2 px-4 border-b border-neutral-100 flex items-center gap-1.5 bg-neutral-50/20">
        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        <span className="font-medium text-neutral-700">result</span>
        <Handle
          type="target"
          position={Position.Left}
          id="result"
          style={{
            top: "50%",
            left: "-6px",
            width: "12px",
            height: "12px",
            backgroundColor: "#f97316",
            border: "2px solid #ffffff",
            zIndex: 50,
            cursor: "crosshair",
          }}
        />
      </div>

      {/* Node Content / Display Captured Value */}
      <div className="p-4 flex flex-col gap-3">
        {resultValue ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Captured Data</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-neutral-800 text-neutral-500 transition-colors text-[10px]"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            {/* If the output contains image URL (like a cropped image) render it, otherwise text */}
            {resultValue.startsWith("http") && (resultValue.includes("transloadit") || resultValue.match(/\.(jpeg|jpg|gif|png|webp)/i)) ? (
              <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 aspect-video flex items-center justify-center p-2">
                <img src={resultValue} alt="Final Cropped Result" className="max-h-28 w-full object-contain" />
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto text-neutral-850 leading-relaxed whitespace-pre-wrap select-all font-mono text-[10px] bg-white p-2.5 border border-neutral-200 rounded-lg">
                {resultValue}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-2 text-center border border-dashed border-neutral-350 rounded-lg bg-neutral-50/50">
            <span className="text-neutral-500 font-medium">Awaiting Execution</span>
            <span className="text-[9px] text-neutral-400 mt-0.5">Run the workflow to capture final output</span>
          </div>
        )}
      </div>
    </div>
  );
}
