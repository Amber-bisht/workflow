"use client";

import { Position, Handle } from "@xyflow/react";
import { Activity, X, Sparkles } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { WiredInput } from "./WiredInput";

interface WebsiteMonitorNodeProps {
  id: string;
  data: {
    url?: string;
    outputStatus?: string;
  };
  selected?: boolean;
}

export default function WebsiteMonitorNode({ id, data, selected }: WebsiteMonitorNodeProps) {
  const { updateNodeData, runningNodeIds, deleteNode } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const targetUrl = data.url || "https://automation.amberbisht.me";
  const outputStatus = data.outputStatus || "";

  return (
    <div
      className={`w-[290px] bg-white text-neutral-800 border ${
        isRunning
          ? "node-running"
          : selected
          ? "border-emerald-500/85 shadow-[0_4px_20px_rgba(16,185,129,0.15)]"
          : "border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      } rounded-xl text-xs transition-all relative`}
    >
      {/* Node Header */}
      <div className="bg-neutral-50/80 border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-800 leading-tight">Uptime Monitor</h4>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">Website Availability Check</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="h-2.5 w-2.5 animate-pulse text-emerald-500" /> Checking
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

      {/* Target URL Input */}
      <div className="py-2.5 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20 relative">
        <Handle
          type="target"
          position={Position.Left}
          id="url"
          className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white transition-transform hover:!scale-125"
        />
        <div className="flex-1">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Target Website URL
          </label>
          <WiredInput
            nodeId={id}
            handleId="url"
            label="Target Website URL"
            value={targetUrl}
            onChange={(val) => updateNodeData(id, "url", val)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Status Output */}
      {outputStatus && (
        <div className="p-3 bg-neutral-50 rounded-b-xl border-t border-neutral-200/60 font-mono text-[11px]">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Latency & Status Result
          </span>
          <div className="text-emerald-600 font-bold">{outputStatus}</div>
        </div>
      )}

      {/* Output Handle */}
      <div className="relative py-2 px-4 flex items-center justify-end bg-neutral-50/50 rounded-b-xl">
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mr-2">
          Monitor Output
        </span>
        <Handle
          type="source"
          position={Position.Right}
          id="outputStatus"
          className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white transition-transform hover:!scale-125"
        />
      </div>
    </div>
  );
}
