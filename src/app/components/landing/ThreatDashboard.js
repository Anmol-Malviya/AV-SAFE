"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { buttonHover, buttonTap } from "@/lib/animations";

export default function ThreatDashboard() {
  const benefits = [
    "Blocks phishing and malicious sites",
    "Analyzes content with AI",
    "Provides risk score and clear explanation",
    "Keeps your data private and secure",
  ];

  return (
    <section id="protection" className="relative min-h-[580px] lg:min-h-[640px] overflow-hidden bg-white py-16 lg:py-24 border-t border-[#E5ECF5] flex items-center">
      
      {/* ============ BACKGROUND IMAGE (THREAT DASHBOARD LAPTOP PHOTO) ============ */}
      <div 
        className="absolute inset-y-0 right-0 w-full lg:w-[60%] pointer-events-none bg-no-repeat bg-cover bg-left lg:bg-center opacity-90 lg:opacity-100"
        style={{ backgroundImage: "url('/threat-dashboard.png')" }}
      >
        {/* Left-to-right fade gradient: pure white on left, blending smoothly into the desk photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:via-white/35" />
        {/* Bottom & Top subtle fades */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/50 to-transparent" />
        {/* Mobile overlay */}
        <div className="absolute inset-0 bg-white/75 lg:hidden" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* ============ LEFT COLUMN: CONTENT ============ */}
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col justify-center text-left z-10"
          >
            
            {/* Pill */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-5">
              REAL-TIME PROTECTION
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#101D36] leading-[1.15]">
              Detect Threats <br />
              <span className="text-[#1463FF]">Before They Reach You</span>
            </h2>

            {/* Paragraph */}
            <p className="mt-4 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-lg">
              AV-SAFE uses advanced AI and real-time threat intelligence to catch phishing links, malicious websites and email threats — so you can browse, work and communicate without worry.
            </p>

            {/* 4 Green Check Benefits */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                }
              }}
              className="mt-6 space-y-3"
            >
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.35 } }
                  }}
                  className="flex items-center gap-2.5"
                >
                  <motion.div 
                    whileHover={{ scale: 1.15 }}
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white shadow-xs"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </motion.div>
                  <span className="text-sm font-medium text-[#101D36]">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Primary Dark CTA */}
            <div className="mt-8">
              <motion.div whileHover={buttonHover} whileTap={buttonTap} className="inline-block">
                <Link
                  href="/system"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0B1933] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#101D36] transition-colors"
                >
                  <span>Try AV-SAFE Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

          </motion.div>

          {/* Right column placeholder for alignment on desktop (the laptop photo is in the background) */}
          <div className="lg:col-span-6 hidden lg:block h-[380px] pointer-events-none" />

        </div>
      </div>
    </section>
  );
}
