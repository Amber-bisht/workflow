"use client";

import { useState } from "react";
import { Search, Brain, ImageIcon, FileWarning, PlayCircle } from "lucide-react";

interface NodePickerProps {
  onSelectNode: (type: "CropImage" | "Gemini") => void;
  onClose: () => void;
}

type TabType = "Recent" | "Image" | "Video" | "Audio" | "Others";

interface NodeItem {
  type: "CropImage" | "Gemini" | "video_mock" | "audio_mock";
  name: string;
  desc: string;
  category: TabType;
  icon: any;
  disabled?: boolean;
}

export default function NodePicker({ onSelectNode, onClose }: NodePickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Recent");
  const [search, setSearch] = useState("");

  const items: NodeItem[] = [
    {
      type: "Gemini",
      name: "Gemini 3.1 Pro",
      desc: "Run prompts and process text/images using Gemini 3.1 Pro.",
      category: "Others",
      icon: Brain,
    },
    {
      type: "CropImage",
      name: "Crop Image",
      desc: "Crop an input image using precise coordinates (x, y, w, h).",
      category: "Image",
      icon: ImageIcon,
    },
    {
      type: "video_mock",
      name: "Video Transcoder",
      desc: "Transcode video files (Trial Only - Unavailable).",
      category: "Video",
      icon: PlayCircle,
      disabled: true,
    },
    {
      type: "audio_mock",
      name: "Speech to Text",
      desc: "Transcribe audio files (Trial Only - Unavailable).",
      category: "Audio",
      icon: FileWarning,
      disabled: true,
    },
  ];

  // Filter items by search query and active tab
  const filtered = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (activeTab === "Recent") {
      // Show functional items in Recent tab
      return !item.disabled;
    }
    return item.category === activeTab;
  });

  const handleSelect = (item: NodeItem) => {
    if (item.disabled) return;
    onSelectNode(item.type as any);
    onClose();
  };

  const tabs: TabType[] = ["Recent", "Image", "Video", "Audio", "Others"];

  return (
    <div className="absolute bottom-22 left-1/2 -translate-x-1/2 z-50 w-[420px] bg-white border border-neutral-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden text-xs max-h-[350px] text-neutral-800">
      {/* Search Header */}
      <div className="p-3 border-b border-neutral-200 relative">
        <Search className="absolute left-6 top-5.5 h-3.5 w-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 pl-9 pr-4 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-500/45 transition-all"
          autoFocus
        />
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/40 px-2 py-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-blue-600 font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.05)] border border-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-750"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        {filtered.length === 0 ? (
          <div className="text-center text-neutral-400 py-6 font-medium">No nodes found</div>
        ) : (
          filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelect(item)}
                disabled={item.disabled}
                className={`flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all ${
                  item.disabled
                    ? "opacity-40 cursor-not-allowed border-transparent"
                    : "border-transparent hover:border-blue-500/10 hover:bg-neutral-50 bg-neutral-50/20 cursor-pointer"
                }`}
              >
                <div className={`p-2 rounded-lg ${item.disabled ? "bg-neutral-100 text-neutral-400" : "bg-blue-50 text-blue-500 border border-blue-100"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <h4 className={`font-semibold ${item.disabled ? "text-neutral-450" : "text-neutral-800"}`}>
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">
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
