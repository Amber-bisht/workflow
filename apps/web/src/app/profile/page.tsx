"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  CreditCard,
  LogOut,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      {/* ── App Sidebar ─────────────────────────────────────────────────────── */}
      <AppSidebar activePath="profile" />

      {/* ── Profile Main Panel ──────────────────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-5xl mx-auto space-y-8 pb-16">
          
          {/* Header */}
          <AppHeader
            title="My Profile"
            subtitle="Manage your user credentials, security details, and subscription links."
            badgeText="Account Settings"
          >
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Plans</span>
            </Link>
          </AppHeader>

          {/* User Avatar & Name Banner */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-neutral-900 via-neutral-900 to-blue-950/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-5 z-10">
              {user?.image ? (
                <img src={user.image} alt="User Avatar" className="w-20 h-20 rounded-2xl object-cover border border-white/15 shadow-xl shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-3xl border border-white/15 shadow-xl shrink-0 select-none">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name || "Account User"}</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    Verified User
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-semibold transition-all cursor-pointer z-10 shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
          </div>

          {/* Account Details Card */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white tracking-tight border-b border-white/10 pb-4">Account Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl border border-white/10 bg-neutral-950 space-y-1">
                <span className="text-[11px] font-mono font-semibold text-neutral-500 uppercase tracking-wider block">Full Name</span>
                <p className="text-sm font-semibold text-white">{user?.name || "Not provided"}</p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-neutral-950 space-y-1">
                <span className="text-[11px] font-mono font-semibold text-neutral-500 uppercase tracking-wider block">Email Address</span>
                <p className="text-sm font-semibold text-white">{user?.email || "Not provided"}</p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-neutral-950 space-y-1">
                <span className="text-[11px] font-mono font-semibold text-neutral-500 uppercase tracking-wider block">Authentication Provider</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Google OAuth 2.0</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-neutral-950 space-y-1">
                <span className="text-[11px] font-mono font-semibold text-neutral-500 uppercase tracking-wider block">User ID</span>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-mono text-neutral-400 truncate">{user?.id || "N/A"}</p>
                  {user?.id && (
                    <button
                      onClick={copyUserId}
                      className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy User ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Billing Redirect Card */}
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-neutral-900 to-emerald-950/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white tracking-tight">Billing, Credits & Subscription</h4>
              <p className="text-xs text-neutral-400">View credit balance, credit costs, or top-up paid credits via Razorpay.</p>
            </div>
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shrink-0 shadow-lg active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Go to Billing & Plans</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
