import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@nextflow/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const run = await prisma.workflowRun.findFirst({
      where: {
        id,
        workflow: {
          userId: session.user.id,
        },
      },
      include: {
        nodeRuns: {
          orderBy: {
            startedAt: "asc",
          },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (error: any) {
    console.error("[API] Error fetching run details:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
