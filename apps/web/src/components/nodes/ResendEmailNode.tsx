"use client";

import { Position, Handle } from "@xyflow/react";
import { Mail, X, Sparkles } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { WiredInput } from "./WiredInput";

interface ResendEmailNodeProps {
  id: string;
  data: {
    to?: string;
    subject?: string;
    body?: string;
    outputResult?: string;
  };
  selected?: boolean;
}

export default function ResendEmailNode({ id, data, selected }: ResendEmailNodeProps) {
  const { updateNodeData, runningNodeIds, deleteNode } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const to = data.to || "";
  const subject = data.subject || "Workflow Automation Report";
  const body = data.body || "";
  const outputResult = data.outputResult || "";

  return (
    <div
      className={`w-[290px] bg-white text-neutral-800 border ${
        isRunning
          ? "node-running"
          : selected
          ? "border-rose-500/85 shadow-[0_4px_20px_rgba(244,63,94,0.15)]"
          : "border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      } rounded-xl text-xs transition-all relative`}
    >
      {/* Node Header */}
      <div className="bg-neutral-50/80 border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-800 leading-tight">Resend Email</h4>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">Transactional Email (1 Credit)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              <Sparkles className="h-2.5 w-2.5 animate-pulse text-rose-500" /> Sending
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

      {/* Inputs Stack */}
      <div className="flex flex-col border-b border-neutral-200/80">
        {/* Recipient Email */}
        <div className="py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Recipient Email (To)
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => updateNodeData(id, "to", e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-white border border-neutral-200 rounded px-2.5 py-1 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Email Subject */}
        <div className="py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => updateNodeData(id, "subject", e.target.value)}
              placeholder="Workflow alert..."
              className="w-full bg-white border border-neutral-200 rounded px-2.5 py-1 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Body Port */}
        <div className="relative py-2.5 px-4 flex items-center gap-2 bg-neutral-50/20">
          <Handle
            type="target"
            position={Position.Left}
            id="body"
            className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white transition-transform hover:!scale-125"
          />
          <div className="flex-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Email Body Content
            </label>
            <WiredInput
              nodeId={id}
              handleId="body"
              label="Email Body Content"
              value={body}
              onChange={(val) => updateNodeData(id, "body", val)}
              placeholder="Email body text or HTML payload..."
              type="textarea"
            />
          </div>
        </div>
      </div>

      {/* Dispatch Output */}
      {outputResult && (
        <div className="p-3 bg-neutral-50 rounded-b-xl border-t border-neutral-200/60 font-mono text-[11px]">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Email Delivery Result
          </span>
          <div className="text-rose-600 font-bold">{outputResult}</div>
        </div>
      )}

      {/* Output Handle */}
      <div className="relative py-2 px-4 flex items-center justify-end bg-neutral-50/50 rounded-b-xl">
        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mr-2">
          Email Payload
        </span>
        <Handle
          type="source"
          position={Position.Right}
          id="outputResult"
          className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white transition-transform hover:!scale-125"
        />
      </div>
    </div>
  );
}
