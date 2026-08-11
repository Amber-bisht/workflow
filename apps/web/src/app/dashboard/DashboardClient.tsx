"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Loader2,
  Workflow,
  Sparkles,
  Layers,
  Box,
  Code,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Upload,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  User
} from "lucide-react";
import { createWorkflow, deleteWorkflow, renameWorkflow, importWorkflow } from "../actions/workflow";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

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

// ── Status tag — Dark mode pill badge matching landing page ───────────────────
function StatusTag({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode; label: string }> = {
    SUCCESS: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Success",
    },
    FAILED: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Failed",
    },
    RUNNING: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      label: "Running",
    },
    PENDING: {
      bg: "bg-neutral-800/50",
      border: "border-neutral-700/50",
      text: "text-neutral-400",
      icon: <Clock className="w-3 h-3" />,
      label: "Pending",
    },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase ${s.bg} ${s.border} ${s.text} shrink-0`}
    >
      {s.icon}
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

  // Sync initialWorkflows on updates
  useEffect(() => {
    setWorkflows(initialWorkflows);
  }, [initialWorkflows]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameDescValue, setRenameDescValue] = useState("");

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    setIsSubmitting(true);
    try {
      const flow = await createWorkflow(newWorkflowName.trim(), newWorkflowDesc.trim() || undefined);
      setWorkflows(prev => [flow as any, ...prev]);
      setIsCreateOpen(false);
      setNewWorkflowName("");
      setNewWorkflowDesc("");
      router.push(`/workflow/${flow.id}`);
    } catch (err: any) {
      alert("Failed to create workflow: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      await deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (err: any) {
      alert("Failed to delete workflow: " + err.message);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkflowId || !renameValue.trim()) return;
    setIsSubmitting(true);
    try {
      await renameWorkflow(activeWorkflowId, renameValue.trim(), renameDescValue.trim() || undefined);
      setWorkflows(prev =>
        prev.map(w =>
          w.id === activeWorkflowId
            ? { ...w, name: renameValue.trim(), description: renameDescValue.trim() || null }
            : w
        )
      );
      setIsRenameOpen(false);
      setActiveWorkflowId(null);
      setRenameValue("");
      setRenameDescValue("");
    } catch (err: any) {
      alert("Failed to rename workflow: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };



  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      
      {/* ── Dark Left Sidebar ────────────────────────────────────────────────── */}
      <AppSidebar activePath="workflows" onNewWorkflow={() => setIsCreateOpen(true)} />

      {/* ── Main Workflows Panel ─────────────────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Top Header */}
          <AppHeader title="Workflows">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative w-48 sm:w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-full py-1.5 pl-9 pr-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-all"
                />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-200 text-xs font-semibold rounded-full transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Layout
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
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                New Workflow
              </button>
            </div>
          </AppHeader>

          {/* Feature Banner Image */}
          <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900/50 h-44 sm:h-56 md:h-64 relative">
            <img
              src="/lets.png"
              alt="Workflow Canvas Overview"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* User Workflows List Section */}
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Your Canvas Workflows</h3>
            </div>

            {/* Grid */}
            {filteredWorkflows.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-neutral-900/50 p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {searchQuery ? "No matching workflows found" : "No workflows created yet"}
                  </h4>
                  <p className="text-neutral-500 text-xs mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? "Try searching with a different keyword."
                      : "Create your first visual AI graph to start linking LLMs, search, and notification nodes."}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create First Workflow
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
                      className="group rounded-2xl border border-white/10 bg-neutral-900/70 hover:bg-neutral-900 p-6 flex flex-col justify-between gap-6 hover:border-white/25 transition-all duration-200 cursor-pointer shadow-lg relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-white text-base tracking-tight truncate group-hover:text-blue-400 transition-colors">
                            {flow.name}
                          </h4>
                          {latestRun && <StatusTag status={latestRun.status} />}
                        </div>
                        <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {flow.description || "Visual node workflow."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-neutral-500 font-mono">
                        <span suppressHydrationWarning>{formatDate(flow.updatedAt)}</span>

                        {/* Actions on hover */}
                        <div
                          className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(flow.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Create Modal ──────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl max-w-md w-full p-7 flex flex-col gap-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Create New Workflow</h3>
              <p className="text-xs text-neutral-400 mt-1">Set up a visual canvas graph for your pipeline.</p>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300">Workflow Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. AI Support Responder"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="bg-neutral-950 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300">Description <span className="text-neutral-500 font-normal">(optional)</span></label>
                <textarea
                  placeholder="What does this workflow do?"
                  value={newWorkflowDesc}
                  onChange={(e) => setNewWorkflowDesc(e.target.value)}
                  rows={2}
                  className="bg-neutral-950 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-neutral-600 resize-none focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setNewWorkflowName(""); setNewWorkflowDesc(""); }}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWorkflowName.trim()}
                  className="px-5 py-2.5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Rename Modal ──────────────────────────────────────────────────────── */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl max-w-md w-full p-7 flex flex-col gap-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Rename Workflow</h3>
              <p className="text-xs text-neutral-400 mt-1">Update title or description for this workflow.</p>
            </div>
            <form onSubmit={handleRename} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300">Workflow Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="bg-neutral-950 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-300">Description <span className="text-neutral-500 font-normal">(optional)</span></label>
                <textarea
                  placeholder="What does this workflow do?"
                  value={renameDescValue}
                  onChange={(e) => setRenameDescValue(e.target.value)}
                  rows={2}
                  className="bg-neutral-950 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-neutral-600 resize-none focus:outline-none focus:border-white/40 transition-all"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRenameOpen(false); setActiveWorkflowId(null); setRenameValue(""); setRenameDescValue(""); }}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !renameValue.trim()}
                  className="px-5 py-2.5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
