"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Key, 
  Send, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  Check, 
  Plus, 
  Sparkles,
  Lock
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

interface SavedCredential {
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  metadata: {
    botTokenMasked?: string;
    chatId?: string;
    resendApiKeyMasked?: string;
    fromEmail?: string;
  };
}

export default function CredentialsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [credentials, setCredentials] = useState<SavedCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [tgName, setTgName] = useState("My Telegram Bot");
  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [isSavingTg, setIsSavingTg] = useState(false);

  const [resendName, setResendName] = useState("My Resend Account");
  const [resendKey, setResendKey] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isSavingResend, setIsSavingResend] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/credentials?userId=" + (user?.id || "default_user"));
      const data = await res.json();
      if (data.success) {
        setCredentials(data.credentials || []);
      }
    } catch (err) {
      console.error("Failed to fetch credentials", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCredentials();
    }
  }, [user?.id]);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tgToken) return alert("Please enter your Telegram Bot Token");
    setIsSavingTg(true);

    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "default_user",
          name: tgName,
          type: "TELEGRAM",
          payload: {
            botToken: tgToken,
            chatId: tgChatId,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTgToken("");
        setTgChatId("");
        fetchCredentials();
      } else {
        alert(data.error || "Failed to save Telegram credentials");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingTg(false);
    }
  };

  const handleSaveResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendKey) return alert("Please enter your Resend API Key");
    setIsSavingResend(true);

    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "default_user",
          name: resendName,
          type: "RESEND",
          payload: {
            resendApiKey: resendKey,
            fromEmail: resendEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResendKey("");
        setResendEmail("");
        fetchCredentials();
      } else {
        alert(data.error || "Failed to save Resend credentials");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingResend(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this encrypted credential?")) return;
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchCredentials();
      }
    } catch (err) {
      alert("Failed to delete credential");
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      <AppSidebar activePath="credentials" />

      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-6xl space-y-6 pb-16">
          <AppHeader title="Credentials Vault" />

          {/* Banner Security Notice */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-xs tracking-tight">AES-256-GCM Encrypted Storage</h4>
                <p className="text-[11px] text-amber-200/80 leading-snug">
                  Personal integration keys are encrypted at rest with random IVs & authentication tags. OpenRouter AI & Tavily Search are managed by platform credits.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold text-amber-300 shrink-0">
              <Lock className="h-3 w-3" /> AES-256
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Telegram Credentials Card */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 space-y-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Telegram Bot Credentials</h3>
                    <p className="text-xs text-neutral-400">Personal Bot Token & Default Chat ID</p>
                  </div>
                </div>

                <form onSubmit={handleSaveTelegram} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Credential Name
                    </label>
                    <input
                      type="text"
                      value={tgName}
                      onChange={(e) => setTgName(e.target.value)}
                      placeholder="e.g. Sales Alerts Bot"
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Bot Token (Encrypted)
                    </label>
                    <input
                      type="password"
                      value={tgToken}
                      onChange={(e) => setTgToken(e.target.value)}
                      placeholder="123456789:ABCdefGhIJKlmNoPQ..."
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Default Chat ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={tgChatId}
                      onChange={(e) => setTgChatId(e.target.value)}
                      placeholder="e.g. -100123456789"
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono transition-all"
                    />
                  </div>

                  <p className="text-[10px] text-neutral-500 leading-tight">
                    💡 Optional: NextFlow uses default bot <strong className="text-neutral-300">@NextFlowAlertsBot</strong> if no key is saved.
                  </p>

                  <button
                    type="submit"
                    disabled={isSavingTg}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingTg ? "Encrypting & Saving..." : "Save Telegram Key"}
                  </button>
                </form>
              </div>
            </div>

            {/* Resend Credentials Card */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 space-y-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Resend Email Credentials</h3>
                    <p className="text-xs text-neutral-400">Personal Resend API Key & Verified Domain</p>
                  </div>
                </div>

                <form onSubmit={handleSaveResend} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Credential Name
                    </label>
                    <input
                      type="text"
                      value={resendName}
                      onChange={(e) => setResendName(e.target.value)}
                      placeholder="e.g. Custom Domain Resend"
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Resend API Key (Encrypted)
                    </label>
                    <input
                      type="password"
                      value={resendKey}
                      onChange={(e) => setResendKey(e.target.value)}
                      placeholder="re_123456789_abcdef..."
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-mono transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Sender Email (From Domain)
                    </label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="e.g. alerts@yourdomain.com"
                      className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-all"
                    />
                  </div>

                  <p className="text-[10px] text-neutral-500 leading-tight">
                    💡 Optional: NextFlow sends from <strong className="text-neutral-300">notifications@amberbisht.me</strong> by default.
                  </p>

                  <button
                    type="submit"
                    disabled={isSavingResend}
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingResend ? "Encrypting & Saving..." : "Save Resend Key"}
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Configured Vault Credentials List */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-2xl backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              <span>Configured Vault Keys ({credentials.length})</span>
            </h3>

            {isLoading ? (
              <div className="text-center py-6 text-neutral-500 text-xs font-mono">Loading encrypted keys...</div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-neutral-500 text-xs">
                No custom credentials saved yet. Default platform keys will be used automatically.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {credentials.map((cred) => (
                  <div key={cred.id} className="p-4 rounded-2xl border border-white/10 bg-neutral-950 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate">{cred.name}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 uppercase">
                          {cred.type}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 truncate">
                        {cred.metadata.botTokenMasked || cred.metadata.resendApiKeyMasked || "AES-256 Encrypted"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(cred.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-all cursor-pointer shrink-0"
                      title="Delete Key"
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
