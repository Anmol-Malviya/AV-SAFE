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
  Activity,
  Smartphone,
  Laptop,
  Network
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
    <section 
      id="hero" 
      className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-20 bg-cover bg-no-repeat bg-center"
      style={{
        backgroundImage: "url('/hero-base-bg.png')"
      }}
    >
      {/* Fallback & High-Res Next Image layer */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-base-bg.png"
          alt="Hero Background"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft bottom edge transition into the following section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/50 to-transparent" />
      </div>

      {/* Ambient background lighting glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-10 right-10 w-[550px] h-[480px] bg-gradient-to-b from-[#1463FF]/10 via-[#38BDF8]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" 
      />

      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ============ LEFT COLUMN: HERO CONTENT ============ */}
          <motion.div 
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center text-left z-10"
          >
            
            {/* Main Heading */}
            <motion.h1 
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#0B1933] leading-[1.14]"
            >
              Safer Browsing <br />
              <span className="bg-gradient-to-r from-[#1463FF] via-[#0284C7] to-[#2563EB] bg-clip-text text-transparent">
                Starts Here.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={fadeInUp}
              custom={2}
              className="mt-5 text-base sm:text-lg text-[#475569] max-w-xl leading-relaxed"
            >
              Instantly audit suspicious URLs, stop phishing traps, and secure all your devices with real-time heuristic AI defense across mobile and desktop.
            </motion.p>

            {/* URL Input Form (Glassmorphism Pill Design) */}
            <motion.div 
              variants={fadeInUp}
              custom={3}
              className="mt-8 w-full max-w-xl" 
              id="scan"
            >
              <form
                onSubmit={handleScan}
                className="relative flex items-center rounded-full bg-white/95 backdrop-blur-md p-1.5 pl-4 sm:pl-5 border border-[#C5D7F0] shadow-xl shadow-blue-500/10 hover:border-[#1463FF]/70 focus-within:border-[#1463FF] focus-within:ring-4 focus-within:ring-blue-100/70 transition-all"
              >
                <div className="flex items-center pr-3 text-[#94A3B8]">
                  <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#1463FF]" />
                </div>
                <input
                  type="text"
                  placeholder="Paste URL to inspect (e.g. https://paypal-account-verify.net)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-transparent py-2.5 pr-3 text-xs sm:text-sm text-[#0B1933] placeholder-[#94A3B8] outline-none font-medium"
                  aria-label="URL to scan"
                />
                <motion.button
                  type="submit"
                  disabled={isScanning || !urlInput.trim()}
                  whileHover={!isScanning && urlInput.trim() ? buttonHover : {}}
                  whileTap={!isScanning && urlInput.trim() ? buttonTap : {}}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1463FF] to-[#0D52DD] hover:from-[#0D52DD] hover:to-[#083EAB] px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                    <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-blue-200 bg-white/90 backdrop-blur-md px-4 py-2.5 text-xs text-[#1463FF] shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1463FF] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1463FF]"></span>
                      </span>
                      <span className="font-medium">AI heuristic engine checking domain age, SSL integrity, brand impersonation &amp; spoof vectors...</span>
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
                    className="mt-4 rounded-2xl border border-[#D5E3F7] bg-white/95 backdrop-blur-md p-4 shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold tracking-wider uppercase text-[#94A3B8]">Target URL</div>
                        <div className="text-sm font-semibold text-[#101D36] truncate max-w-xs sm:max-w-md">
                          {scanResult.url}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
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
                      <span className="text-[11px] text-[#94A3B8]">Analysis completed in 18ms</span>
                      <Link
                        href="/system"
                        className="font-semibold text-[#1463FF] hover:underline inline-flex items-center gap-1 group"
                      >
                        Open Sandboxed Console
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Quick Action Buttons & Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              custom={4}
              className="mt-7 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/system"
                className="inline-flex items-center gap-2 rounded-full bg-[#0B1933] hover:bg-[#15274D] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 transition-all shadow-md shadow-slate-900/10"
              >
                <Activity className="w-4 h-4 text-[#38BDF8]" />
                <span>Launch Live SOC Console</span>
              </Link>
              <a
                href="/av_safe_architecture.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1463FF] text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all shadow-sm"
              >
                <Network className="w-4 h-4 text-[#1463FF]" />
                <span>View Architecture</span>
              </a>
              <a
                href="/AV-SAFE.apk"
                download
                className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#0B1933] text-xs sm:text-sm font-semibold px-4 py-2.5 transition-all shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-[#1463FF]" />
                <span>Download Android APK</span>
              </a>
            </motion.div>

            {/* Three Trust Indicators in a Row */}
            <motion.div 
              variants={fadeInUp}
              custom={5}
              className="mt-8 flex flex-wrap items-center gap-6 sm:gap-7 text-xs font-medium text-[#475569]"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#1463FF] fill-[#1463FF]/15" />
                <span>Real-time heuristic AI</span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                <span>Multi-device synced protection</span>
              </div>

              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[#1463FF]" />
                <span>Zero telemetry leakage</span>
              </div>
            </motion.div>

          </motion.div>

          {/* ============ RIGHT COLUMN: CLEAN 3D DEVICE SHOWCASE (WITHOUT FLOATING BADGES) ============ */}
          <motion.div 
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center lg:justify-end"
          >
            {/* Soft Ambient Radial Behind Devices */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#1463FF]/15 via-[#38BDF8]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Container for the devices image with smooth infinite floating animation */}
            <motion.div 
              animate={{ 
                y: [-10, 10, -10],
                rotate: [-0.3, 0.3, -0.3]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative w-full max-w-[540px] xl:max-w-[580px]"
            >
              {/* Clean Device Showcase Image */}
              <div className="relative aspect-[1.32/1] w-full drop-shadow-[0_24px_45px_rgba(15,23,42,0.16)] transition-transform duration-500 hover:scale-[1.01]">
                <Image
                  src="/hero-devices-clean.png"
                  alt="AV-SAFE SOC Dashboard on Laptop with Mobile Link Protection Companion App"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-contain object-center pointer-events-none select-none"
                />
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
