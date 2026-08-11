import { z } from "zod";

// ── Node Types & Statuses ──────────────────────────────────────────────────
export type NodeType = "RequestInputs" | "CropImage" | "Gemini" | "Response";

export type RunStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";

export type ExecutionScope = "FULL" | "PARTIAL" | "SINGLE";

export type TriggerSource = "MANUAL" | "API";

// ── Workflow Payload Schemas ──────────────────────────────────────────────
export const RunWorkflowSchema = z.object({
  workflowId: z.string().uuid(),
  scope: z.enum(["FULL", "PARTIAL", "SINGLE"]).default("FULL"),
  selectedNodeIds: z.array(z.string()).optional().default([]),
});

export type RunWorkflowPayload = z.infer<typeof RunWorkflowSchema>;

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type CreateWorkflowPayload = z.infer<typeof CreateWorkflowSchema>;

export const UpdateWorkflowSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
});

export type UpdateWorkflowPayload = z.infer<typeof UpdateWorkflowSchema>;

// ── Shared Workflow Interface Models ──────────────────────────────────────
export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
  deletable?: boolean;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface CropImagePayload {
  inputImage: string;
  x: number | string;
  y: number | string;
  w: number | string;
  h: number | string;
  runId: string;
  nodeId: string;
}

export interface GeminiPayload {
  prompt: string;
  systemInstruction?: string;
  images?: string[];
  mimeType?: string;
  runId: string;
  nodeId: string;
}

export interface StreamEvent {
  runId: string;
  nodeId?: string;
  status: RunStatus;
  outputs?: any;
  error?: string;
  timestamp: string;
}
