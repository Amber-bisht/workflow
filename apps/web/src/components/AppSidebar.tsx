"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Workflow,
  Layers,
  User,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Key
} from "lucide-react";

interface AppSidebarProps {
  activePath: "workflows" | "nodes" | "profile" | "billing" | "credentials";
  onNewWorkflow?: () => void;
}

export default function AppSidebar({ activePath, onNewWorkflow }: AppSidebarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewClick = () => {
    if (onNewWorkflow) {
      onNewWorkflow();
    } else {
      router.push("/dashboard?create=true");
    }
  };

  return (
    <aside
      className={`h-full bg-black border-r border-white/10 flex flex-col justify-between p-4 transition-all duration-300 z-30 shrink-0 ${isCollapsed ? "w-16 items-center" : "w-64"
        }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col gap-5 w-full">
        <div className="flex items-center justify-between w-full pb-1 border-b border-white/10 pb-4">
          <Link href="/" className="flex items-center gap-3 overflow-hidden min-w-0 group py-1">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white" className="shrink-0 group-hover:scale-105 transition-transform">
              <rect x="2" y="3" width="5" height="18" rx="2.5" />
              <rect x="9" y="8" width="5" height="5" rx="2.5" />
              <rect x="9" y="15" width="5" height="5" rx="2.5" />
              <rect x="16" y="11" width="5" height="5" rx="2.5" />
            </svg>

            {!isCollapsed && (
              <div className="flex flex-col leading-snug">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white font-mono group-hover:text-blue-400 transition-colors uppercase">
                  automation
                </span>
                <span className="text-xs text-neutral-400 font-mono tracking-tight -mt-0.5">
                  by  amberbisht.me
                </span>
              </div>
            )}
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10 bg-neutral-900 cursor-pointer shrink-0 ml-1"
            title={isCollapsed ? "Expand sidebar (⌘.)" : "Collapse sidebar (⌘.)"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 w-full">
          <button
            onClick={handleNewClick}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer w-full shadow-sm ${isCollapsed ? "justify-center px-0" : ""
              }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>New Workflow</span>}
          </button>

          <div className="h-[1px] bg-white/10 my-1.5 w-full" />

          {/* Nav item: Workflows */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold w-full cursor-pointer ${activePath === "workflows"
                ? "bg-white/10 text-white border border-white/15"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
          >
            <Workflow className={`w-4 h-4 shrink-0 ${activePath === "workflows" ? "text-blue-400" : "text-neutral-500"}`} />
            {!isCollapsed && <span>Workflows</span>}
          </Link>

          {/* Nav item: Node Library */}
          <Link
            href="/nodes"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold w-full cursor-pointer ${activePath === "nodes"
                ? "bg-white/10 text-white border border-white/15"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
          >
            <Layers className={`w-4 h-4 shrink-0 ${activePath === "nodes" ? "text-purple-400" : "text-neutral-500"}`} />
            {!isCollapsed && <span>Node Library</span>}
          </Link>

          {/* Nav item: My Profile */}
          <Link
            href="/profile"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold w-full cursor-pointer ${activePath === "profile"
                ? "bg-white/10 text-white border border-white/15"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
          >
            <User className={`w-4 h-4 shrink-0 ${activePath === "profile" ? "text-blue-400" : "text-neutral-500"}`} />
            {!isCollapsed && <span>My Profile</span>}
          </Link>

          {/* Nav item: Billing & Plans */}
          <Link
            href="/billing"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold w-full cursor-pointer ${activePath === "billing"
                ? "bg-white/10 text-white border border-white/15"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
          >
            <CreditCard className={`w-4 h-4 shrink-0 ${activePath === "billing" ? "text-emerald-400" : "text-neutral-500"}`} />
            {!isCollapsed && <span>Billing & Plans</span>}
          </Link>

          {/* Nav item: Credentials Vault */}
          <Link
            href="/credentials"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-semibold w-full cursor-pointer ${activePath === "credentials"
                ? "bg-white/10 text-white border border-white/15"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
          >
            <Key className={`w-4 h-4 shrink-0 ${activePath === "credentials" ? "text-amber-400" : "text-neutral-500"}`} />
            {!isCollapsed && <span>Credentials Vault</span>}
          </Link>
        </nav>
      </div>

      {/* User Profile & Sign Out at bottom */}
      <div className="flex flex-col gap-3 w-full border-t border-white/10 pt-3">
        {isCollapsed ? (
          <Link
            href="/profile"
            title="View Profile & Billing"
            className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex justify-center cursor-pointer"
          >
            <User className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/profile"
            className={`flex items-center justify-between w-full p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group ${activePath === "profile" ? "bg-white/5" : ""
              }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              {user?.image ? (
                <img src={user.image} alt="User Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-white/10">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{user?.name || "User"}</p>
                <p className="text-[11px] text-neutral-500 truncate">{user?.email || ""}</p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                signOut({ callbackUrl: "/" });
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>
    </aside>
  );
}
