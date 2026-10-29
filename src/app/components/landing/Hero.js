"use client";

import { useState } from "react";
import Link from "next/link";
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
    <section id="hero" className="relative min-h-[640px] lg:min-h-[720px] overflow-hidden bg-white pt-10 pb-16 lg:pt-16 lg:pb-24 flex items-center">
      
      {/* ============ BACKGROUND IMAGE (LAPTOP DESK PHOTO) ============ */}
      <div 
        className="absolute inset-y-0 right-0 w-full lg:w-[60%] pointer-events-none bg-no-repeat bg-cover bg-center opacity-90 lg:opacity-100"
        style={{ backgroundImage: "url('/hero-laptop.png')" }}
      >
        {/* Left-to-right fade gradient: pure white on left, blending smoothly into the desk photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:via-white/35" />
        {/* Bottom fade for seamless transition to next section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/60 to-transparent" />
        {/* Mobile top overlay so text remains readable */}
        <div className="absolute inset-0 bg-white/70 lg:hidden" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ============ LEFT COLUMN: HERO CONTENT ============ */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left z-10">
            
            {/* Small pill: AI-Powered Security */}
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3.5 py-1.5 text-xs font-semibold text-[#101D36] mb-6 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#1463FF]"></span>
              <span>AI-Powered Security</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#101D36] leading-[1.12]">
              Safer Browsing <br />
              <span className="text-[#1463FF]">Starts Here</span>
            </h1>

            {/* Subtext */}
            <p className="mt-5 text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
              Detect and block phishing links, malicious websites and suspicious emails using advanced AI — so you can browse, work and communicate with confidence.
            </p>

            {/* URL Input Form (Rounded Pill Design) */}
            <div className="mt-8 w-full max-w-xl" id="scan">
              <form
                onSubmit={handleScan}
                className="relative flex items-center rounded-full bg-white p-1.5 pl-4 sm:pl-5 border border-[#E5ECF5] shadow-lg shadow-blue-500/5 focus-within:border-[#1463FF] focus-within:ring-2 focus-within:ring-blue-100 transition-all"
              >
                <div className="flex items-center pr-3 text-[#94A3B8]">
                  <Link2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter a URL to analyze (e.g. https://example.com)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-transparent py-2.5 pr-3 text-xs sm:text-sm text-[#101D36] placeholder-[#94A3B8] outline-none"
                  aria-label="URL to scan"
                />
                <button
                  type="submit"
                  disabled={isScanning || !urlInput.trim()}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#1463FF] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#0D52DD] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                </button>
              </form>

              {/* Live Scanning Indicator */}
              {isScanning && (
                <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-[#F3F7FF] px-4 py-2 text-xs text-[#1463FF] animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-[#1463FF]" />
                  <span>AI heuristic scanner inspecting domain SSL, entropy, and brand patterns...</span>
                </div>
              )}

              {/* Scan Results Card */}
              {scanResult && !isScanning && (
                <div className="mt-4 rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-md transition-all">
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
                          <div
                            className={`h-full rounded-full ${
                              scanResult.score > 70 ? "bg-[#10B981]" : scanResult.score > 40 ? "bg-amber-500" : "bg-[#EF4444]"
                            }`}
                            style={{ width: `${scanResult.score}%` }}
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
                      className="font-semibold text-[#1463FF] hover:underline inline-flex items-center gap-1"
                    >
                      Deep Sandbox Console
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Three Trust Indicators in a Row */}
            <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-medium text-[#101D36]">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#1463FF]" />
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
            </div>

          </div>

          {/* ============ RIGHT COLUMN: FLOATING STATUS BADGES OVER BACKGROUND ============ */}
          <div className="lg:col-span-5 relative hidden lg:block h-[440px] pointer-events-none">
            
            {/* SVG Connector Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#1463FF]/30 fill-none" viewBox="0 0 500 440">
              <path d="M 120 70 Q 200 120 280 180" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 430 70 Q 370 120 310 180" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 430 380 Q 360 320 310 260" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {/* FLOATING BADGE 1: Safe Link (Top-Left of laptop) */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-md px-3.5 py-2 border border-[#E5ECF5] shadow-lg shadow-slate-900/5 animate-float pointer-events-auto">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[#10B981]">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#101D36] leading-none">Safe Link</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">No threats detected</div>
              </div>
            </div>

            {/* FLOATING BADGE 2: Email Scanned (Top-Right of laptop) */}
            <div 
              className="absolute top-6 right-2 z-20 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-md px-3.5 py-2 border border-[#E5ECF5] shadow-lg shadow-slate-900/5 animate-float pointer-events-auto"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[#1463FF]">
                <Mail className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#101D36] leading-none">Email Scanned</div>
                <div className="text-[9px] text-[#64748B] mt-0.5">Clean</div>
              </div>
            </div>

            {/* FLOATING BADGE 3: Real-time Protection (Bottom-Right of laptop) */}
            <div 
              className="absolute bottom-10 right-2 z-20 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-md px-3.5 py-2 border border-[#E5ECF5] shadow-lg shadow-slate-900/5 animate-float pointer-events-auto"
              style={{ animationDelay: "2.1s" }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[#10B981]">
                <ShieldCheck className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#101D36] leading-none">Real-time Protection</div>
                <div className="text-[9px] text-emerald-600 font-medium mt-0.5">Active</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
