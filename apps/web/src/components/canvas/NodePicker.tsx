"use client";

import { useState } from "react";
import { 
  Search, 
  Brain, 
  ImageIcon, 
  Globe, 
  Activity, 
  Send, 
  Mail, 
  Zap, 
  FileOutput 
} from "lucide-react";

export type NodeTypeKey = 
  | "RequestInputs"
  | "Gemini"
  | "TavilySearch"
  | "WebsiteMonitor"
  | "Telegram"
  | "ResendEmail"
  | "CropImage"
  | "Response";

interface NodePickerProps {
  onSelectNode: (type: NodeTypeKey) => void;
  onClose: () => void;
}

type TabType = "All" | "AI & Search" | "Alerts & Monitor" | "Utilities";

interface NodeItem {
  type: NodeTypeKey;
  name: string;
  desc: string;
  category: TabType;
  icon: any;
  color: string;
}

export default function NodePicker({ onSelectNode, onClose }: NodePickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [search, setSearch] = useState("");

  const items: NodeItem[] = [
    {
      type: "RequestInputs",
      name: "Request Inputs & Trigger",
      desc: "Canvas execution trigger & initial input params (Free).",
      category: "Utilities",
      icon: Zap,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      type: "Gemini",
      name: "OpenRouter / Gemini LLM",
      desc: "Multimodal AI text & vision reasoning (5 Credits).",
      category: "AI & Search",
      icon: Brain,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      type: "TavilySearch",
      name: "Tavily Web Search",
      desc: "Real-time web search index & context RAG (3 Credits).",
      category: "AI & Search",
      icon: Globe,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      type: "WebsiteMonitor",
      name: "Website Uptime Monitor",
      desc: "HTTP availability & server latency check (2 Credits).",
      category: "Alerts & Monitor",
      icon: Activity,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      type: "Telegram",
      name: "Telegram Bot Alert",
      desc: "Instant push notifications to chat or channel (1 Credit).",
      category: "Alerts & Monitor",
      icon: Send,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      type: "ResendEmail",
      name: "Resend Transactional Email",
      desc: "High-deliverability HTML emails & reports (1 Credit).",
      category: "Alerts & Monitor",
      icon: Mail,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    },
    {
      type: "CropImage",
      name: "Crop Image Processing",
      desc: "Precision image cropping via (x, y, width, height).",
      category: "Utilities",
      icon: ImageIcon,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20"
    },
    {
      type: "Response",
      name: "Canvas Response Output",
      desc: "Final output response & workflow result renderer.",
      category: "Utilities",
      icon: FileOutput,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    }
  ];

  // Filter items by search query and active tab
  const filtered = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
      
    if (!matchesSearch) return false;
    if (activeTab === "All") return true;
    return item.category === activeTab;
  });

  const handleSelect = (item: NodeItem) => {
    onSelectNode(item.type);
    onClose();
  };

  const tabs: TabType[] = ["All", "AI & Search", "Alerts & Monitor", "Utilities"];

  return (
    <div className="absolute bottom-22 left-1/2 -translate-x-1/2 z-50 w-[440px] bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs max-h-[380px] text-white">
      {/* Search Header */}
      <div className="p-3 border-b border-white/10 relative">
        <Search className="absolute left-6 top-5.5 h-3.5 w-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search all 8 canvas nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-all text-xs"
          autoFocus
        />
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/10 bg-neutral-950/60 px-2 py-1.5 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-white text-black font-bold shadow-sm"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center text-neutral-500 py-6 font-medium">No nodes found</div>
        ) : (
          filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-white/25 bg-neutral-950/40 hover:bg-neutral-950 text-left transition-all cursor-pointer group"
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="font-bold text-white text-xs tracking-tight group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug truncate">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
