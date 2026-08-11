"use client";

import { Position, Handle } from "@xyflow/react";
import { Sparkles, X } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { WiredInput } from "./WiredInput";

interface OpenRouterNodeProps {
  id: string;
  data: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    prompt?: string;
    systemPrompt?: string;
    response?: string;
  };
  selected?: boolean;
}

export default function OpenRouterNode({ id, data, selected }: OpenRouterNodeProps) {
  const { updateNodeData, runningNodeIds, deleteNode } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);

  const model = data.model || "openai/gpt-4o";
  const prompt = data.prompt || "";
  const systemPrompt = data.systemPrompt || "";
  const responseText = data.response || "";

  return (
    <div
      className={`w-[290px] bg-white text-neutral-800 border ${
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
            <select
              value={data.model || "openai/gpt-4o"}
              onChange={(e) => updateNodeData(id, "model", e.target.value)}
              className="font-bold text-neutral-800 bg-transparent border-none outline-none cursor-pointer text-xs appearance-none pr-1"
              style={{ fontFamily: "inherit" }}
              title="Select OpenRouter Multimodal Model"
            >
              <option value="openai/gpt-4o">OpenAI GPT-4o (Vision)</option>
              <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              <option value="meta-llama/llama-3.2-11b-vision-instruct">Llama 3.2 Vision</option>
            </select>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">OpenRouter Vision LLM</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <Sparkles className="h-2.5 w-2.5 animate-pulse text-blue-500" /> Thinking
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

      {/* Input Ports Stack (Left Side) */}
      <div className="flex flex-col border-b border-neutral-200/80">
        {/* Prompt Input Port */}
        <div className="relative py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          <span className="font-medium text-neutral-700">Prompt</span>
          <Handle
            type="target"
            position={Position.Left}
            id="prompt"
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

        {/* System Prompt Input Port */}
        <div className="relative py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          <span className="font-medium text-neutral-700">System Instruction</span>
          <Handle
            type="target"
            position={Position.Left}
            id="systemPrompt"
            style={{
              top: "50%",
              left: "-6px",
              width: "12px",
              height: "12px",
              backgroundColor: "#a855f7",
              border: "2px solid #ffffff",
              zIndex: 50,
              cursor: "crosshair",
            }}
          />
        </div>

        {/* Image Input Port */}
        <div className="relative py-2 px-4 flex items-center gap-2 bg-neutral-50/20">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="font-medium text-neutral-700">Vision Image</span>
          <Handle
            type="target"
            position={Position.Left}
            id="image"
            style={{
              top: "50%",
              left: "-6px",
              width: "12px",
              height: "12px",
              backgroundColor: "#3b82f6",
              border: "2px solid #ffffff",
              zIndex: 50,
              cursor: "crosshair",
            }}
          />
        </div>
      </div>

      {/* Inline Fields */}
      <div className="p-4 flex flex-col gap-3">
        <WiredInput nodeId={id} handleId="prompt" label="Prompt text (if unwired)">
          <textarea
            value={prompt}
            onChange={(e) => updateNodeData(id, "prompt", e.target.value)}
            placeholder="Describe image or ask a question..."
            rows={2}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-300 resize-none font-mono"
          />
        </WiredInput>

        <WiredInput nodeId={id} handleId="systemPrompt" label="System prompt">
          <input
            type="text"
            value={systemPrompt}
            onChange={(e) => updateNodeData(id, "systemPrompt", e.target.value)}
            placeholder="e.g. You are a helpful AI assistant."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-300 font-mono"
          />
        </WiredInput>
      </div>

      {/* Response Output Port & Preview */}
      <div className="relative bg-neutral-50/80 border-t border-neutral-200/80 px-4 py-3 rounded-b-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Output Response</span>
          <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
        </div>

        {responseText ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-[11px] text-neutral-700 whitespace-pre-wrap leading-relaxed shadow-inner">
            {responseText}
          </div>
        ) : (
          <div className="text-neutral-400 italic text-[11px]">No output generated yet...</div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          id="response"
          style={{
            top: "50%",
            right: "-6px",
            width: "12px",
            height: "12px",
            backgroundColor: "#f97316",
            border: "2px solid #ffffff",
            zIndex: 50,
            cursor: "crosshair",
          }}
        />
      </div>
    </div>
  );
}
