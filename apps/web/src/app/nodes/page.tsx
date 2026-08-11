"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

const NODES_DATA = [
  {
    id: "llm",
    name: "OpenRouter / Gemini LLM",
    category: "AI & LLM",
    cost: "5 credits / run",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="url(#gemini_grad)" />
        <defs>
          <linearGradient id="gemini_grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4285F4" />
            <stop offset="0.5" stopColor="#9B51E0" />
            <stop offset="1" stopColor="#E91E63" />
          </linearGradient>
        </defs>
      </svg>
    ),
    description: "Generate structured responses, summarize data, and solve complex reasoning tasks with LLMs.",
    features: [
      "Custom prompt engineering",
      "Google Gemini & OpenRouter models",
      "JSON structured output parsing",
      "Context-aware RAG processing"
    ],
    howItWorks: "Receives input prompt or data from upstream nodes, sends request to Google Gemini or OpenRouter LLMs, and outputs AI-generated responses."
  },
  {
    id: "search",
    name: "Tavily Web Search",
    category: "Web Search",
    cost: "3 credits / search",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="M11 7v8M7 11h8" />
      </svg>
    ),
    description: "Perform real-time web searches and context retrieval for fresh external web knowledge.",
    features: [
      "Real-time web search index",
      "Domain filtering & query optimization",
      "Clean content snippet extraction",
      "Ideal for live news & research agent RAG"
    ],
    howItWorks: "Executes real-time web searches via Tavily API and extracts structured search results into your canvas pipeline."
  },
  {
    id: "monitor",
    name: "Website Uptime Monitor",
    category: "Monitoring",
    cost: "2 credits / check",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    description: "Monitor website availability, verify HTTP status codes, and measure server latency.",
    features: [
      "HTTP Status Code checking (e.g. 200 OK)",
      "Server latency tracking",
      "Automatic downtime detection",
      "Integrates directly with Telegram & Email alerts"
    ],
    howItWorks: "Sends an HTTP GET request to a target website URL, validates response status and speed, and passes status payload down the graph."
  },
  {
    id: "telegram",
    name: "Telegram Bot Alert",
    category: "Alerts & Messages",
    cost: "1 credit / message",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#229ED9">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.84-1.12.52l-3.1-2.29-1.5 1.44c-.16.16-.3.3-.61.3l.22-3.17 5.77-5.21c.25-.22-.05-.34-.39-.12l-7.13 4.49-3.08-.96c-.67-.21-.68-.67.14-.99l12.03-4.64c.56-.21 1.05.13.88.88z"/>
      </svg>
    ),
    description: "Send automated real-time notifications and alerts directly to your Telegram chat or channel.",
    features: [
      "Instant push notification delivery",
      "Markdown payload formatting",
      "Custom Bot Token & Chat ID support",
      "Zero latency execution"
    ],
    howItWorks: "Dispatches HTTP payload requests directly to Telegram Bot API to notify your personal chat or group channel instantly."
  },
  {
    id: "resend",
    name: "Resend Email",
    category: "Alerts & Messages",
    cost: "1 credit / email",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" />
      </svg>
    ),
    description: "Deliver clean, high-deliverability HTML emails and reports to your users or team.",
    features: [
      "Custom HTML & Markdown body",
      "Dynamic subject line interpolation",
      "High deliverability via Resend API",
      "Automated summary report delivery"
    ],
    howItWorks: "Constructs transactional email headers and body from upstream data and sends via Resend email infrastructure."
  },
  {
    id: "input",
    name: "Request Input & Trigger",
    category: "Inputs",
    cost: "0 credits (Free)",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    description: "The starting trigger node for manual or programmatic webhook workflow execution.",
    features: [
      "Free execution trigger",
      "Custom JSON input schema",
      "Webhook & API payload receiver",
      "Initial canvas starting point"
    ],
    howItWorks: "Initializes execution context with input params provided by user or external webhook API triggers."
  }
];

export default function NodeLibraryPage() {
  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      {/* ── App Sidebar ─────────────────────────────────────────────────────── */}
      <AppSidebar activePath="nodes" />

      {/* ── Main Node Library Panel ─────────────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-6xl space-y-8 pb-16">

          {/* Page Header */}
          <AppHeader title="Node Library" />

          {/* Sharp Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {NODES_DATA.map((node) => (
              <div
                key={node.id}
                className="rounded-xl border border-white/15 bg-[#0a0d12] hover:bg-[#0f131a] hover:border-white/30 p-6 flex flex-col justify-between gap-5 transition-all duration-200 shadow-lg relative group"
              >
                <div className="space-y-4">
                  {/* Top Row: Brand Icon + Category + Cost */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {node.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                          {node.category}
                        </span>
                        <h3 className="text-base font-bold text-white tracking-tight">{node.name}</h3>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 border border-white/15 text-white text-xs font-mono font-bold shrink-0">
                      {node.cost}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {node.description}
                  </p>

                  <div className="h-[1px] bg-white/10" />

                  {/* Capabilities */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 tracking-wider block">
                      Key Capabilities
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {node.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-[1px] bg-white/10" />

                  {/* How it Works */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase text-neutral-500 tracking-wider block">
                      How It Works
                    </span>
                    <p className="text-xs text-neutral-400 bg-neutral-950 p-3 rounded-lg border border-white/10 leading-relaxed font-mono">
                      {node.howItWorks}
                    </p>
                  </div>
                </div>

                {/* Sharp Bottom Action */}
                <div className="pt-2">
                  <Link
                    href="/dashboard?create=true"
                    className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-white/15 cursor-pointer shadow-md active:scale-95 uppercase tracking-wider"
                  >
                    <span>Use in Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
