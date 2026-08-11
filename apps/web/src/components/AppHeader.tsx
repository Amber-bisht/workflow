"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, badgeText = "Dashboard", children }: AppHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch("/api/billing/status", { headers: { "x-user-id": user.id } })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.total === "number") {
            setCredits(data.total);
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-6 mb-8">
      <div>
        <span className="text-[11px] font-bold font-mono text-neutral-500 uppercase tracking-widest">
          {badgeText}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
          {title}
        </h1>
        {subtitle && <p className="text-neutral-400 text-xs sm:text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Credit Badge */}
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold font-mono transition-all cursor-pointer shadow-sm active:scale-95"
          title="View Credit Balance & Plans"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{credits !== null ? `${credits} Credits` : "100 Credits"}</span>
        </Link>

        {children}
      </div>
    </div>
  );
}
