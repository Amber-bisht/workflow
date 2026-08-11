"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  GitBranch,
  Brain,
  Globe,
  Bell,
  CreditCard,
  Play,
  Plus,
  Workflow,
  Mail,
  Search,
  Monitor,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

// Unsplash images — free to use, no attribution required for demos
const HERO_BG =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1800&q=80&auto=format&fit=crop";

const showcaseCards = [
  {
    title: "AI Research Pipeline",
    prompt: '"Search the web → summarize → send Telegram alert"',
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80&auto=format&fit=crop",
    badge: "Workflow",
    action: "Try this workflow",
  },
  {
    title: "Smart Website Monitor",
    prompt: '"Monitor site uptime → detect change → notify on failure"',
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop",
    badge: "Monitoring",
    action: "Build monitor",
  },
  {
    title: "Image Crop & Enhance",
    prompt: '"Upload image → AI crop → upscale → store to CDN"',
    image:
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&q=80&auto=format&fit=crop",
    badge: "Vision",
    action: "Build pipeline",
  },
  {
    title: "LLM Email Responder",
    prompt: '"Trigger on email → OpenRouter LLM → auto-reply via Resend"',
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80&auto=format&fit=crop",
    badge: "Automation",
    action: "Create workflow",
  },
  {
    title: "Multi-Model AI Chain",
    prompt: '"Input → GPT-4o analysis → Claude review → structured output"',
    image:
      "https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=600&q=80&auto=format&fit=crop",
    badge: "AI Chain",
    action: "Start building",
  },
];

const nodeTypes = [
  { icon: <Zap className="w-5 h-5 text-amber-400" />, label: "Request Inputs", desc: "Define workflow entry params", color: "from-amber-500/10 to-amber-500/5 border-amber-500/20" },
  { icon: <Brain className="w-5 h-5 text-blue-400" />, label: "OpenRouter LLM", desc: "Any model: GPT-4o, Claude, Gemini", color: "from-blue-500/10 to-blue-500/5 border-blue-500/20" },
  { icon: <Globe className="w-5 h-5 text-green-400" />, label: "Tavily Search", desc: "Real-time web search results", color: "from-green-500/10 to-green-500/5 border-green-500/20" },
  { icon: <Monitor className="w-5 h-5 text-purple-400" />, label: "Website Monitor", desc: "Uptime & content change alerts", color: "from-purple-500/10 to-purple-500/5 border-purple-500/20" },
  { icon: <Bell className="w-5 h-5 text-rose-400" />, label: "Telegram Alert", desc: "Push notifications to any chat", color: "from-rose-500/10 to-rose-500/5 border-rose-500/20" },
  { icon: <Mail className="w-5 h-5 text-cyan-400" />, label: "Resend Email", desc: "Send transactional emails", color: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20" },
  { icon: <GitBranch className="w-5 h-5 text-orange-400" />, label: "Crop & Transform", desc: "AI-powered image processing", color: "from-orange-500/10 to-orange-500/5 border-orange-500/20" },
  { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, label: "Response Node", desc: "Structured output & results", color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "For solo builders exploring automation",
    features: ["3 workflows", "50 node runs / month", "Community support", "OpenRouter LLM access"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/ month",
    desc: "For power users and small teams",
    features: ["Unlimited workflows", "5,000 node runs / month", "Telegram & Email nodes", "Website monitoring", "Tavily web search", "Priority support"],
    cta: "Start Pro trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "₹1,999",
    period: "/ month",
    desc: "For teams shipping production automation",
    features: ["Everything in Pro", "Unlimited runs", "Credentials vault", "BullMQ job queues", "Dedicated support", "Early access to new nodes"],
    cta: "Contact us",
    highlight: false,
  },
];

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030507] text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ── Fixed Navigation ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full z-40 border-b border-white/8 backdrop-blur-xl bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <rect x="2" y="3" width="5" height="18" rx="2.5" />
              <rect x="9" y="8" width="5" height="5" rx="2.5" />
              <rect x="9" y="15" width="5" height="5" rx="2.5" />
              <rect x="16" y="11" width="5" height="5" rx="2.5" />
            </svg>
            <span className="font-bold text-sm sm:text-base tracking-tight text-white font-mono">
              NextFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#nodes" className="hover:text-white transition-colors">Nodes</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex h-8 items-center px-4 text-xs font-semibold text-neutral-300 hover:text-white bg-white/8 rounded-full border border-white/10 hover:bg-white/12 transition-all cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex h-8 items-center px-4 text-xs font-semibold text-black bg-white rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              Sign up free
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-32 overflow-hidden">
        {/* Background Image */}
        <img
          src={HERO_BG}
          alt="AI Workflow Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030507] via-transparent to-[#030507] pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 60% at 50% 30%, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/8 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5" />
          Visual Node-Based Workflow Automation
        </div>

        {/* Heading */}
        <h1
          className="relative z-10 text-white text-center max-w-[960px]"
          style={{
            fontSize: "clamp(38px, 6vw, 76px)",
            lineHeight: "1.04",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            textShadow: "0 2px 40px rgba(0,0,0,0.6)",
          }}
        >
          Build AI workflows
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            visually, run them anywhere.
          </span>
        </h1>

        <p
          className="relative z-10 text-neutral-400 text-center max-w-[640px] mt-5"
          style={{ fontSize: "clamp(15px, 1.5vw, 19px)", lineHeight: "1.55", fontWeight: 400 }}
        >
          NextFlow is a node-based automation platform. Chain LLMs, web search, image
          processing, email, Telegram, and monitoring — all from a visual canvas.
        </p>

        <div className="relative z-10 flex items-center justify-center gap-3 mt-8 flex-wrap">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full px-8 text-sm font-semibold text-black bg-white hover:bg-neutral-100 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
          >
            Start building free
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 rounded-full px-8 text-sm font-medium text-white border border-white/15 bg-white/6 hover:bg-white/10 transition-all active:scale-[0.98] backdrop-blur-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Open Canvas
          </Link>
        </div>

        {/* Stats row */}
        <div className="relative z-10 mt-16 flex items-center gap-8 sm:gap-14 flex-wrap justify-center">
          {[
            { value: "8+", label: "Node Types" },
            { value: "10+", label: "AI Models" },
            { value: "∞", label: "Workflows" },
            { value: "Real-time", label: "Execution" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                {stat.value}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Showcase Cards ───────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white text-black">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">
              What you can build
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-black mt-2">
              Real workflows, built visually.
            </h2>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {showcaseCards.map((card, idx) => (
              <div
                key={idx}
                className="shrink-0 snap-start w-[280px] sm:w-[360px] lg:w-[380px] h-[480px] relative rounded-[28px] overflow-hidden group bg-neutral-900 shadow-xl cursor-pointer"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className="relative flex flex-col h-full w-full z-20 p-6 justify-between">
                  <div>
                    <span className="inline-block bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <div className="transform group-hover:-translate-y-3 transition-transform duration-300">
                      <div className="text-white/50 text-[10px] font-mono tracking-[1.4px] uppercase pb-1.5">
                        PROMPT / TRIGGER
                      </div>
                      <p className="text-white text-base sm:text-lg font-medium tracking-tight leading-snug">
                        {card.prompt}
                      </p>
                    </div>
                    <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 mt-4">
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="inline-flex items-center gap-1.5 justify-center bg-white text-black text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer hover:bg-neutral-100"
                      >
                        {card.action}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Node Library Section ─────────────────────────────────────────── */}
      <section id="nodes" className="py-24 bg-[#070b10] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold font-mono text-neutral-500 uppercase tracking-widest">
              Node Library
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Every building block you need.
            </h2>
            <p className="text-neutral-500 mt-4 text-sm sm:text-base max-w-xl mx-auto">
              Drag nodes onto the canvas, wire them together, and run your workflow in one click.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodeTypes.map((node, i) => (
              <div
                key={i}
                className={`rounded-2xl border bg-gradient-to-br ${node.color} p-5 hover:scale-[1.02] transition-all duration-200 cursor-default group`}
              >
                <div className="w-9 h-9 rounded-xl bg-black/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {node.icon}
                </div>
                <div className="font-semibold text-white text-sm">{node.label}</div>
                <div className="text-neutral-400 text-xs mt-1 leading-relaxed">{node.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <span className="text-neutral-600 text-xs font-mono">+ More nodes shipping soon</span>
          </div>
        </div>
      </section>

      {/* ── Feature Banners ──────────────────────────────────────────────── */}
      <section className="py-24 bg-black text-white px-6 space-y-28 max-w-[1300px] mx-auto">

        {/* Banner 1: Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Visual Canvas
            </span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Build logic with nodes, not code.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              Drag, drop, and wire nodes on a React Flow canvas. Zoom, pan, undo/redo, and export
              your workflow layout at any time.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95"
            >
              <Workflow className="w-4 h-4" />
              Open Workflow Canvas
            </Link>
          </div>

          <div className="relative rounded-[28px] overflow-hidden border border-white/8 bg-neutral-950 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&auto=format&fit=crop"
              alt="Visual workflow node canvas"
              className="w-full h-[400px] object-cover opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            {/* Floating UI element */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
              <Play className="w-4 h-4 text-emerald-400 fill-current shrink-0" />
              <span className="text-white text-xs font-semibold">Workflow running…</span>
              <div className="ml-auto flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-4 rounded-full ${i < 3 ? "bg-emerald-400" : "bg-white/20"}`} style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Banner 2: Multi-model AI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-[28px] overflow-hidden border border-white/8 bg-neutral-950 shadow-2xl order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=900&q=80&auto=format&fit=crop"
              alt="Multi-model AI integration"
              className="w-full h-[400px] object-cover opacity-75 hover:opacity-100 hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            {/* Model badge cluster */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {["GPT-4o", "Claude 3.5", "Gemini 2.0", "Llama 3"].map((m) => (
                <span key={m} className="text-[10px] font-bold bg-black/60 backdrop-blur-sm border border-white/15 text-white px-2.5 py-1 rounded-full">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-5 order-1 lg:order-2">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Multi-Model AI
            </span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Every frontier model. One node.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              The OpenRouter LLM node gives you access to GPT-4o, Claude 3.5, Gemini 2.0, Llama,
              Mistral and more — switch models with a single dropdown.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              Try LLM Node
            </button>
          </div>
        </div>

        {/* Banner 3: Monitoring & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Monitoring & Alerts
            </span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Watch the web. Alert your team.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              Connect a Website Monitor node to Telegram or Email, and your workflow automatically
              fires when uptime drops or content changes.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
            >
              <Monitor className="w-4 h-4" />
              Set up monitoring
            </button>
          </div>

          <div className="relative rounded-[28px] overflow-hidden border border-white/8 bg-neutral-950 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=900&q=80&auto=format&fit=crop"
              alt="Monitoring dashboard"
              className="w-full h-[400px] object-cover opacity-75 hover:opacity-100 hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            {/* Uptime indicator */}
            <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
              {[
                { label: "Uptime", val: "99.9%", color: "text-emerald-400" },
                { label: "Alerts sent", val: "12", color: "text-amber-400" },
                { label: "Latency", val: "142ms", color: "text-blue-400" },
              ].map((s) => (
                <div key={s.label} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center">
                  <div className={`text-base font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] text-neutral-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-[#060a0f] text-white border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold font-mono text-neutral-500 uppercase tracking-widest">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Start free. Scale as you grow.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 flex flex-col gap-6 transition-all duration-200 hover:scale-[1.01] ${
                  plan.highlight
                    ? "bg-white/5 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.12)]"
                    : "bg-white/2 border-white/8"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-neutral-300 uppercase tracking-wider">{plan.name}</div>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-neutral-500 text-sm mb-1">{plan.period}</span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-1.5">{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`inline-flex h-10 items-center justify-center rounded-full text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                    plan.highlight
                      ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25"
                      : "bg-white/8 text-white hover:bg-white/12 border border-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08]">
            Your first workflow is{" "}
            <span style={{
              background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              3 nodes away.
            </span>
          </h2>
          <p className="text-neutral-500 mt-4 text-base">
            No YAML. No config files. Just drag, connect, and run.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex h-12 items-center gap-2 rounded-full px-10 text-[15px] font-semibold text-black bg-white hover:bg-neutral-100 active:scale-[0.98] transition-all cursor-pointer"
            >
              Start building free
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-full px-10 text-[15px] font-medium text-white border border-white/15 hover:bg-white/8 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-14 px-6 bg-[#030507] text-neutral-500 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="3" width="5" height="18" rx="2.5" />
                <rect x="9" y="8" width="5" height="5" rx="2.5" />
                <rect x="9" y="15" width="5" height="5" rx="2.5" />
                <rect x="16" y="11" width="5" height="5" rx="2.5" />
              </svg>
              <span className="font-bold text-white text-sm font-mono">NextFlow</span>
            </div>
            <p className="text-xs text-neutral-600 max-w-sm leading-relaxed">
              Visual node-based AI workflow automation. Built with Next.js, Bun, Hono, OpenRouter,
              BullMQ, ImageKit, and Prisma.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Workflow Canvas</Link></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Node Library</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Run History</button></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Sign in with Google</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Create free account</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-700 gap-3">
          <div>© {new Date().getFullYear()} NextFlow by amberbisht. All rights reserved.</div>
          <div className="flex gap-5">
            <span className="hover:text-neutral-500 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-neutral-500 cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
