"use client";

import { Handle, Position } from "@xyflow/react";
import { Sparkles, X, Download } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { WiredInput } from "./WiredInput";

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
  const { updateNodeData, runningNodeIds, deleteNode } = useWorkflowStore();

  const isRunning = runningNodeIds.includes(id);

  // Default values
  const xVal = data.x !== undefined ? data.x : 0;
  const yVal = data.y !== undefined ? data.y : 0;
  const wVal = data.w !== undefined ? data.w : 100;
  const hVal = data.h !== undefined ? data.h : 100;

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
            <span className="font-bold text-neutral-800 block">Crop Image</span>
            <span className="text-[9px] text-neutral-500 block uppercase tracking-wider font-semibold">Media Tool</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <Sparkles className="h-2.5 w-2.5 animate-pulse text-blue-500" /> Cropping
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

      {/* Input Ports Stack (Left Side) */}
      <div className="flex flex-col border-b border-neutral-200/80">
        {/* Input Image */}
        <div className="relative py-2 px-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/20">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-medium text-neutral-700">Input Image</span>
          </div>
          <Handle
            type="target"
            position={Position.Left}
            id="inputImage"
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

        {/* X Position */}
        <div className="relative py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="font-medium text-neutral-750">X Position (%)</span>
          <Handle
            type="target"
            position={Position.Left}
            id="x"
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

        {/* Y Position */}
        <div className="relative py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="font-medium text-neutral-750">Y Position (%)</span>
          <Handle
            type="target"
            position={Position.Left}
            id="y"
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

        {/* Width */}
        <div className="relative py-2 px-4 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/20">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="font-medium text-neutral-750">Width (%)</span>
          <Handle
            type="target"
            position={Position.Left}
            id="w"
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

        {/* Height */}
        <div className="relative py-2 px-4 flex items-center gap-2 bg-neutral-50/20">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="font-medium text-neutral-750">Height (%)</span>
          <Handle
            type="target"
            position={Position.Left}
            id="h"
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

      {/* Node Content / Coordinates */}
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <WiredInput
            nodeId={id}
            handleId="x"
            label="X Position (%)"
            value={xVal}
            onChange={(val) => updateNodeData(id, "x", val)}
            placeholder="0"
          />
          <WiredInput
            nodeId={id}
            handleId="y"
            label="Y Position (%)"
            value={yVal}
            onChange={(val) => updateNodeData(id, "y", val)}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <WiredInput
            nodeId={id}
            handleId="w"
            label="Width (%)"
            value={wVal}
            onChange={(val) => updateNodeData(id, "w", val)}
            placeholder="100"
          />
          <WiredInput
            nodeId={id}
            handleId="h"
            label="Height (%)"
            value={hVal}
            onChange={(val) => updateNodeData(id, "h", val)}
            placeholder="100"
          />
        </div>

        {/* Live crop output URL or execution preview */}
        {data.outputImage && (
          <div className="mt-2 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50/50 p-2 flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">Result Preview</span>
            <img src={data.outputImage} alt="Cropped Output" className="max-h-20 w-full object-contain bg-white rounded-md border border-neutral-200/40 p-1" />
            <a
              href={data.outputImage}
              download={`cropped_${id}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-semibold border border-neutral-800 transition-all"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          </div>
        )}
      </div>

      {/* Source Image Port (Right Side) */}
      <div className="relative py-2 px-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50/20 rounded-b-xl">
        <span className="font-bold text-neutral-700">Output Image</span>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="outputImage"
          style={{
            top: "50%",
            right: "-6px",
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
  );
}
