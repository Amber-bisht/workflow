"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Zap,
  CreditCard,
  Sparkles,
  Loader2,
  Bot,
  Mail,
  Send,
  Search,
  Activity,
  RefreshCw,
  User
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    credits: "100 credits / mo",
    description: "Ideal for exploring visual workflow graphs",
    features: [
      "100 free monthly credits",
      "Unlimited visual workflows",
      "OpenRouter LLM & Gemini nodes",
      "Community support"
    ],
    cta: "Current Plan",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter Top-up",
    price: "₹99",
    period: "one-time",
    credits: "1,000 paid credits",
    description: "Instant credit boost for active automation tasks",
    features: [
      "1,000 paid credits (never expire)",
      "Tavily Web Search nodes",
      "Telegram & Resend email alerts",
      "Website uptime monitoring"
    ],
    cta: "Buy Starter Pack (₹99)",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "₹499",
    period: "/ month",
    credits: "5,000 credits / mo",
    description: "For power users building production automation",
    features: [
      "5,000 monthly credits",
      "Priority execution queue",
      "All 8+ node types included",
      "Priority support & API keys vault"
    ],
    cta: "Upgrade to Pro (₹499)",
    highlight: false,
  },
];

const NODE_COSTS = [
  { node: "OpenRouter / Gemini LLM", cost: "5 credits / run", icon: <Bot className="w-4 h-4 text-purple-400" /> },
  { node: "Tavily Web Search", cost: "3 credits / search", icon: <Search className="w-4 h-4 text-cyan-400" /> },
  { node: "Website Monitor", cost: "2 credits / check", icon: <Activity className="w-4 h-4 text-green-400" /> },
  { node: "Telegram Alert", cost: "1 credit / message", icon: <Send className="w-4 h-4 text-sky-400" /> },
  { node: "Resend Email", cost: "1 credit / email", icon: <Mail className="w-4 h-4 text-rose-400" /> },
  { node: "Request Inputs / Response", cost: "0 credits (Free)", icon: <Zap className="w-4 h-4 text-amber-400" /> },
];

export default function BillingPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [credits, setCredits] = useState<{
    freeCredits: number;
    paidCredits: number;
    total: number;
    cycleStartDate?: string;
  } | null>(null);

  const [loadingCredits, setLoadingCredits] = useState(true);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);

  // Load user credit balance from backend
  const fetchCredits = async () => {
    if (!user?.id) return;
    try {
      setLoadingCredits(true);
      const res = await fetch("/api/billing/status", {
        headers: { "x-user-id": user.id },
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
      }
    } catch (err) {
      console.error("Failed to load credits:", err);
    } finally {
      setLoadingCredits(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchCredits();
    }
  }, [status, user]);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay Payment
  const handlePayment = async (planId: string) => {
    if (!user?.id) return;
    setPurchasingPlan(planId);

    try {
      const resScript = await loadRazorpayScript();
      if (!resScript) {
        alert("Failed to load Razorpay SDK. Please check your network connection.");
        setPurchasingPlan(null);
        return;
      }

      // Create order via backend API
      const orderRes = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ planId }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create Razorpay order");
      }

      // Configure Razorpay Options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "automation.amberbisht.me",
        description: "1,000 Credits Starter Top-up",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment signature
            const verifyRes = await fetch("/api/billing/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": user.id,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("🎉 Payment Successful! 1,000 Credits added to your account.");
              fetchCredits();
            } else {
              alert("Payment verification failed: " + verifyData.error);
            }
          } catch (err: any) {
            alert("Verification error: " + err.message);
          } finally {
            setPurchasingPlan(null);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#2563eb",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response: any) => {
        alert("Payment failed: " + response.error.description);
        setPurchasingPlan(null);
      });
      paymentObject.open();

    } catch (err: any) {
      alert("Payment Error: " + err.message);
      setPurchasingPlan(null);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      {/* ── App Sidebar ─────────────────────────────────────────────────────── */}
      <AppSidebar activePath="billing" />

      {/* ── Main Billing & Plans Panel ───────────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto p-6 sm:p-10">
        <div className="max-w-6xl mx-auto space-y-10 pb-16">

          {/* Page Title */}
          <AppHeader title="Billing & Plans" />

          {/* Credit Balance & Usage Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Total Credits Available */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold font-mono uppercase tracking-wider">
                <span>Total Available Credits</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {loadingCredits ? <Loader2 className="w-6 h-6 animate-spin text-neutral-500" /> : (credits?.total ?? 100)}
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Resets monthly or tops up instantly via Razorpay.
              </p>
            </div>

            {/* Card 2: Free Credits */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold font-mono uppercase tracking-wider">
                <span>Monthly Free Credits</span>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {loadingCredits ? <Loader2 className="w-6 h-6 animate-spin text-neutral-500" /> : (credits?.freeCredits ?? 100)}
                <span className="text-xs text-neutral-500 font-normal ml-1.5">/ 100</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Refreshed automatically every 30 days.
              </p>
            </div>

            {/* Card 3: Paid Credits */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6 space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold font-mono uppercase tracking-wider">
                <span>Paid Credits</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {loadingCredits ? <Loader2 className="w-6 h-6 animate-spin text-neutral-500" /> : (credits?.paidCredits ?? 0)}
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Never expire. Used automatically when free credits run out.
              </p>
            </div>

          </div>

          {/* ── Razorpay Plans & Pricing ─────────────────────────────────────────── */}
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold font-mono text-neutral-500 uppercase tracking-widest">
                Upgrade & Top-up
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Choose your automation plan.
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mx-auto">
                Instant activation via secure Razorpay checkout. Pay in INR via UPI, Cards, NetBanking, or Wallets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl border p-7 flex flex-col justify-between gap-6 transition-all duration-200 ${
                    plan.highlight
                      ? "bg-gradient-to-b from-blue-950/30 to-neutral-900 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.12)] scale-[1.02]"
                      : "bg-neutral-900/70 border-white/10"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                        Best Value
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                      <p className="text-neutral-500 text-xs mt-1">{plan.description}</p>
                    </div>

                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                      <span className="text-neutral-500 text-xs mb-1.5">{plan.period}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                      <Zap className="w-3.5 h-3.5" />
                      {plan.credits}
                    </div>

                    <div className="h-[1px] bg-white/10 my-4" />

                    <ul className="space-y-2.5 text-xs">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-neutral-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    {plan.id === "free" ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs font-semibold cursor-default"
                      >
                        {plan.cta}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayment(plan.id)}
                        disabled={purchasingPlan !== null}
                        className={`w-full py-3 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                          plan.highlight
                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                            : "bg-white hover:bg-neutral-200 text-black"
                        }`}
                      >
                        {purchasingPlan === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Initializing Razorpay...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>{plan.cta}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Node Credit Cost Reference Table ─────────────────────────────────── */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Credit Deduction Rate</h3>
              <p className="text-neutral-500 text-xs mt-1">
                Exact credits deducted per node execution in your workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NODE_COSTS.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-neutral-950">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-white">{item.node}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-neutral-400">{item.cost}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
