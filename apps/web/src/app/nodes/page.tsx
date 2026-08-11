"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Search,
  Activity,
  Send,
  Mail,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

const NODES_DATA = [
  {
    id: "llm",
    name: "OpenRouter / Gemini LLM",
    category: "AI & LLM",
    cost: "5 credits / run",
    icon: <Bot className="w-5 h-5 text-purple-400" />,
    color: "purple",
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
    icon: <Search className="w-5 h-5 text-cyan-400" />,
    color: "cyan",
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
    icon: <Activity className="w-5 h-5 text-emerald-400" />,
    color: "emerald",
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
    icon: <Send className="w-5 h-5 text-sky-400" />,
    color: "sky",
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
    name: "Resend Transactional Email",
    category: "Alerts & Messages",
    cost: "1 credit / email",
    icon: <Mail className="w-5 h-5 text-rose-400" />,
    color: "rose",
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
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    color: "amber",
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

const CATEGORIES = ["All Nodes", "AI & LLM", "Web Search", "Monitoring", "Alerts & Messages", "Inputs"];

export default function NodeLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Nodes");

  const filteredNodes = selectedCategory === "All Nodes"
    ? NODES_DATA
    : NODES_DATA.filter((node) => node.category === selectedCategory);

  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      {/* ── App Sidebar ─────────────────────────────────────────────────────── */}
      <AppSidebar activePath="nodes" />

      {/* ── Main Node Library Panel ─────────────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-6xl space-y-8 pb-16">

          {/* Page Header */}
          <AppHeader title="Node Library" />

          {/* Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {NODES_DATA.map((node) => (
              <div
                key={node.id}
                className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-7 flex flex-col justify-between gap-6 hover:border-white/20 transition-all shadow-xl backdrop-blur-xl group"
              >
                <div className="space-y-4">
                  {/* Top Row: Icon + Category + Cost */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                        {node.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                          {node.category}
                        </span>
                        <h3 className="text-lg font-bold text-white tracking-tight">{node.name}</h3>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-white/15 text-white text-xs font-mono font-bold shadow-inner shrink-0">
                      {node.cost}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {node.description}
                  </p>

                  <div className="h-[1px] bg-white/10" />

                  {/* Features */}
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
                    <p className="text-xs text-neutral-400 bg-neutral-950 p-3 rounded-2xl border border-white/10 leading-relaxed font-mono">
                      {node.howItWorks}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2">
                  <Link
                    href="/dashboard?create=true"
                    className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer shadow-md active:scale-95"
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
