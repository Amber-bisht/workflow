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
  Shield,
  ArrowRight
} from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);

  // Fetch dynamic plans from backend API
  useEffect(() => {
    fetch("/api/billing/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plans)) {
          setPlans(data.plans);
        }
      })
      .catch((err) => console.error("Failed to fetch plans from API:", err))
      .finally(() => setLoadingPlans(false));
  }, []);

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
          "x-user-id": user.id || "",
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
        description: "Credits Top-up",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment signature
            const verifyRes = await fetch("/api/billing/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": user.id || "",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("🎉 Payment Successful! Credits added to your account.");
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
        <div className="max-w-6xl space-y-10 pb-16">

          {/* Page Title */}
          <AppHeader title="Billing & Plans" />

          {/* Credit Balance & Usage Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Total Credits Available */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 space-y-3 shadow-xl backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="text-neutral-400 text-xs font-semibold font-mono uppercase tracking-wider">
                <span>Total Available</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {loadingCredits ? <Loader2 className="w-6 h-6 animate-spin text-neutral-500" /> : (credits?.total ?? 100)}
                <span className="text-xs font-mono font-normal text-neutral-400 ml-2">Credits</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Available for instant multi-node workflow execution.
              </p>
            </div>

            {/* Card 2: Free Monthly Credits */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 space-y-3 shadow-xl backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="text-neutral-400 text-xs font-semibold font-mono uppercase tracking-wider">
                <span>Free Monthly Credits</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {loadingCredits ? <Loader2 className="w-6 h-6 animate-spin text-neutral-500" /> : (credits?.freeCredits ?? 100)}
                <span className="text-xs text-neutral-500 font-normal ml-1.5">/ 100</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Refreshed automatically every 30 days.
              </p>
            </div>

            {/* Card 3: Paid Credits */}
            <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 space-y-3 shadow-xl backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="text-neutral-400 text-xs font-semibold font-mono uppercase tracking-wider">
                <span>Paid Credits</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {loadingCredits ? <Loader2 className="w-6 h-6 animate-spin text-neutral-500" /> : (credits?.paidCredits ?? 0)}
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Top-up credits that never expire.
              </p>
            </div>

          </div>

          {/* ── Razorpay Plans & Pricing ─────────────────────────────────────────── */}
          <div className="space-y-6 pt-2">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">Available Subscription Plans</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Instant activation via secure Razorpay checkout (UPI, Cards, NetBanking, Wallets).
              </p>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border p-7 flex flex-col justify-between gap-6 transition-all duration-300 backdrop-blur-xl ${
                      plan.highlight
                        ? "bg-gradient-to-b from-blue-950/40 via-neutral-900/80 to-neutral-900 border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-[1.02]"
                        : "bg-neutral-900/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                          Best Value
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                        <p className="text-neutral-400 text-xs mt-1">{plan.description}</p>
                      </div>

                      <div className="flex items-end gap-1.5">
                        <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                        <span className="text-neutral-500 text-xs mb-1.5">{plan.period}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-neutral-800 border border-white/15 px-3.5 py-1.5 rounded-full shadow-inner">
                        <Zap className="w-3.5 h-3.5 text-white fill-white/20" />
                        {plan.credits}
                      </div>

                      <div className="h-[1px] bg-white/10 my-4" />

                      <ul className="space-y-3 text-xs">
                        {plan.features?.map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2.5 text-neutral-200">
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
                          className={`w-full py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                            plan.highlight
                              ? "bg-blue-600 hover:bg-blue-500 text-white"
                              : "bg-white hover:bg-neutral-200 text-black"
                          }`}
                        >
                          {purchasingPlan === plan.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Initializing...</span>
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
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
