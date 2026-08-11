"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Search, Loader2 } from "lucide-react";
import { createWorkflow, deleteWorkflow, renameWorkflow, importWorkflow } from "../actions/workflow";

interface WorkflowWithRuns {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  runs: { status: string; createdAt: Date }[];
}

interface DashboardClientProps {
  initialWorkflows: WorkflowWithRuns[];
}

// ── Status tag — square, solid, text-only ─────────────────────────────────────
function StatusTag({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    SUCCESS: { bg: "#16a34a", color: "#fff", label: "Success" },
    FAILED: { bg: "#dc2626", color: "#fff", label: "Failed" },
    RUNNING: { bg: "#b45309", color: "#fff", label: "Running" },
    PENDING: { bg: "#404040", color: "#a3a3a3", label: "Pending" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      backgroundColor: s.bg,
      color: s.color,
      flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

export default function DashboardClient({ initialWorkflows }: DashboardClientProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowWithRuns[]>(initialWorkflows);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const layout = JSON.parse(event.target?.result as string);
        if (Array.isArray(layout.nodes) && Array.isArray(layout.edges)) {
          const name = file.name.replace(/_layout\.json$/i, "").replace(/_/g, " ") || "Imported Workflow";
          const newFlow = await importWorkflow(name, layout.nodes, layout.edges);
          router.push(`/workflow/${newFlow.id}`);
        } else {
          alert("Invalid layout file structure.");
        }
      } catch (err: any) {
        alert("Failed to import workflow: " + (err.message || String(err)));
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Cmd+. or Ctrl+.
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
      // New task: Cmd+Shift+O
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setIsCreateOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameDescValue, setRenameDescValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleLoadSample = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/workflow/seed", { method: "POST" });
      const data = await res.json();
      if (data.success && data.workflowId) {
        router.push(`/workflow/${data.workflowId}`);
      } else {
        alert(data.error || "Failed to create sample workflow");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create sample workflow");
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    setIsSubmitting(true);
    try {
      const newFlow = await createWorkflow(newWorkflowName, newWorkflowDesc);
      setWorkflows([{ ...newFlow, runs: [] } as any, ...workflows]);
      setIsCreateOpen(false);
      setNewWorkflowName("");
      setNewWorkflowDesc("");
      router.push(`/workflow/${newFlow.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || !activeWorkflowId) return;
    setIsSubmitting(true);
    try {
      await renameWorkflow(activeWorkflowId, renameValue, renameDescValue);
      setWorkflows(workflows.map(w => w.id === activeWorkflowId ? { ...w, name: renameValue, description: renameDescValue } : w));
      setIsRenameOpen(false);
      setActiveWorkflowId(null);
      setRenameValue("");
      setRenameDescValue("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workflow? All associated runs will be lost.")) return;
    try {
      await deleteWorkflow(id);
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="flex min-h-screen bg-white text-neutral-800 font-sans antialiased">
      <aside className={`border-r border-neutral-200/80 bg-[#fafafa] flex flex-col justify-between py-6 text-neutral-800 h-screen sticky top-0 shrink-0 select-none transition-all duration-300 ${isCollapsed ? "w-[72px] px-2 items-center" : "w-[260px] px-4"}`}>
        {isCollapsed ? (
          /* ── Collapsed Sidebar ── */
          <div className="flex flex-col gap-4 items-center w-full">
            {/* Logo / Toggle Button Wrapper */}
            <div className="relative w-10 h-10 flex items-center justify-center group/logo cursor-pointer">
              {/* Logo Box (shown normally) */}
              <div className="absolute inset-0 bg-neutral-900 rounded-xl flex items-center justify-center text-white transition-opacity duration-200 group-hover/logo:opacity-0 pointer-events-none">
                <span className="text-lg font-bold tracking-tight text-white flex items-center font-sans">
                  N
                  <svg className="w-3.5 h-3.5 -mx-0.5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
                  </svg>
                </span>
              </div>

              {/* Toggle Open Button (shown on hover) */}
              <button
                onClick={() => setIsCollapsed(false)}
                className="absolute inset-0 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center p-1.5 text-neutral-800 hover:bg-neutral-200/50 rounded-xl transition-all border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
              >
                <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="3" rx="2.5" />
                  <path d="M9 3v18M13 9l3 3-3 3" />
                </svg>

                {/* Tooltip */}
                <div className="absolute left-[54px] top-1/2 -translate-y-1/2 scale-95 opacity-0 pointer-events-none group-hover/logo:scale-100 group-hover/logo:opacity-100 transition-all duration-150 delay-100 z-50 bg-white border border-neutral-200 shadow-lg px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 text-[13px] font-semibold text-neutral-800">
                  <span>Open sidebar</span>
                  <span className="text-neutral-450 font-sans font-normal">⌘.</span>
                </div>
              </button>
            </div>

            {/* Navigation & Action Links (Unified) */}
            <nav className="flex flex-col gap-1.5 items-center w-full">
              {/* New Task Button */}
              <button
                onClick={() => setIsCreateOpen(true)}
                title="New task (⌘⇧O)"
                className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-700 hover:bg-neutral-100/60 hover:text-neutral-900 transition-all cursor-pointer group"
              >
                <Plus className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700 transition-colors" />
              </button>

              {/* Search Button */}
              <button
                title="Search tasks (⌘K)"
                className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-700 hover:bg-neutral-100/60 hover:text-neutral-900 transition-all cursor-pointer group"
              >
                <Search className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700 transition-colors" />
              </button>

              {/* Tasks */}
              <button title="Tasks" className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-700 hover:bg-neutral-100/60 hover:text-neutral-900 transition-all cursor-pointer group">
                <svg className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.9 2.78 2.9h9.37l3.75 3.13c.48.4 1.2.06 1.2-.56V6.75c0-1.6-1.12-2.9-2.78-2.9H4.73c-1.66 0-2.78 1.3-2.78 2.9v6.52Z" />
                </svg>
              </button>

              {/* Projects */}
              <button title="Projects" className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-700 hover:bg-neutral-100/60 hover:text-neutral-900 transition-all cursor-pointer group">
                <svg className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0v.25A2.25 2.25 0 0 0 4.5 17.5h15a2.25 2.25 0 0 0 2.25-2.25v-.25m-19.5 0V9A2.25 2.25 0 0 1 4.5 6.75h5.06a2.25 2.25 0 0 1 1.59.66l1.72 1.72a2.25 2.25 0 0 0 1.59.66h5.06A2.25 2.25 0 0 1 21.75 12v.75" />
                </svg>
              </button>

              {/* Library */}
              <button title="Library" className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-700 hover:bg-neutral-100/60 hover:text-neutral-900 transition-all cursor-pointer group">
                <svg className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M6 20V4M12 20V8M18 20V12" />
                </svg>
              </button>

              {/* Flow */}
              <button title="Flow" className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-200/65 text-neutral-900 transition-all cursor-pointer">
                <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="3" y="14" width="6" height="6" rx="1.5" />
                  <rect x="15" y="4" width="6" height="6" rx="1.5" />
                  <path d="M9 17h9v-7" strokeWidth="1.8" />
                </svg>
              </button>

              {/* Nodes */}
              <button title="Nodes" className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-700 hover:bg-neutral-100/60 hover:text-neutral-900 transition-all cursor-pointer group">
                <svg className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="7" r="3" />
                  <circle cx="7" cy="16" r="3" />
                  <circle cx="17" cy="16" r="3" />
                  <path d="M12 10v3M9.5 14.5l2.5-1.5 2.5 1.5" />
                </svg>
              </button>

              {/* API / MCP */}
              <button title="API / MCP" className="flex items-center justify-center w-10 h-10 rounded-xl text-neutral-700 hover:bg-neutral-100/60 hover:text-neutral-900 transition-all cursor-pointer group">
                <svg className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </button>
            </nav>
          </div>
        ) : (
          /* ── Expanded Sidebar ── */
          <div className="flex flex-col gap-4">
            {/* Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold tracking-tight text-neutral-900 flex items-center font-sans">
                  Next
                  <svg className="w-4.5 h-4.5 -mx-0.5 text-neutral-900 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
                  </svg>
                  Flow
                </span>
              </div>
              {/* Sidebar Toggle Collapse Button */}
              <div className="relative group/toggle">
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 text-neutral-550 hover:bg-neutral-200/50 rounded-lg transition-colors border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect width="18" height="18" x="3" y="3" rx="2.5" />
                    <path d="M15 3v18M11 9l-3 3 3 3" />
                  </svg>
                </button>

                {/* Tooltip */}
                <div className="absolute left-[38px] top-1/2 -translate-y-1/2 scale-95 opacity-0 pointer-events-none group-hover/toggle:scale-100 group-hover/toggle:opacity-100 transition-all duration-150 delay-100 z-50 bg-white border border-neutral-200 shadow-lg px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 text-[13px] font-semibold text-neutral-800">
                  <span>Close sidebar</span>
                  <span className="text-neutral-450 font-sans font-normal">⌘.</span>
                </div>
              </div>
            </div>

            {/* Navigation & Action Links (Unified) */}
            <nav className="flex flex-col gap-1">
              {/* New Task Button */}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 text-[14px] font-medium transition-all text-left cursor-pointer w-full group"
              >
                <Plus className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" />
                <span>New task</span>
              </button>

              {/* Search tasks container */}
              <div className="relative flex items-center w-full group rounded-xl hover:bg-neutral-100 transition-all">
                <Search className="absolute left-3 w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" />
                <input
                  type="text"
                  placeholder="Search tasks"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-transparent rounded-xl py-2 pl-10 pr-4 text-[14px] text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-0 transition-all font-medium"
                />
              </div>

              {/* Tasks */}
              <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 text-[14px] font-medium transition-all text-left cursor-pointer w-full group">
                <svg className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.9 2.78 2.9h9.37l3.75 3.13c.48.4 1.2.06 1.2-.56V6.75c0-1.6-1.12-2.9-2.78-2.9H4.73c-1.66 0-2.78 1.3-2.78 2.9v6.52Z" />
                </svg>
                <span>Tasks</span>
              </button>

              {/* Projects */}
              <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 text-[14px] font-medium transition-all text-left cursor-pointer w-full group">
                <svg className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0v.25A2.25 2.25 0 0 0 4.5 17.5h15a2.25 2.25 0 0 0 2.25-2.25v-.25m-19.5 0V9A2.25 2.25 0 0 1 4.5 6.75h5.06a2.25 2.25 0 0 1 1.59.66l1.72 1.72a2.25 2.25 0 0 0 1.59.66h5.06A2.25 2.25 0 0 1 21.75 12v.75" />
                </svg>
                <span>Projects</span>
              </button>

              {/* Library */}
              <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 text-[14px] font-medium transition-all text-left cursor-pointer w-full group">
                <svg className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M6 20V4M12 20V8M18 20V12" />
                </svg>
                <span>Library</span>
              </button>

              {/* Flow (Active) */}
              <button className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-200/60 text-neutral-900 text-[14px] font-semibold transition-all text-left cursor-pointer w-full">
                <svg className="w-4.5 h-4.5 text-neutral-900" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="3" y="14" width="6" height="6" rx="1.5" />
                  <rect x="15" y="4" width="6" height="6" rx="1.5" />
                  <path d="M9 17h9v-7" strokeWidth="1.8" />
                </svg>
                <span>Flow</span>
              </button>

              {/* Nodes */}
              <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 text-[14px] font-medium transition-all text-left cursor-pointer w-full group">
                <svg className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="7" r="3" />
                  <circle cx="7" cy="16" r="3" />
                  <circle cx="17" cy="16" r="3" />
                  <path d="M12 10v3M9.5 14.5l2.5-1.5 2.5 1.5" />
                </svg>
                <span>Nodes</span>
              </button>

              {/* API / MCP */}
              <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 text-[14px] font-medium transition-all text-left cursor-pointer w-full group">
                <svg className="w-4.5 h-4.5 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span>API / MCP</span>
              </button>
            </nav>
          </div>
        )}

        {/* Middle Section */}
        {!isCollapsed ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <span className="text-neutral-400 text-[13px] font-medium">No tasks yet</span>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Bottom Section */}
        <div className="flex flex-col gap-3 items-center w-full">
          {isCollapsed ? (
            /* Collapsed Bottom Settings */
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              title="Sign Out"
              className="flex items-center justify-center w-10 h-10 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-full text-neutral-550 hover:text-neutral-700 shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 text-neutral-550" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H9" />
              </svg>
            </button>
          ) : (
            /* Expanded Bottom Settings & Profile */
            <>
              {/* Profile Footer */}
              <div
                className="flex items-center gap-3 pt-2 w-full"
              >
                {user?.image ? (
                  <img src={user.image} alt="User Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#e0582d] flex items-center justify-center text-white font-bold text-[14px] shadow-sm select-none shrink-0">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <p className="text-[14px] font-bold text-neutral-900 leading-none truncate">
                    {user?.name || "Google User"}
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-none truncate mt-0.5">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="flex items-center justify-center gap-2.5 px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-full text-[13px] font-semibold text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all w-full cursor-pointer mt-1"
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H9" />
                </svg>
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="flex-1 px-10 py-10 overflow-y-auto">
        <div className="max-w-7xl flex flex-col gap-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Flow</h1>
              <p className="text-[rgb(115,115,115)] text-sm mt-1">
                Build workflows or run models directly.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span>Import</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-[#111] hover:bg-neutral-800 text-white p-2 rounded-xl cursor-pointer flex items-center justify-center shadow-md"
                title="New task"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* System Workflows Section */}
          <div className="flex flex-col gap-3 mt-2">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 leading-none">System Workflows</h2>
              <p className="text-neutral-550 text-sm mt-1.5">
                Pre-built workflow templates — click to open and start using.
              </p>
            </div>

            {/* Template Card */}
            <div className="flex gap-4 mt-1">
              <div 
                onClick={handleLoadSample}
                className="w-64 group border border-neutral-200 bg-[#f7f8f9] rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm"
              >
                {/* Card Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                  <img 
                    src="https://8mm.in/cdn/shop/files/Bowers_Wilkins_PX7_S3_Headphone_black.webp?v=1759395622&width=900" 
                    alt="AI Headphones Market Campaign"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Card Title Box */}
                <div className="p-3.5 bg-[#F5F5F5] border-t border-neutral-100">
                  <h3 className="font-bold text-neutral-900 text-sm tracking-tight leading-snug">
                    AI Headphones Market Campaign
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* User Workflows Section */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-start justify-between w-full">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-neutral-900">Your Workflows</h2>
                <p className="text-[rgb(115,115,115)] text-sm">
                  Open one to edit, run, and review history.
                </p>
              </div>

              {/* Search (aligned to right) */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(115,115,115)]" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-lg py-2 pl-9 pr-4 text-sm text-neutral-850 placeholder-[rgb(115,115,115)] focus:outline-none focus:border-neutral-300 focus:ring-0 shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredWorkflows.length === 0 ? (
            <div className="border border-neutral-200/80 bg-white rounded-2xl flex flex-col items-start justify-center p-8 text-left shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <h3 className="text-base font-bold text-neutral-900 leading-none">
                {searchQuery ? "No workflows match your search." : "No workflows yet"}
              </h3>
              <p className="text-[rgb(115,115,115)] text-sm mt-2">
                {searchQuery ? "Try a different search query." : "Create your first workflow to start building."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-5 px-4.5 py-2.5 bg-[#111] hover:bg-neutral-800 text-white text-[13px] font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  Create workflow
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkflows.map((flow) => {
                const latestRun = flow.runs?.[0];
                return (
                  <div
                    key={flow.id}
                    onClick={() => router.push(`/workflow/${flow.id}`)}
                    className="group border border-neutral-200/80 bg-[#f7f8f9] rounded-2xl p-5 hover:border-neutral-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 cursor-pointer shadow-sm"
                  >
                    {/* Top */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-neutral-800 text-sm leading-snug truncate">
                          {flow.name}
                        </h3>
                        {latestRun && <StatusTag status={latestRun.status} />}
                      </div>
                      <p className="text-xs text-[rgb(115,115,115)] line-clamp-2 min-h-[2rem] leading-relaxed">
                        {flow.description || "No description provided."}
                      </p>
                    </div>

                    {/* Bottom */}
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                      <span className="text-[11px] text-[rgb(115,115,115)] font-medium" suppressHydrationWarning>
                        {formatDate(flow.updatedAt)}
                      </span>

                      {/* Actions — show on hover, stop propagation */}
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setActiveWorkflowId(flow.id);
                            setRenameValue(flow.name);
                            setRenameDescValue(flow.description || "");
                            setIsRenameOpen(true);
                          }}
                          title="Rename"
                          className="p-1.5 rounded-lg hover:bg-white text-[rgb(115,115,115)] hover:text-neutral-700 transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(flow.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[rgb(115,115,115)] hover:text-red-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Create Modal ──────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-neutral-900">New Workflow</h3>
              <p className="text-xs text-[rgb(115,115,115)] mt-1">Give your workflow a name and optional description.</p>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[rgb(115,115,115)]">Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Product Image Analyzer"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="bg-white border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-800 placeholder-[rgb(115,115,115)] focus:outline-none focus:border-neutral-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[rgb(115,115,115)]">Description <span className="text-[rgb(115,115,115)]/80 font-normal">(optional)</span></label>
                <textarea
                  placeholder="What does this workflow do?"
                  value={newWorkflowDesc}
                  onChange={(e) => setNewWorkflowDesc(e.target.value)}
                  rows={2}
                  className="bg-white border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-800 placeholder-[rgb(115,115,115)] resize-none focus:outline-none focus:border-neutral-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setNewWorkflowName(""); setNewWorkflowDesc(""); }}
                  className="px-4 py-2 text-sm text-[rgb(115,115,115)] hover:text-neutral-800 font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWorkflowName.trim()}
                  className="px-5 py-2 bg-[#111] hover:bg-neutral-800 disabled:bg-[#111] text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Rename Modal ──────────────────────────────────────────────────────── */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 flex flex-col gap-5 shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Rename Workflow</h3>
              <p className="text-xs text-[rgb(115,115,115)] mt-1">Update your workflow name and description.</p>
            </div>
            <form onSubmit={handleRename} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[rgb(115,115,115)]">Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="bg-white border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[rgb(115,115,115)]">Description <span className="text-[rgb(115,115,115)]/80 font-normal">(optional)</span></label>
                <textarea
                  placeholder="What does this workflow do?"
                  value={renameDescValue}
                  onChange={(e) => setRenameDescValue(e.target.value)}
                  rows={2}
                  className="bg-white border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-800 placeholder-[rgb(115,115,115)] resize-none focus:outline-none focus:border-neutral-300 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsRenameOpen(false); setActiveWorkflowId(null); setRenameValue(""); setRenameDescValue(""); }}
                  className="px-4 py-2 text-sm text-[rgb(115,115,115)] hover:text-neutral-800 font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !renameValue.trim()}
                  className="px-5 py-2 bg-[#111] hover:bg-neutral-800 disabled:bg-[#111] text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
