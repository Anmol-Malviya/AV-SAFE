"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { buttonHover, buttonTap } from "@/lib/animations";

export default function PricingCard({
  name,
  badge,
  description,
  priceMonthly,
  priceAnnual,
  billingCycle,
  features = [],
  highlighted = false,
  ctaText = "Get Started",
  ctaHref = "/system",
  icon: Icon,
}) {
  const currentPrice = billingCycle === "annual" ? priceAnnual : priceMonthly;
  const isFree = currentPrice === 0;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 transition-all ${
        highlighted
          ? "border-2 border-[#1463FF] bg-white shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/5"
          : "border border-[#E5ECF5] bg-white shadow-xs hover:border-[#CBD5E1] hover:shadow-lg hover:shadow-blue-900/5"
      }`}
    >
      {/* Popular badge */}
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${
              highlighted
                ? "bg-[#1463FF] text-white"
                : "bg-[#0B1933] text-white"
            }`}
          >
            {highlighted && <Sparkles className="h-3 w-3 fill-current" />}
            {badge}
          </span>
        </div>
      )}

      <div>
        {/* Tier Header: Icon & Name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                  highlighted
                    ? "border-blue-200 bg-[#F0F6FE] text-[#1463FF]"
                    : "border-[#E5ECF5] bg-[#F8FAFC] text-[#101D36]"
                }`}
              >
                <Icon className="h-5 w-5 stroke-[2.2]" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#101D36]">
                {name}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {billingCycle === "annual" && !isFree ? "Billed annually" : "Standard cycle"}
              </p>
            </div>
          </div>
        </div>

        {/* Short description */}
        <p className="mt-4 text-xs sm:text-sm text-[#64748B] leading-relaxed min-h-[38px]">
          {description}
        </p>

        {/* Price display */}
        <div className="mt-6 flex items-baseline gap-1.5 border-b border-[#E5ECF5] pb-6">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#101D36]">
            {isFree ? "$0" : `$${currentPrice}`}
          </span>
          <span className="text-sm font-medium text-[#64748B]">
            {isFree ? "free forever" : "/ month"}
          </span>
          {billingCycle === "annual" && !isFree && (
            <span className="ml-auto rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              Save ~25%
            </span>
          )}
        </div>

        {/* Feature List */}
        <div className="mt-6 space-y-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Included Features
          </p>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#101D36]">
                <div
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    highlighted
                      ? "bg-[#1463FF] text-white"
                      : "bg-[#F0F6FE] text-[#1463FF]"
                  }`}
                >
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 pt-4">
        <motion.div whileHover={buttonHover} whileTap={buttonTap}>
          <Link
            href={ctaHref}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all shadow-xs ${
              highlighted
                ? "bg-[#1463FF] text-white hover:bg-[#0D52DD] shadow-blue-500/25"
                : "bg-[#0B1933] text-white hover:bg-[#101D36]"
            }`}
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

