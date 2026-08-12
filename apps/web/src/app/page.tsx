"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  ArrowRight,
  Bot,
  Sparkles,
  Zap,
  Search,
  Send,
  Mail,
  Image as ImageIcon,
  Activity,
  Brain
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function KreaExactLandingPage() {
  const { data: session, status } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Showcase Cards — real local workflow screenshots
  const showcaseCards = [
    {
      title: "AI Research Pipeline",
      prompt: "Search web → summarise with GPT-4o → Telegram alert",
      image: "/web+gpt+tg.png",
      action: "Build this",
    },
    {
      title: "Website Monitor & Alert",
      prompt: "Monitor uptime → detect change → notify on failure",
      image: "/up+change+notify.png",
      action: "Try monitor",
    },
    {
      title: "Web Research → Email Report",
      prompt: "Trigger web search → LLM summarise → send email report",
      image: "/web+trigger+email.png",
      action: "Build pipeline",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">

      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ── Fixed Navigation Header ──────────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full z-40">
        {/* Ticker Banner */}
        <div className="w-full bg-blue-600 overflow-hidden py-1.5">
          <div className="flex whitespace-nowrap animate-[ticker_22s_linear_infinite]">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="inline-flex items-center gap-6 px-10 text-white text-xs font-medium tracking-wide shrink-0">
                <span>⚡ This platform is made by <strong>Amber Bisht</strong></span>
                <span className="opacity-50">·</span>
                <span>See the work at <a href="https://amberbisht.me" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-semibold hover:text-blue-200 transition-colors">amberbisht.me</a></span>
                <span className="opacity-50">·</span>
                <span>Mail: <a href="mailto:bishtamber0@gmail.com" className="underline underline-offset-2 font-semibold hover:text-blue-200 transition-colors">bishtamber0@gmail.com</a></span>
                <span className="opacity-50">——</span>
              </span>
            ))}
          </div>
        </div>

        <header className="relative w-full mx-auto px-4 sm:px-6 lg:px-12 py-4 border-b border-white/15 backdrop-blur-xl bg-black/70 transition-all duration-300">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">

            {/* Brand Logo */}
            <Link href="/" aria-label="Return to home" className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="3" width="5" height="18" rx="2.5" />
                <rect x="9" y="8" width="5" height="5" rx="2.5" />
                <rect x="9" y="15" width="5" height="5" rx="2.5" />
                <rect x="16" y="11" width="5" height="5" rx="2.5" />
              </svg>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white font-mono">
                automation.amberbisht.me
              </span>
            </Link>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center h-[36px] px-5 text-xs sm:text-sm font-semibold text-black bg-white rounded-full hover:bg-neutral-200 transition-all active:scale-95 text-nowrap cursor-pointer shadow-md"
                >
                  View Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center justify-center h-[36px] px-5 text-xs sm:text-sm font-semibold text-black bg-white rounded-full hover:bg-neutral-200 transition-all active:scale-95 text-nowrap cursor-pointer shadow-md"
                  >
                    Sign up for free
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center justify-center h-[36px] px-5 text-xs sm:text-sm font-semibold text-white bg-[#262626] rounded-full hover:bg-neutral-800 transition-all active:scale-95 text-nowrap cursor-pointer"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

          </div>
        </header>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div data-hero-root="true" className="hero-section">
        <div className="relative h-[69px] z-10">
          <div className="absolute bg-black inset-0" />
        </div>
        <section
          className="relative isolate mx-auto overflow-hidden text-center flex flex-col items-center justify-start pt-12 sm:pt-16 pb-28"
          style={{
            minHeight: "calc(100vh - 69px)",
            paddingLeft: "20px",
            paddingRight: "20px",
            backgroundColor: "#05080d"
          }}
        >
          {/* Hero Image */}
          <Image
            src="/hero.png"
            alt="automation.amberbisht.me AI Workflow Canvas"
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 z-0 w-full h-full object-cover [object-position:center_70%] pointer-events-none select-none"
          />

          {/* Gradients */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0.28) 56%, rgba(0,0,0,0.6) 100%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ background: "radial-gradient(ellipse 80% 45% at 50% 24%, rgba(18,54,86,0.42) 0%, rgba(0,0,0,0) 70%)" }}
          />

          {/* Hero Content */}
          <div className="relative z-20 mx-auto flex flex-col items-center max-w-[980px] -translate-y-2 sm:-translate-y-4">
            <h1
              aria-label="automation.amberbisht.me — Build AI workflows visually. Run them anywhere."
              className="text-[#f5f5f5] text-center max-w-[960px]"
              style={{
                fontSize: "clamp(32px, 5.5vw, 56px)",
                lineHeight: "1.05",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                textShadow: "0 2px 20px rgba(0,0,0,0.45)",
                fontFamily: '"Suisse Intl", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Build AI workflows visually.<br />Run them anywhere.
            </h1>

            <p
              className="text-[#d4d4d4] text-center max-w-[780px] mt-[14px]"
              style={{
                fontSize: "clamp(14px, 1.3vw, 20px)",
                lineHeight: "1.45",
                fontWeight: 450,
                textShadow: "0 1px 10px rgba(0,0,0,0.45)",
                fontFamily: '"Suisse Intl", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Chain LLMs, web search, image processing, email, Telegram and monitoring — all from a drag-and-drop node canvas.
            </p>

            <div className="flex items-center justify-center gap-[12px] mt-[22px] flex-wrap">
              {status === "authenticated" ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-full px-8 text-[15px] font-semibold text-white bg-white/15 border border-white/30 backdrop-blur-md no-underline transition-all duration-200 hover:bg-white/25 hover:border-white/50 active:scale-[0.98] cursor-pointer shadow-lg"
                >
                  View Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex h-11 items-center justify-center rounded-full px-8 text-[15px] font-semibold text-white bg-white/15 border border-white/30 backdrop-blur-md no-underline transition-all duration-200 hover:bg-white/25 hover:border-white/50 active:scale-[0.98] cursor-pointer shadow-lg"
                >
                  Start for free
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── Section 1: Showcase Cards ──────────────────────────────────────── */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-[1600px] mx-auto px-6 overflow-hidden">
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
            {showcaseCards.map((card, idx) => (
              <div
                key={idx}
                className="shrink-0 w-[340px] sm:w-[440px] lg:w-[480px] bg-black cursor-pointer group
                  opacity-0 translate-y-8 transition-all duration-700 ease-out
                  [&.in-view]:opacity-100 [&.in-view]:translate-y-0"
                style={{ transitionDelay: `${idx * 120}ms` }}
                ref={(el) => {
                  if (!el) return;
                  const obs = new IntersectionObserver(
                    ([entry]) => {
                      if (entry.isIntersecting) {
                        el.classList.add("in-view");
                        obs.disconnect();
                      }
                    },
                    { threshold: 0.15 }
                  );
                  obs.observe(el);
                }}
              >
                {/* Image — full width, no rounding */}
                <div className="w-full overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={800}
                    height={600}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Text below image */}
                <div className="pt-4 pb-2 space-y-1">
                  <div className="text-neutral-500 text-[10px] font-bold tracking-[2px] uppercase">
                    PROMPT
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-snug">
                    &ldquo;{card.prompt}&rdquo;
                  </p>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {card.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Node Badges ─────────────────────────────────────────── */}
      <section className="py-20 bg-neutral-950 text-white border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-xs font-bold font-mono text-neutral-500 uppercase tracking-widest">
            Unified Node Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
            Every integration you need. In one workflow.
          </h2>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {[
              { name: "OpenRouter LLM", icon: <Brain className="w-4 h-4 text-purple-400" /> },
              { name: "GPT-4o", icon: <Bot className="w-4 h-4 text-emerald-400" /> },
              { name: "Claude 5", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
              { name: "Gemini 3.6", icon: <Zap className="w-4 h-4 text-blue-400" /> },
              { name: "Tavily Search", icon: <Search className="w-4 h-4 text-cyan-400" /> },
              { name: "Telegram", icon: <Send className="w-4 h-4 text-sky-400" /> },
              { name: "Resend Email", icon: <Mail className="w-4 h-4 text-rose-400" /> },
              { name: "ImageKit CDN", icon: <ImageIcon className="w-4 h-4 text-orange-400" /> },
              { name: "Website Monitor", icon: <Activity className="w-4 h-4 text-green-400" /> },
            ].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-all cursor-default shadow-sm"
              >
                {item.icon}
                <span>{item.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Feature Banners ─────────────────────────────────────── */}
      <section className="py-24 bg-black text-white px-6 space-y-28 max-w-[1300px] mx-auto">

        {/* Feature 1: Build logic with nodes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Build logic with nodes, not code.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              Drag, drop, and wire nodes on a React Flow canvas. Undo/redo, export layouts, and run your entire workflow in one click.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95"
              >
                <span>Open Workflow Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-black">
            <Image
              src="/example.png"
              alt="Visual workflow node canvas"
              width={1200}
              height={800}
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* Feature 2: Every frontier model */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-black order-2 lg:order-1">
            <Image
              src="/apirouter.png"
              alt="Multi-model AI router"
              width={1200}
              height={800}
              className="w-full object-contain"
            />
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Every frontier model. One node.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              The OpenRouter node gives you GPT-4o, Claude 3.5, Gemini 2.0, Llama, and Mistral — switch models with a single dropdown, no API key juggling.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
              >
                <span>Try LLM Node</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature 3: Watch the web */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Watch the web. Alert your team.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              Connect a Website Monitor node to Telegram or Email — your workflow fires automatically when uptime drops or content changes are detected.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
              >
                <span>Set up monitoring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-black">
            <Image
              src="/indian.png"
              alt="Website monitoring dashboard"
              width={1200}
              height={800}
              className="w-full object-contain"
            />
          </div>
        </div>

      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}

      <footer className="border-t border-neutral-900 py-16 px-6 bg-black text-neutral-400 text-sm">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="3" width="5" height="18" rx="2.5" />
                <rect x="9" y="8" width="5" height="5" rx="2.5" />
                <rect x="9" y="15" width="5" height="5" rx="2.5" />
                <rect x="16" y="11" width="5" height="5" rx="2.5" />
              </svg>
              <span className="font-bold text-white text-base font-mono">
                automation.amberbisht.me
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              Visual node-based AI workflow automation. Built with Next.js, Bun, Hono, OpenRouter, BullMQ, Tavily, and ImageKit CDN.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Workflow Canvas</Link></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Node Library</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Run History</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Monitoring & Alerts</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Log In with Google</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Sign Up Free</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div>© {new Date().getFullYear()} automation.amberbisht.me. All rights reserved.</div>
          <div className="flex gap-6">
            <span className="hover:text-neutral-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
