"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@nextflow/database";
import { revalidatePath } from "next/cache";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getWorkflows() {
  const userId = await getAuthUserId();

  return prisma.workflow.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      runs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getWorkflow(id: string) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.findFirst({
    where: { id, userId },
  });

  if (!workflow) return null;
  return workflow;
}

export async function createWorkflow(name: string, description?: string) {
  const userId = await getAuthUserId();

  const initialNodes = [
    {
      id: "request-inputs",
      type: "RequestInputs",
      position: { x: 100, y: 150 },
      deletable: false,
      data: {
        fields: [
          { id: "text_field", name: "text_field", type: "text", value: "Enter prompt or input text..." },
          { id: "image_field", name: "image_field", type: "image", value: "" },
        ],
      },
    },
    {
      id: "response",
      type: "Response",
      position: { x: 900, y: 250 },
      deletable: false,
      data: {
        value: "",
      },
    },
  ];

  const initialEdges: any[] = [];

  const workflow = await prisma.workflow.create({
    data: {
      name,
      description: description || "",
      userId,
      nodes: initialNodes,
      edges: initialEdges,
    },
  });

  revalidatePath("/dashboard");
  return workflow;
}

export async function updateWorkflow(id: string, nodes: any[], edges: any[]) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.updateMany({
    where: { id, userId },
    data: {
      nodes: nodes as any,
      edges: edges as any,
    },
  });

  return workflow;
}

export async function renameWorkflow(id: string, name: string, description?: string) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.updateMany({
    where: { id, userId },
    data: {
      name,
      ...(description !== undefined ? { description } : {}),
    },
  });

  revalidatePath("/dashboard");
  return workflow;
}

export async function deleteWorkflow(id: string) {
  const userId = await getAuthUserId();

  await prisma.workflow.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getWorkflowRuns(workflowId: string) {
  const userId = await getAuthUserId();

  return prisma.workflowRun.findMany({
    where: {
      workflowId,
      workflow: {
        userId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      nodeRuns: {
        orderBy: {
          startedAt: "asc",
        },
      },
    },
  });
}

export async function importWorkflow(name: string, nodes: any[], edges: any[], description?: string) {
  const userId = await getAuthUserId();

  const workflow = await prisma.workflow.create({
    data: {
      name,
      description: description || "Imported workflow layout JSON",
      userId,
      nodes: nodes as any,
      edges: edges as any,
    },
  });

  revalidatePath("/dashboard");
  return workflow;
}
