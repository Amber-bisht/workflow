"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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
  containerBg: string;
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
      containerBg: "bg-amber-500 text-black shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )
    },
    {
      type: "Gemini",
      name: "OpenRouter / Gemini LLM",
      desc: "Multimodal AI text & vision reasoning (5 Credits).",
      category: "AI & Search",
      containerBg: "bg-purple-600 text-white shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="white" />
        </svg>
      )
    },
    {
      type: "TavilySearch",
      name: "Tavily Web Search",
      desc: "Real-time web search index & context RAG (3 Credits).",
      category: "AI & Search",
      containerBg: "bg-cyan-500 text-black shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M11 7v8M7 11h8" />
        </svg>
      )
    },
    {
      type: "WebsiteMonitor",
      name: "Website Uptime Monitor",
      desc: "HTTP availability & server latency check (2 Credits).",
      category: "Alerts & Monitor",
      containerBg: "bg-emerald-500 text-black shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      type: "Telegram",
      name: "Telegram Bot Alert",
      desc: "Instant push notifications to chat or channel (1 Credit).",
      category: "Alerts & Monitor",
      containerBg: "bg-[#229ED9] text-white shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.84-1.12.52l-3.1-2.29-1.5 1.44c-.16.16-.3.3-.61.3l.22-3.17 5.77-5.21c.25-.22-.05-.34-.39-.12l-7.13 4.49-3.08-.96c-.67-.21-.68-.67.14-.99l12.03-4.64c.56-.21 1.05.13.88.88z"/>
        </svg>
      )
    },
    {
      type: "ResendEmail",
      name: "Resend Transactional Email",
      desc: "High-deliverability HTML emails & reports (1 Credit).",
      category: "Alerts & Monitor",
      containerBg: "bg-rose-600 text-white shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" />
        </svg>
      )
    },
    {
      type: "CropImage",
      name: "Crop Image Processing",
      desc: "Precision image cropping via (x, y, width, height).",
      category: "Utilities",
      containerBg: "bg-orange-500 text-black shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2v14a2 2 0 0 0 2 2h14" />
          <path d="M18 22V8a2 2 0 0 0-2-2H2" />
        </svg>
      )
    },
    {
      type: "Response",
      name: "Canvas Response Output",
      desc: "Final output response & workflow result renderer.",
      category: "Utilities",
      containerBg: "bg-blue-600 text-white shadow-md",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
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
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-white/25 bg-neutral-950/40 hover:bg-neutral-950 text-left transition-all cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${item.containerBg}`}>
                  {item.icon}
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
