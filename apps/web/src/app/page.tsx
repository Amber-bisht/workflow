"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2,
  Menu,
  X,
  ArrowRight
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

export default function KreaExactLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Showcase Cards with Prompt & Image Assets
  const showcaseCards = [
    {
      title: "Cinematic Photorealism",
      prompt: "“Cinematic photo of a Women ”",
      image: "/assets/landingPhotorealExamplePortrait.webp",
      badge: "Photoreal",
      action: "Generate image",
    },
    {
      title: "AI Video Motion",
      prompt: "“Portrait with animated capybara talking about automation”",
      image: "/assets/80afb2b863333a10da2db7491ef56cab.jpg",
      badge: "Motion",
      action: "Generate video",
    },
    {
      title: "8K Ultra Upscaler",
      prompt: "“Upscale image 512p -> 8K”",
      image: "/assets/e9d66bd59ef5adefe928e5fb0298cb66.jpg",
      badge: "Enhance",
      action: "Upscale image",
    },
    {
      title: "Layer Explosion",
      prompt: "“Advertisement shot of a sandwich vertically exploding into different layers”",
      image: "/assets/9098912c68944c798e511f4d06b4a9b0.jpg",
      badge: "Animation",
      action: "Animate image",
    },
    {
      title: "Offroad Desert Race",
      prompt: "“Dramatic photo of an old offroad truck racing through the desert”",
      image: "/assets/b87be2638aa0dd26622549e9ee274afc.jpg",
      badge: "Cinema",
      action: "Generate image",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* Auth Modal Overlay */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ── Fixed Blur Navigation Header (CLEAN BRAND ONLY) ────────────────────── */}
      <div className="fixed top-0 left-0 w-full z-40">
        <header className="relative w-full mx-auto px-4 sm:px-6 lg:px-12 py-4 border-b border-white/15 backdrop-blur-xl bg-black/70 transition-all duration-300">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            
            {/* App Name Brand Logo */}
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

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center justify-center h-[36px] px-5 text-xs sm:text-sm font-semibold text-black bg-white rounded-full hover:bg-neutral-200 transition-all active:scale-95 text-nowrap cursor-pointer shadow-md"
                style={{ fontWeight: 450 }}
              >
                Sign up for free
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center justify-center h-[36px] px-5 text-xs sm:text-sm font-semibold text-white bg-[#262626] rounded-full hover:bg-neutral-800 transition-all active:scale-95 text-nowrap cursor-pointer"
                style={{ fontWeight: 450 }}
              >
                Log in
              </button>
            </div>

          </div>
        </header>
      </div>

      {/* ── Hero Section (GRAPHICS & ELEVATED TEXT POSITION) ──────────────────── */}
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
          {/* Hero Monitor Image */}
          <img
            src="/assets/hero-monitor.png"
            alt="automation.amberbisht.me Hero Monitor"
            className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none select-none"
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

          {/* Hero Content - Shifted UP for perfect visual alignment */}
          <div className="relative z-20 mx-auto flex flex-col items-center max-w-[980px] -translate-y-2 sm:-translate-y-4">
            <h1
              aria-label="automation.amberbisht.me is the world's most powerful creative AI suite."
              className="text-[#f5f5f5] text-center max-w-[960px] margin-0"
              style={{
                fontSize: "clamp(32px, 5.5vw, 56px)",
                lineHeight: "1.05",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                textShadow: "0 2px 20px rgba(0,0,0,0.45)",
                fontFamily: '"Suisse Intl", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              automation.amberbisht.me is the world&apos;s<br />most powerful creative AI suite.
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
              Generate, enhance, and edit images, videos, or 3D meshes for free with AI.
            </p>

            <div className="flex items-center justify-center gap-[12px] mt-[22px] flex-wrap">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex h-10 items-center justify-center rounded-full px-10 text-[15px] font-medium text-black bg-white no-underline transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98] cursor-pointer"
              >
                Start for free
              </button>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-full px-10 text-[15px] font-medium text-white no-underline border border-white/20 backdrop-blur-[6px] bg-white/10 transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
              >
                Launch App
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Section 1: Showcase Cards (Horizontal Grid with Image Animations) ───── */}
      <section className="py-20 bg-white text-black">
        <div className="max-w-[1400px] mx-auto px-6 overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none">
            {showcaseCards.map((card, idx) => (
              <div
                key={idx}
                className="shrink-0 w-[288px] sm:w-[370px] lg:w-[390px] h-[500px] relative rounded-[32px] overflow-hidden group bg-neutral-900 shadow-xl cursor-pointer"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                <div className="relative bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0)_58%)] flex flex-col h-full w-full z-20 p-6 sm:p-8 justify-between">
                  <div>
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <div className="transform group-hover:-translate-y-3 transition-transform duration-300">
                      <div className="text-white/60 text-xs font-medium tracking-[1.2px] uppercase pb-2">
                        PROMPT
                      </div>
                      <p className="text-white text-base sm:text-2xl font-medium tracking-tight leading-snug">
                        {card.prompt}
                      </p>
                    </div>

                    <div className="overflow-hidden transition-[max-height,opacity,transform] duration-300 max-h-12 opacity-100 mt-4 sm:max-h-0 sm:opacity-0 sm:group-hover:max-h-12 sm:group-hover:opacity-100">
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="inline-flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white text-[13px] font-medium px-5 py-3 rounded-lg transition-colors cursor-pointer"
                      >
                        {card.action}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Model Badges ("The industry's best Generative AI models") ── */}
      <section className="py-20 bg-neutral-950 text-white border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-xs font-bold font-mono text-neutral-500 uppercase tracking-widest">
            Unified Model Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
            The industry&apos;s best Generative AI models. In one subscription.
          </h2>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {["Veo 3.1", "Ideogram", "Runway", "Luma", "Flux", "Gemini 2.0", "OpenRouter", "GPT-4o", "Claude 3.5"].map((model, i) => (
              <span
                key={i}
                className="px-5 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-all cursor-default"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: High-Impact Feature Banners ─────────────────────────────── */}
      <section className="py-24 bg-black text-white px-6 space-y-28 max-w-[1300px] mx-auto">
        
        {/* Feature Banner 1: Realtime Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Realtime Canvas
            </span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Draw and generate in real time.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              Every stroke updates the image instantly. Skip the rendering wait and stay in your creative flow.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95"
              >
                <span>Try Realtime Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl group">
            <img
              src="/assets/realtimeBase.webp"
              alt="Realtime Canvas Drawing"
              className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <img
              src="/assets/realtimeOverlay.png"
              alt="Realtime Stroke Overlay"
              className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
            />
          </div>
        </div>

        {/* Feature Banner 2: Ultra Realistic Vision Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl group order-2 lg:order-1">
            <div className="grid grid-cols-2 h-[420px]">
              <img
                src="/assets/skinTexture.png"
                alt="Skin Texture Detail"
                className="w-full h-full object-cover border-r border-white/10 group-hover:scale-105 transition-transform duration-700"
              />
              <img
                src="/assets/eye-macro.webp"
                alt="Eye Macro Photorealism"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              Proprietary Engine
            </span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              automation — Our ultra-realistic image model.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              Our vision engine offers accurate skin textures, cinematic lighting, and high-fidelity photorealistic detail without synthetic artifacts.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
              >
                <span>Generate with Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Banner 3: 8K Enhancer & Upscaler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
              8K Enhancer
            </span>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Enhance and upscale photos to 8K.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-md">
              Transform low-resolution snapshots into crisp, publication-ready images in sub-second execution windows.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
              >
                <span>Upscale Image</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl group">
            <img
              src="/assets/hf0.webp"
              alt="8K Enhancer Result"
              className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

      </section>

      {/* ── Section 4: Footer ─────────────────────────────────────────────────── */}
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
              The world&apos;s most powerful creative AI suite. Built with Next.js 16, Bun, Hono, OpenRouter Multimodal AI, Sharp, and ImageKit CDN.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Products</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">App Studio</Link></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Image Generator</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Video Generator</button></li>
              <li><button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Enhancer & Upscaler</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
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
