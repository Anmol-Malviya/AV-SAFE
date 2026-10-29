"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Link2, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  ShieldCheck, 
  Mail, 
  Zap,
  ExternalLink
} from "lucide-react";
import { analyzeURL } from "@/lib/phishingEngine";
import { buttonHover, buttonTap, fadeInUp } from "@/lib/animations";

export default function Hero() {
  const [urlInput, setUrlInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    // Realistic scanning delay for AI heuristic inspection
    setTimeout(() => {
      const result = analyzeURL(urlInput);
      setScanResult(result);
      setIsScanning(false);
    }, 1100);
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-white pt-8 pb-14 lg:pt-12 lg:pb-20">
      
      {/* Ambient background lighting */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-b from-[#1463FF]/5 via-[#F3F7FF] to-transparent rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ============ LEFT COLUMN: HERO CONTENT ============ */}
          <motion.div 
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 flex flex-col justify-center text-left z-10"
          >
            
            {/* Small pill: AI-Powered Security */}
            <motion.div 
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#EEF4FF] border border-[#E0ECFC] px-3.5 py-1.5 text-xs font-semibold text-[#0B1933] mb-6 shadow-xs"
            >
              <motion.span 
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full bg-[#1463FF]"
              />
              <span>AI-Powered Security</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#0B1933] leading-[1.12]"
            >
              Safer Browsing <br />
              <span className="text-[#1463FF]">Starts Here</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={fadeInUp}
              custom={2}
              className="mt-5 text-base sm:text-lg text-[#475569] max-w-xl leading-relaxed"
            >
              Detect and block phishing links, malicious websites and suspicious emails using advanced AI — so you can browse, work and communicate with confidence.
            </motion.p>

            {/* URL Input Form (Rounded Pill Design) */}
            <motion.div 
              variants={fadeInUp}
              custom={3}
              className="mt-8 w-full max-w-xl" 
              id="scan"
            >
              <form
                onSubmit={handleScan}
                className="relative flex items-center rounded-full bg-white p-1.5 pl-4 sm:pl-5 border border-[#CBD5E1] shadow-lg shadow-blue-500/5 hover:border-[#1463FF]/60 focus-within:border-[#1463FF] focus-within:ring-4 focus-within:ring-blue-100/60 transition-all"
              >
                <div className="flex items-center pr-3 text-[#94A3B8]">
                  <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#64748B]" />
                </div>
                <input
                  type="text"
                  placeholder="Enter a URL to analyze (e.g. https://example.com)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-transparent py-2.5 pr-3 text-xs sm:text-sm text-[#0B1933] placeholder-[#94A3B8] outline-none"
                  aria-label="URL to scan"
                />
                <motion.button
                  type="submit"
                  disabled={isScanning || !urlInput.trim()}
                  whileHover={!isScanning && urlInput.trim() ? buttonHover : {}}
                  whileTap={!isScanning && urlInput.trim() ? buttonTap : {}}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#1463FF] hover:bg-[#0D52DD] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Live Scanning Indicator */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-[#F3F7FF] px-4 py-2.5 text-xs text-[#1463FF]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1463FF] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1463FF]"></span>
                      </span>
                      <span>AI heuristic scanner inspecting domain SSL, entropy, and brand patterns...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan Results Card */}
              <AnimatePresence>
                {scanResult && !isScanning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-4 rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8]">Target URL</div>
                        <div className="text-sm font-semibold text-[#101D36] truncate max-w-xs sm:max-w-md">
                          {scanResult.url}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          scanResult.rating === "SAFE"
                            ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                            : scanResult.rating === "SUSPICIOUS"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-[#EF4444] border border-rose-200"
                        }`}
                      >
                        {scanResult.rating === "SAFE" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                        {scanResult.rating}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#E5ECF5] pt-3 text-xs">
                      <div>
                        <span className="text-[#94A3B8] block text-[11px]">AI Safety Score</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-[#101D36]">{scanResult.score}%</span>
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${scanResult.score}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                scanResult.score > 70 ? "bg-[#10B981]" : scanResult.score > 40 ? "bg-amber-500" : "bg-[#EF4444]"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#94A3B8] block text-[11px]">Risk Flags</span>
                        <span className="font-semibold text-[#64748B] mt-0.5 block">
                          {scanResult.warnings.length === 0 ? "0 Risk Indicators" : `${scanResult.warnings.length} Flags Detected`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#E5ECF5] pt-2 text-xs">
                      <span className="text-[11px] text-[#94A3B8]">Analyzed in 20ms</span>
                      <Link
                        href="/system"
                        className="font-semibold text-[#1463FF] hover:underline inline-flex items-center gap-1 group"
                      >
                        Deep Sandbox Console
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Three Trust Indicators in a Row */}
            <motion.div 
              variants={fadeInUp}
              custom={4}
              className="mt-8 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-medium text-[#475569]"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#1463FF] fill-[#1463FF]/15" />
                <span>Real-time scanning</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1463FF]" />
                <span>AI threat detection</span>
              </div>

              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#1463FF]" />
                <span>Privacy first</span>
              </div>
            </motion.div>

          </motion.div>

          {/* ============ RIGHT COLUMN: SEAMLESSLY BLENDED IMAGE WITH FLOATING BADGES ============ */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-7 relative flex items-center justify-center lg:justify-end"
          >
            
            {/* Visual Canvas: Enlarged, shifted 10px right, rounded right edge, blended left edge */}
            <div className="relative w-full max-w-[820px] xl:max-w-[860px] h-[440px] sm:h-[520px] lg:h-[580px] xl:h-[610px] rounded-r-3xl sm:rounded-r-[2.5rem] rounded-l-none translate-x-[6px] sm:translate-x-[10px]">
              
              {/* Image layer with progressive left-to-right fade mask */}
              <div 
                className="absolute inset-0 overflow-hidden rounded-r-3xl sm:rounded-r-[2.5rem]"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.15) 10%, rgba(0, 0, 0, 0.6) 22%, rgba(0, 0, 0, 1) 38%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.15) 10%, rgba(0, 0, 0, 0.6) 22%, rgba(0, 0, 0, 1) 38%)"
                }}
              >
                <Image
                  src="/hero-laptop.png"
                  alt="AV-SAFE AI Security Interface displayed on modern laptop"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 860px"
                  className="object-cover object-center sm:object-right scale-[1.03] pointer-events-none"
                />

                {/* Additional soft gradient overlays for seamless color blending on left */}
                <div className="absolute inset-y-0 left-0 w-44 sm:w-64 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
              </div>

              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#1463FF]/30 fill-none z-10" viewBox="0 0 600 450" preserveAspectRatio="none">
                <path d="M 120 70 Q 220 130 360 230" strokeWidth="1.5" strokeDasharray="5 5" />
                <path d="M 500 50 Q 430 130 380 220" strokeWidth="1.5" strokeDasharray="5 5" />
                <path d="M 200 370 Q 280 320 340 260" strokeWidth="1.5" strokeDasharray="5 5" />
              </svg>

              {/* FLOATING BADGE 1: Safe Link (Top-Left of laptop screen) */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
                className="absolute top-[8%] left-[2%] sm:left-[5%] z-20 flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 border border-[#E5ECF5] shadow-xl shadow-slate-900/10 pointer-events-auto cursor-default"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[#10B981]">
                  <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#0B1933] leading-none">Safe Link</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">No threats detected</div>
                </div>
              </motion.div>

              {/* FLOATING BADGE 2: Email Scanned (Top-Right of laptop screen) */}
              <motion.div 
                animate={{ y: [4, -6, 4] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="absolute top-[6%] right-[4%] sm:right-[6%] z-20 flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 border border-[#E5ECF5] shadow-xl shadow-slate-900/10 pointer-events-auto cursor-default"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#1463FF]">
                  <Mail className="h-3.5 w-3.5 stroke-[2.2]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#0B1933] leading-none">Email Scanned</div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Clean</div>
                </div>
              </motion.div>

              {/* FLOATING BADGE 3: Real-time Protection (Bottom-Left / base of laptop) */}
              <motion.div 
                animate={{ y: [-4, 6, -4] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-[10%] left-[6%] sm:left-[12%] z-20 flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 border border-[#E5ECF5] shadow-xl shadow-slate-900/10 pointer-events-auto cursor-default"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[#10B981]">
                  <ShieldCheck className="h-3.5 w-3.5 stroke-[2.2]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#0B1933] leading-none">Real-time Protection</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Active</div>
                </div>
              </motion.div>

            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
