"use client";

import { signIn } from "next-auth/react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm bg-neutral-900 border border-white/15 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center gap-6 z-10 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <rect x="2" y="3" width="5" height="18" rx="2.5" />
            <rect x="9" y="8" width="5" height="5" rx="2.5" />
            <rect x="9" y="15" width="5" height="5" rx="2.5" />
            <rect x="16" y="11" width="5" height="5" rx="2.5" />
          </svg>
          <span className="text-base font-bold text-white font-mono tracking-tight">
            automation.amberbisht.me
          </span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Build & execute visual AI workflows
          </p>
        </div>

        {/* Direct Google Sign In Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 bg-white hover:bg-neutral-100 text-black font-semibold text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

      </div>
    </div>
  );
}
