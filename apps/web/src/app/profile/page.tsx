"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
      <AppSidebar activePath="profile" />

      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-6xl space-y-6 pb-16">
          
          <AppHeader title="My Profile" />

          {/* Merged Single Profile Card */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            
            {/* Top User Info Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                {user?.image ? (
                  <img src={user.image} alt="User Avatar" className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-md shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl border border-white/10 shadow-md shrink-0 select-none">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="space-y-0.5">
                  <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || "Account User"}</h2>
                  <p className="text-xs text-neutral-400 font-mono">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-semibold transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="h-[1px] bg-white/10 w-full" />

            {/* Account Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-neutral-950">
                <span className="text-xs text-neutral-400 font-medium">Authentication</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google OAuth 2.0</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-neutral-950">
                <span className="text-xs text-neutral-400 font-medium">User ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-neutral-300 truncate max-w-[140px] sm:max-w-[180px]">{user?.id || "N/A"}</span>
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

            <div className="h-[1px] bg-white/10 w-full" />

            {/* Billing Redirect Link inside single card */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white tracking-tight">Credits & Billing Plan</h3>
                <p className="text-xs text-neutral-400">View credit balance and top-up credits via Razorpay.</p>
              </div>

              <Link
                href="/billing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Manage Billing & Plans</span>
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
