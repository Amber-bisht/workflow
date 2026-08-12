"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  Globe, 
  Sliders, 
  Crop, 
  FileText,
  Activity,
  Key,
  Trash2,
  Plus,
  Edit2,
  Check,
  Clipboard
} from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import Link from "next/link";
import { testTelegramConnection, getLatestTelegramChatId, testResendEmailConnection } from "@/app/actions/workflow";

// Real Resend Mail Vector Logo
function ResendMailLogo({ className = "w-5 h-5 text-rose-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  );
}

export default function NodeInspectorDrawer() {
  const { 
    nodes, 
    selectedNodeId, 
    setSelectedNodeId, 
    updateNodeData, 
    updateNodeFieldVal,
    addField,
    removeField,
    renameField,
    deleteNode,
    workflowId,
    runningNodeIds
  } = useWorkflowStore();

  const [savedCredentials, setSavedCredentials] = useState<any[]>([]);
  const [workflowSecrets, setWorkflowSecrets] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Field creation state for RequestInputs
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "image">("text");
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [tgTestStatus, setTgTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  const handleTestTelegram = async (currentChatId: string, currentSecretTag?: string) => {
    if (!currentChatId || !currentChatId.trim()) {
      setTgTestStatus({ loading: false, success: false, message: "Please enter a Telegram Chat ID first." });
      return;
    }
    setTgTestStatus({ loading: true });
    const res = await testTelegramConnection(currentChatId, currentSecretTag);
    setTgTestStatus({
      loading: false,
      success: res.success,
      message: res.success ? res.message : res.error,
    });
  };

  const handleAutoDetectChatId = async (currentSecretTag?: string) => {
    setTgTestStatus({ loading: true });
    const res = await getLatestTelegramChatId(currentSecretTag);
    if (res.success && res.chatId) {
      if (node) updateNodeData(node.id, "chatId", res.chatId);
      setTgTestStatus({
        loading: false,
        success: true,
        message: `✅ Auto-detected Chat ID: ${res.chatId} (${res.chatTitle})`,
      });
    } else {
      setTgTestStatus({
        loading: false,
        success: false,
        message: res.error || "Could not auto-detect chat.",
      });
    }
  };

  const [emailTestStatus, setEmailTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  const handleTestResendEmail = async (currentToEmail: string, currentSecretTag?: string) => {
    if (!currentToEmail || !currentToEmail.trim()) {
      setEmailTestStatus({ loading: false, success: false, message: "Please enter a Recipient Email address first." });
      return;
    }
    setEmailTestStatus({ loading: true });
    const res = await testResendEmailConnection(currentToEmail, currentSecretTag);
    setEmailTestStatus({
      loading: false,
      success: res.success,
      message: res.success ? res.message : res.error,
    });
  };

  useEffect(() => {
    // Fetch secrets from Workflow Vault
    if (workflowId) {
      fetch(`/api/workflow/${workflowId}/secrets`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.secrets)) {
            setWorkflowSecrets(data.secrets);
          }
        })
        .catch(() => {});
    }
  }, [workflowId]);

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const isRunning = runningNodeIds.includes(node.id);
  const data: Record<string, any> = node.data || {};

  // Safely extracted string values
  const credentialId = typeof data.credentialId === "string" ? data.credentialId : typeof data.secretTag === "string" ? data.secretTag : "";
  const chatId = typeof data.chatId === "string" ? data.chatId : "";
  const message = typeof data.message === "string" ? data.message : "";
  const to = typeof data.to === "string" ? data.to : "";
  const subject = typeof data.subject === "string" ? data.subject : "";
  const body = typeof data.body === "string" ? data.body : "";
  const model = typeof data.model === "string" ? data.model : "gemini-2.5-flash";
  const systemPrompt = typeof data.systemPrompt === "string" ? data.systemPrompt : "";
  const prompt = typeof data.prompt === "string" ? data.prompt : "";
  const query = typeof data.query === "string" ? data.query : "";
  const url = typeof data.url === "string" ? data.url : "";
  const x = data.x !== undefined ? data.x : 0;
  const y = data.y !== undefined ? data.y : 0;
  const w = data.w !== undefined ? data.w : 100;
  const h = data.h !== undefined ? data.h : 100;
  const fields = Array.isArray(data.fields) ? data.fields : [];

  const handleAddFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    addField(node.id, newFieldType, newFieldName.trim());
    setNewFieldName("");
  };

  const handleCopyOutput = (val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case "Telegram": return <Send className="h-5 w-5 text-sky-400" />;
      case "ResendEmail": return <ResendMailLogo className="h-5 w-5 text-rose-500" />;
      case "Gemini": case "OpenRouter": return <Bot className="h-5 w-5 text-purple-400" />;
      case "Tavily": case "TavilySearch": return <Globe className="h-5 w-5 text-emerald-400" />;
      case "WebsiteMonitor": return <Activity className="h-5 w-5 text-emerald-400" />;
      case "RequestInputs": return <Sliders className="h-5 w-5 text-amber-400" />;
      case "CropImage": return <Crop className="h-5 w-5 text-indigo-400" />;
      case "Response": return <FileText className="h-5 w-5 text-blue-400" />;
      default: return <Sparkles className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getNodeTitle = () => {
    switch (node.type) {
      case "Telegram": return "Telegram Bot Alert";
      case "ResendEmail": return "Send Email";
      case "Gemini": case "OpenRouter": return "LLM Engine";
      case "Tavily": case "TavilySearch": return "Web Search";
      case "WebsiteMonitor": return "Website Monitor";
      case "RequestInputs": return "User Request Form";
      case "CropImage": return "Crop Image";
      case "Response": return "Workflow Response";
      default: return node.type;
    }
  };

  return (
    <>
      <div className="fixed top-16 right-4 bottom-4 w-[380px] sm:w-[420px] bg-black border border-neutral-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-5 duration-150">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-[#09090b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#121215] border border-neutral-800">
              {getNodeIcon()}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-tight">{getNodeTitle()}</h3>
              <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block mt-0.5">
                ID: {node.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Trigger Custom Delete Modal */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all cursor-pointer"
              title="Delete Node"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1.5 rounded-lg bg-[#121215] hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Close Inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body - Pure Black */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">

          {/* Website Monitor Form */}
          {node.type === "WebsiteMonitor" && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  Target Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateNodeData(node.id, "url", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {data.outputStatus && (
                <div className="p-3.5 bg-[#121215] rounded-xl border border-neutral-800 font-mono text-xs space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Latency & Availability Result
                  </span>
                  <div className="text-emerald-400 font-bold">{String(data.outputStatus)}</div>
                </div>
              )}
            </div>
          )}

          {/* Crop Image Form */}
          {node.type === "CropImage" && (
            <div className="space-y-5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Image Crop Dimensions (%)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    X Position (%)
                  </label>
                  <input
                    type="number"
                    value={x}
                    onChange={(e) => updateNodeData(node.id, "x", Number(e.target.value))}
                    className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Y Position (%)
                  </label>
                  <input
                    type="number"
                    value={y}
                    onChange={(e) => updateNodeData(node.id, "y", Number(e.target.value))}
                    className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Width (%)
                  </label>
                  <input
                    type="number"
                    value={w}
                    onChange={(e) => updateNodeData(node.id, "w", Number(e.target.value))}
                    className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Height (%)
                  </label>
                  <input
                    type="number"
                    value={h}
                    onChange={(e) => updateNodeData(node.id, "h", Number(e.target.value))}
                    className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* RequestInputs (User Request Form) */}
          {node.type === "RequestInputs" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Form Input Fields ({fields.length})
                </span>

                {fields.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-800 bg-[#121215] text-center text-xs text-neutral-400">
                    No input fields defined. Add your first field below!
                  </div>
                ) : (
                  fields.map((f: any) => (
                    <div key={f.id} className="p-3.5 rounded-xl border border-neutral-800 bg-[#121215] space-y-2.5">
                      <div className="flex items-center justify-between">
                        {editingFieldId === f.id ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editNameValue}
                              onChange={(e) => setEditNameValue(e.target.value)}
                              className="bg-black border border-amber-500/50 rounded px-2 py-1 text-xs text-white w-full focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                if (editNameValue.trim()) renameField(node.id, f.id, editNameValue.trim());
                                setEditingFieldId(null);
                              }}
                              className="p-1 rounded bg-amber-500 text-black hover:bg-amber-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{f.name}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                              {f.type}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingFieldId(f.id);
                              setEditNameValue(f.name);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeField(node.id, f.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={f.value || ""}
                        onChange={(e) => updateNodeFieldVal(node.id, f.id, e.target.value)}
                        rows={2}
                        placeholder={`Enter ${f.name} test value...`}
                        className="w-full bg-black border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Add New Field Form */}
              <form onSubmit={handleAddFieldSubmit} className="p-4 rounded-xl border border-neutral-800 bg-[#09090b] space-y-3">
                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block">
                  Add New Input Variable
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Field name (e.g. User Prompt)"
                    className="flex-1 bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as "text" | "image")}
                    className="bg-[#121215] border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newFieldName.trim()}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variable Field</span>
                </button>
              </form>
            </div>
          )}

          {/* Response (Workflow Response) */}
          {node.type === "Response" && (
            <div className="space-y-5">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                Workflow Output Payload
              </span>

              <div className="p-4 rounded-xl border border-neutral-800 bg-[#121215] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">Latest Result</span>
                  <button
                    onClick={() => handleCopyOutput(data.value || "")}
                    disabled={!data.value}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                    <span>{copied ? "Copied!" : "Copy Payload"}</span>
                  </button>
                </div>

                <div className="text-xs font-mono text-blue-300 bg-black p-3 rounded-lg border border-neutral-800 min-h-[120px] whitespace-pre-wrap break-all">
                  {data.value ? data.value : "No execution payload produced yet. Run workflow to test output."}
                </div>
              </div>
            </div>
          )}

          {/* Telegram Form */}
          {node.type === "Telegram" && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  <span>Target Bot Account</span>
                </label>
                <select
                  value={credentialId}
                  onChange={(e) => {
                    updateNodeData(node.id, "credentialId", e.target.value);
                    updateNodeData(node.id, "secretTag", e.target.value);
                  }}
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="">Default Platform Bot (@asprin_dev_bot)</option>
                  {workflowSecrets.length > 0 && (
                    <optgroup label="Workflow Secrets">
                      {workflowSecrets.map((s) => (
                        <option key={s.key} value={s.key}>{s.key}</option>
                      ))}
                    </optgroup>
                  )}
                  {savedCredentials.filter(c => c.type === "TELEGRAM").length > 0 && (
                    <optgroup label="Saved Account Credentials">
                      {savedCredentials.filter(c => c.type === "TELEGRAM").map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Telegram Chat ID</span>
                  <span className="text-[10px] text-neutral-400 font-mono">e.g. -100123456789</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatId}
                      onChange={(e) => updateNodeData(node.id, "chatId", e.target.value)}
                      placeholder="Enter Chat ID..."
                      className="flex-1 bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoDetectChatId(credentialId)}
                      disabled={tgTestStatus?.loading}
                      className="px-2.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 shrink-0"
                      title="Auto-detect Chat ID from latest message sent to @asprin_dev_bot"
                    >
                      <span>🔍 Detect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTestTelegram(chatId, credentialId)}
                      disabled={tgTestStatus?.loading || !chatId}
                      className="px-3 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
                      title="Send Hello World test ping to verify connection"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{tgTestStatus?.loading ? "Testing..." : "Test Ping"}</span>
                    </button>
                  </div>

                  {tgTestStatus && !tgTestStatus.loading && (
                    <div className={`p-2.5 rounded-lg border text-xs font-medium ${
                      tgTestStatus.success 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      {tgTestStatus.message}
                    </div>
                  )}

                  <p className="text-[11px] text-neutral-400 leading-snug">
                    💡 Add <span className="text-sky-400 font-bold">@asprin_dev_bot</span> to your group or channel first, then enter Chat ID.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Alert Message Text
                </label>
                <textarea
                  value={message}
                  onChange={(e) => updateNodeData(node.id, "message", e.target.value)}
                  rows={4}
                  placeholder="Alert payload message text..."
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>
            </div>
          )}

          {/* Resend Email Form */}
          {node.type === "ResendEmail" && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sender Account & Key</span>
                </label>
                <select
                  value={credentialId}
                  onChange={(e) => {
                    updateNodeData(node.id, "credentialId", e.target.value);
                    updateNodeData(node.id, "secretTag", e.target.value);
                  }}
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="">Default Service (System Environment Key)</option>
                  {workflowSecrets.length > 0 && (
                    <optgroup label="Workflow Secrets">
                      {workflowSecrets.map((s) => (
                        <option key={s.key} value={s.key}>{s.key}</option>
                      ))}
                    </optgroup>
                  )}
                  {savedCredentials.filter(c => c.type === "RESEND").length > 0 && (
                    <optgroup label="Saved Account Credentials">
                      {savedCredentials.filter(c => c.type === "RESEND").map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Recipient Email (To)</span>
                  <span className="text-[10px] text-neutral-400 font-mono">e.g. bishtamber0@gmail.com</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={to}
                      onChange={(e) => updateNodeData(node.id, "to", e.target.value)}
                      placeholder="user@example.com"
                      className="flex-1 bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleTestResendEmail(to, credentialId)}
                      disabled={emailTestStatus?.loading || !to}
                      className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
                      title="Send Hello World test email to verify connection"
                    >
                      <ResendMailLogo className="w-3.5 h-3.5 text-rose-400" />
                      <span>{emailTestStatus?.loading ? "Testing..." : "Test Ping"}</span>
                    </button>
                  </div>

                  {emailTestStatus && !emailTestStatus.loading && (
                    <div className={`p-2.5 rounded-lg border text-xs font-medium ${
                      emailTestStatus.success 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      {emailTestStatus.message}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => updateNodeData(node.id, "subject", e.target.value)}
                  placeholder="Workflow report..."
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Email Body Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => updateNodeData(node.id, "body", e.target.value)}
                  rows={5}
                  placeholder="Email body text or HTML payload..."
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Gemini / OpenRouter Form */}
          {(node.type === "Gemini" || node.type === "OpenRouter") && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1.5">
                  Select Free AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => updateNodeData(node.id, "model", e.target.value)}
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="openrouter/free">openrouter/free (Auto Best Free Router - Default)</option>
                  <option value="google/gemma-4-31b-it:free">google/gemma-4-31b-it:free (Google Gemma 4 31B Free)</option>
                  <option value="google/gemma-4-26b-a4b-it:free">google/gemma-4-26b-a4b-it:free (Google Gemma 4 26B Free)</option>
                  <option value="nvidia/nemotron-nano-12b-v2-vl:free">nvidia/nemotron-nano-12b-v2-vl:free (NVIDIA Vision Multimodal Free)</option>
                  <option value="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free">nvidia/nemotron-3-nano-omni:free (NVIDIA Omni Reasoning Free)</option>
                  <option value="openai/gpt-oss-20b:free">openai/gpt-oss-20b:free (OpenAI GPT OSS 20B Free)</option>
                  <option value="cohere/north-mini-code:free">cohere/north-mini-code:free (Cohere Code Free)</option>
                  <option value="inclusionai/ling-3.0-tiny:free">inclusionai/ling-3.0-tiny:free (InclusionAI Free)</option>
                </select>
                <p className="text-[11px] text-neutral-400 mt-1.5 leading-snug">
                  ✨ 100% Free models pre-configured with maximum daily credits.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  System Instructions
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => updateNodeData(node.id, "systemPrompt", e.target.value)}
                  rows={3}
                  placeholder="You are an expert AI assistant..."
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  User Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => updateNodeData(node.id, "prompt", e.target.value)}
                  rows={4}
                  placeholder="Enter prompt or wire input from upstream node..."
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Tavily Form */}
          {(node.type === "Tavily" || node.type === "TavilySearch") && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  Web Search Query
                </label>
                <textarea
                  value={query}
                  onChange={(e) => updateNodeData(node.id, "query", e.target.value)}
                  rows={4}
                  placeholder="Enter topic or question to search live web..."
                  className="w-full bg-[#121215] border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Execution Output Status Card */}
          {data.outputResult && (
            <div className="rounded-xl border border-neutral-800 bg-[#121215] p-4 space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Latest Execution Output
              </span>
              <div className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {typeof data.outputResult === "object"
                  ? JSON.stringify(data.outputResult, null, 2)
                  : String(data.outputResult)}
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-neutral-800 bg-[#09090b] flex items-center justify-between">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Node</span>
          </button>

          <button
            onClick={() => setSelectedNodeId(null)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

      {/* Delete Node Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Delete Node?</h4>
                <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                  Are you sure you want to delete <span className="text-white font-semibold">"{getNodeTitle()}"</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteNode(node.id);
                  setSelectedNodeId(null);
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
