"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Building2, CheckCircle2, Lock, HelpCircle } from "lucide-react";
import PricingCard from "./PricingCard";
import Link from "next/link";

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" | "annual"

  const plans = [
    {
      name: "Starter",
      badge: "Free Forever",
      description: "Essential AI link protection and fraud detection for everyday personal browsing.",
      priceMonthly: 0,
      priceAnnual: 0,
      icon: Shield,
      features: [
        "Up to 50 real-time link scans / day",
        "25-signal heuristic threat engine",
        "Android mobile app with QR scanner",
        "Basic email phishing inspection",
        "Instant risk score breakdown",
        "AV-SAFE browser extension access",
        "Standard community support",
      ],
      highlighted: false,
      ctaText: "Get Started Free",
      ctaHref: "/system",
    },
    {
      name: "Pro Shield",
      badge: "Most Popular",
      description: "Continuous zero-day threat defense, deep email payload scanning, and real-time alerts.",
      priceMonthly: 12,
      priceAnnual: 9,
      icon: Zap,
      features: [
        "Everything in Starter, plus:",
        "Unlimited real-time link & domain scans",
        "Deep neural payload & entropy analysis",
        "Full email attachment & header scanner",
        "Priority Android real-time link shields",
        "Daily zero-day threat database updates",
        "Real-time breach alerts & watchlists",
        "24/7 Priority support response",
      ],
      highlighted: true,
      ctaText: "Upgrade to Pro",
      ctaHref: "/system",
    },
    {
      name: "Enterprise",
      badge: "Organizations",
      description: "Full-scale corporate threat telemetry, REST API access, and centralized admin console.",
      priceMonthly: 49,
      priceAnnual: 39,
      icon: Building2,
      features: [
        "Everything in Pro, plus:",
        "Centralized Admin Complaint & triage console",
        "Team role-based access control (RBAC)",
        "REST API access (100,000 requests/mo)",
        "Automated webhook triggers & SIEM integration",
        "Custom domain whitelisting & company rules",
        "Dedicated security engineer & 99.99% SLA",
        "Enterprise compliance audit logs (SOC 2)",
      ],
      highlighted: false,
      ctaText: "Deploy Enterprise",
      ctaHref: "/system",
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-24 bg-white border-t border-[#E5ECF5] relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#1463FF]/5 via-[#F3F7FF] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-4">
              PRICING PLANS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101D36] leading-[1.18]">
              Simple, Transparent Security for Everyone
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl mx-auto">
              Choose the defense plan that fits your workflow. Protect your personal browsing, team collaboration, or entire enterprise infrastructure.
            </p>
          </motion.div>

          {/* Billing Toggle: Monthly vs Annual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-8 inline-flex items-center gap-2 p-1.5 bg-[#F3F7FF] border border-[#E5ECF5] rounded-full"
          >
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`relative px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-[#101D36] shadow-sm"
                  : "text-[#64748B] hover:text-[#101D36]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`relative flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-[#101D36] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#101D36]"
              }`}
            >
              <span>Annual Billing</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  billingCycle === "annual"
                    ? "bg-[#1463FF] text-white"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                Save 25%
              </span>
            </button>
          </motion.div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {plans.map((plan, i) => (
            <PricingCard
              key={i}
              {...plan}
              billingCycle={billingCycle}
            />
          ))}
        </motion.div>

        {/* Trust & Guarantee Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-14 pt-8 border-t border-[#E5ECF5] grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#64748B]">
            <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />
            <span>No credit card required for Starter</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#64748B]">
            <Lock className="h-4 w-4 text-[#1463FF] shrink-0" />
            <span>14-day money-back guarantee</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#64748B]">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Instant activation & setup</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#64748B]">
            <Shield className="h-4 w-4 text-purple-600 shrink-0" />
            <span>99.9% Scanning uptime SLA</span>
          </div>
        </motion.div>

        {/* Custom requirements callout */}
        <div className="mt-10 text-center">
          <p className="text-xs sm:text-sm text-[#64748B]">
            Need custom API quotas, air-gapped on-premise deployment, or student discounts?{" "}
            <Link
              href="/system"
              className="font-semibold text-[#1463FF] hover:text-[#0D52DD] underline underline-offset-4"
            >
              Talk to our security engineers →
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}

