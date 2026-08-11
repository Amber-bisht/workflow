"use client";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

export default function AppHeader({ title, subtitle, badgeText, children }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4 mb-6">
      <div>
        {badgeText && (
          <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase tracking-widest block mb-0.5">
            {badgeText}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && <p className="text-neutral-400 text-xs mt-1">{subtitle}</p>}
      </div>

      {children && (
        <div className="flex items-center gap-2.5">
          {children}
        </div>
      )}
    </div>
  );
}
