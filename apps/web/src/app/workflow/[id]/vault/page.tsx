"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Key, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  RefreshCw
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

interface SecretItem {
  id: string;
  key: string;
  valueMasked: string;
  updatedAt: string;
}

interface VaultPageProps {
  params: Promise<{ id: string }>;
}

// Solid Brand Logos
function TelegramLogo() {
  return (
    <div className="w-8 h-8 rounded-xl bg-[#229ED9] flex items-center justify-center text-white shrink-0 shadow-md">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.4-3.63 4-.17 4.83.69 4.74 2.49z" />
      </svg>
    </div>
  );
}

function ResendLogo() {
  return (
    <div className="w-8 h-8 rounded-xl bg-[#F43F5E] flex items-center justify-center text-white shrink-0 shadow-md">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    </div>
  );
}

export default function WorkflowVaultPage({ params }: VaultPageProps) {
  const { id: workflowId } = use(params);
  const router = useRouter();

  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [keyInput, setKeyInput] = useState("");
  const [valInput, setValInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSecrets = async () => {
    try {
      const res = await fetch(`/api/workflow/${workflowId}/secrets`);
      const data = await res.json();
      if (data.success) {
        setSecrets(data.secrets || []);
      }
    } catch (err) {
      console.error("Failed to fetch workflow secrets", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workflowId) {
      fetchSecrets();
    }
  }, [workflowId]);

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput || !valInput) return alert("Please enter Secret Key Name and Value");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/workflow/${workflowId}/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: keyInput,
          value: valInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setKeyInput("");
        setValInput("");
        fetchSecrets();
      } else {
        alert(data.error || "Failed to save secret");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSecret = async (key: string) => {
    if (!confirm(`Delete secret key "${key}"?`)) return;
    try {
      const res = await fetch(`/api/workflow/${workflowId}/secrets/${key}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchSecrets();
      }
    } catch (err) {
      alert("Failed to delete secret");
    }
  };

  const handlePresetClick = (presetKey: string) => {
    setKeyInput(presetKey);
  };

  const handleCopyTag = (key: string) => {
    navigator.clipboard.writeText(`secrets.${key}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      <AppSidebar activePath="workflows" />

      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-6xl space-y-6 pb-16">

          {/* Standard App Header */}
          <AppHeader 
            title="Workflow Vault" 
            subtitle="Manage API keys and secrets for this workflow."
          >
            <Link
              href={`/workflow/${workflowId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 text-white font-bold text-xs transition-all cursor-pointer shadow-md shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Canvas</span>
            </Link>
          </AppHeader>

          {/* Grid Layout: Add Secret Form & Presets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Secret Input Form (Solid Background) */}
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-neutral-900 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-400" />
                    <span>Add New Secret</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Enter key tag name and secret value below.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSecret} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Secret Key Tag
                  </label>
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="e.g. TELEGRAM_BOT_TOKEN or RESEND_API_KEY"
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 font-mono uppercase focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Secret Value
                  </label>
                  <input
                    type="password"
                    value={valInput}
                    onChange={(e) => setValInput(e.target.value)}
                    placeholder="Enter key or token payload..."
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>{isSubmitting ? "Saving..." : "Save Secret"}</span>
                </button>
              </form>
            </div>

            {/* Solid Presets Panel */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6 space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    Quick Integrations
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Select an integration type:
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Telegram Bot */}
                  <button
                    type="button"
                    onClick={() => handlePresetClick("TELEGRAM_BOT_TOKEN")}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-neutral-950 hover:bg-white/5 text-white transition-all cursor-pointer text-left"
                  >
                    <TelegramLogo />
                    <div>
                      <span className="font-bold text-xs block">Telegram Bot</span>
                      <span className="text-[10px] font-mono text-neutral-400">TELEGRAM_BOT_TOKEN</span>
                    </div>
                  </button>

                  {/* Resend Email */}
                  <button
                    type="button"
                    onClick={() => handlePresetClick("RESEND_API_KEY")}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-neutral-950 hover:bg-white/5 text-white transition-all cursor-pointer text-left"
                  >
                    <ResendLogo />
                    <div>
                      <span className="font-bold text-xs block">Resend Email</span>
                      <span className="text-[10px] font-mono text-neutral-400">RESEND_API_KEY</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Configured Vault Secrets List Card */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-400" />
                  <span>Configured Secrets ({secrets.length})</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Secrets available to canvas nodes.</p>
              </div>

              <button
                onClick={fetchSecrets}
                className="p-2 rounded-xl bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Refresh Secrets"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-xs text-neutral-500 font-mono">Loading secrets...</div>
            ) : secrets.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl text-xs text-neutral-500 space-y-2">
                <p className="font-semibold text-neutral-400">No secrets configured for this workflow yet.</p>
                <p className="text-[11px] text-neutral-500">Add a secret tag above to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secrets.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-neutral-950 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs font-mono tracking-wider">{sec.key}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTag(sec.key)}
                          className="text-[10px] bg-white/10 hover:bg-white/20 text-neutral-300 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 font-sans"
                        >
                          {copiedKey === sec.key ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedKey === sec.key ? "Copied" : "Copy Tag"}</span>
                        </button>
                      </div>
                      <p className="text-xs font-mono text-neutral-400 truncate">
                        {sec.valueMasked}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteSecret(sec.key)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer shrink-0"
                      title="Delete Secret"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
