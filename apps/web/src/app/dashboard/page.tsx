import { getWorkflows } from "../actions/workflow";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const workflows = await getWorkflows();
  
  // Transform dates to plain values or let next handle serialization if they are serializable objects.
  // Next.js Server Components serialize objects nicely, but in TypeScript let's ensure we type match.
  return <DashboardClient initialWorkflows={workflows as any} />;
}
