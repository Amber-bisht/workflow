"use client";

import { Position, Handle } from "@xyflow/react";
import { Send, X, Sparkles } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { WiredInput } from "./WiredInput";

interface TelegramNodeProps {
  id: string;
  data: {
    message?: string;
    chatId?: string;
    outputResult?: string;
  };
  selected?: boolean;
}

export default function TelegramNode({ id, data, selected }: TelegramNodeProps) {
  const { updateNodeData, runningNodeIds, deleteNode } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);
  const message = data.message || "";
  const chatId = data.chatId || "";
  const outputResult = data.outputResult || "";

  return (
    <div
      className={`w-[290px] bg-white text-neutral-800 border ${
        isRunning
          ? "node-running"
          : selected
          ? "border-sky-500/85 shadow-[0_4px_20px_rgba(14,165,233,0.15)]"
          : "border-neutral-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      } rounded-xl text-xs transition-all relative`}
    >
      {/* Node Header */}
      <div className="bg-neutral-50/80 border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200/60">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-800 leading-tight">Telegram Bot Alert</h4>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">Push Alert Message (1 Credit)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              <Sparkles className="h-2.5 w-2.5 animate-pulse text-sky-500" /> Sending
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
        {/* Chat ID Input */}
        <div className="py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Telegram Chat ID (Optional)
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => updateNodeData(id, "chatId", e.target.value)}
              placeholder="Default Chat ID"
              className="w-full bg-white border border-neutral-200 rounded px-2.5 py-1 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Alert Message Input Port */}
        <div className="relative py-2.5 px-4 flex items-center gap-2 bg-neutral-50/20">
          <Handle
            type="target"
            position={Position.Left}
            id="message"
            className="!w-3 !h-3 !bg-sky-500 !border-2 !border-white transition-transform hover:!scale-125"
          />
          <div className="flex-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Alert Message Text
            </label>
            <WiredInput
              nodeId={id}
              handleId="message"
              label="Alert Message Text"
              value={message}
              onChange={(val) => updateNodeData(id, "message", val)}
              placeholder="Alert notification payload..."
              type="textarea"
            />
          </div>
        </div>
      </div>

      {/* Dispatch Output */}
      {outputResult && (
        <div className="p-3 bg-neutral-50 rounded-b-xl border-t border-neutral-200/60 font-mono text-[11px]">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Delivery Status
          </span>
          <div className="text-sky-600 font-bold">{outputResult}</div>
        </div>
      )}

      {/* Output Handle */}
      <div className="relative py-2 px-4 flex items-center justify-end bg-neutral-50/50 rounded-b-xl">
        <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mr-2">
          Alert Payload
        </span>
        <Handle
          type="source"
          position={Position.Right}
          id="outputResult"
          className="!w-3 !h-3 !bg-sky-500 !border-2 !border-white transition-transform hover:!scale-125"
        />
      </div>
    </div>
  );
}
