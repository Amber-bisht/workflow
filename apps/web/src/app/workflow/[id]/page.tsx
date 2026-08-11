import { redirect } from "next/navigation";
import { getWorkflow, getWorkflowRuns } from "@/app/actions/workflow";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowPage({ params }: PageProps) {
  const { id } = await params;
  
  const [workflow, runs] = await Promise.all([
    getWorkflow(id),
    getWorkflowRuns(id),
  ]);

  if (!workflow) {
    return redirect("/dashboard");
  }

  // Ensure JSON parsing/serialization is safe for Next.js Client Components
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const edges = Array.isArray(workflow.edges) ? workflow.edges : [];

  return (
    <WorkflowCanvas
      workflowId={workflow.id}
      initialName={workflow.name}
      initialNodes={nodes}
      initialEdges={edges}
      initialRuns={JSON.parse(JSON.stringify(runs))}
    />
  );
}
