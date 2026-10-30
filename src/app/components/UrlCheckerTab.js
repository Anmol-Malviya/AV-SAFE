"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Link2, 
  Download, 
  Lightbulb, 
  Lock, 
  HelpCircle, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  ShieldCheck, 
  Settings, 
  Activity,
  RefreshCw,
  Search,
  Server,
  Database,
  Crosshair,
  Info,
  X,
  Zap,
  ExternalLink,
  Copy,
  CheckCheck,
  QrCode,
  CreditCard,
  Eye
} from "lucide-react";

export default function UrlCheckerTab({
  urlInput,
  setUrlInput,
  isDeepScan,
  setIsDeepScan,
  deepScanLoading,
  isOnline,
  handleCheckUrl,
  handleClearInput,
  scanResult,
  getRatingColorClass,
  setShowSandbox,
  setSandboxTab,
}) {
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [localScanning, setLocalScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const scanSteps = useMemo(
    () => [
      "Resolving host DNS headers...",
      "Querying SSL handshake protocols...",
      "Extracting domain entropy vectors...",
      "Calculating Levenshtein edit distance...",
      "Applying Logistic weights classifier...",
      "Aggregating security heuristic verdicts..."
    ],
    []
  );

  useEffect(() => {
    if (!localScanning && !deepScanLoading) return;
    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % scanSteps.length);
    }, 280);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => (prev < 90 ? prev + 5 : 90));
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [localScanning, deepScanLoading, scanSteps.length]);

  const handleSubmit = () => {
    if (!urlInput.trim() || localScanning || deepScanLoading) return;
    setScanStepIndex(0);
    setScanProgress(15);
    setLocalScanning(true);
    setTimeout(() => {
      handleCheckUrl(urlInput);
      setScanProgress(100);
      setLocalScanning(false);
    }, 1500);
  };

  const handleClear = () => {
    setScanProgress(0);
    handleClearInput();
  };

  const isScanningActive = localScanning || deepScanLoading;

  const matchedBrand = useMemo(() => {
    if (!scanResult) return null;
    const typosquatWarning = scanResult.warnings?.find(
      (w) => w.id === "typosquatting" || w.id === "homograph_attack"
    );
    return (
      typosquatWarning?.desc?.match(/mimics a highly visited website \(([^)]+)\)/)?.[1] ||
      typosquatWarning?.desc?.match(/'([^']+)' but is not/)?.[1] ||
      (scanResult.domain?.includes("google")
        ? "google.com"
        : scanResult.domain?.includes("paypal")
        ? "paypal.com"
        : scanResult.domain?.includes("meta")
        ? "metamask.io"
        : null)
    );
  }, [scanResult]);

  const handleCopyUrl = () => {
    if (!scanResult?.url) return;
    navigator.clipboard.writeText(scanResult.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. PAGE HEADING ================= */}
      <div>
        <div className="flex items-center gap-1.5 text-[#1463FF] text-[11px] font-bold tracking-widest uppercase mb-1">
          <Zap className="h-3.5 w-3.5" />
          <span>SCANNER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101D36] tracking-tight">
          URL Scanner
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
          Check whether a website link is safe, suspicious, or malicious.
        </p>
      </div>

      {/* ================= 2. MAIN SCANNER WORKSPACE (TOP ROW) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT COLUMN: URL Analysis Form */}
        <div className="bg-white rounded-2xl border border-[#E5ECF5] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            {/* Form Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1463FF]/8 border border-[#1463FF]/20 px-3 py-1 text-xs font-semibold text-[#1463FF]">
                <Shield className="h-3.5 w-3.5" />
                <span>AI Threat Engine v2.0</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorks(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1463FF] hover:underline cursor-pointer"
              >
                <Info className="h-3.5 w-3.5" />
                <span>How it works?</span>
              </button>
            </div>

            {/* Heading & Subtitle */}
            <h2 className="text-lg sm:text-xl font-bold text-[#101D36]">
              Enter a URL to scan
            </h2>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              Analyze a link for potential threats, suspicious domains, and available security indicators.
            </p>

            {/* URL Input Wrapper */}
            <div className="mt-5">
              <div className="relative flex items-center rounded-xl border border-[#E5ECF5] bg-white transition-all focus-within:border-[#1463FF] focus-within:ring-2 focus-within:ring-[#1463FF]/15 px-3.5 py-2.5">
                <Link2 className="h-4 w-4 text-[#94A3B8] shrink-0" />
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-transparent pl-3 pr-8 text-xs sm:text-sm text-[#101D36] placeholder:text-[#94A3B8] outline-none"
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Clear input"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Deep Inspection Protocol Checkbox */}
            <div className="mt-4 rounded-xl border border-[#E5ECF5]/80 bg-[#F8FAFD] p-3.5">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDeepScan}
                  onChange={(e) => setIsDeepScan(e.target.checked)}
                  disabled={!isOnline}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1463FF] focus:ring-[#1463FF] cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#101D36]">
                      Deep Inspection Protocol (Optional)
                    </span>
                    <span className="text-[10px] text-slate-400">ⓘ</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                    Verify DNS active records and pull remote SSL certificate parameters.
                    {!isOnline && (
                      <span className="text-red-500 font-semibold ml-1">
                        (Requires active network connection)
                      </span>
                    )}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!urlInput.trim() || isScanningActive}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1463FF] hover:bg-[#0D52DD] active:scale-[0.99] text-sm font-semibold text-white shadow-sm shadow-[#1463FF]/25 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isScanningActive ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Analyzing Link Safety...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Run Diagnostic Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Security Evaluation Panel */}
        <div className="bg-white rounded-2xl border border-[#E5ECF5] p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[380px] overflow-hidden">
          <AnimatePresence mode="wait">
            {/* SCANNING STATE (Modeled after Reference Image 1 "Scanning URL") */}
            {isScanningActive ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col justify-center space-y-6"
              >
                {/* Top scanning card matching Image 1 */}
                <div className="p-5 rounded-2xl bg-[#F0F6FE]/70 border border-[#1463FF]/20 flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white border border-[#1463FF]/30 shadow-xs shrink-0">
                    <Search className="h-6 w-6 text-[#1463FF] animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1463FF]/40 animate-spin" style={{ animationDuration: "8s" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm sm:text-base text-[#101D36]">
                        Scanning URL
                      </h3>
                      <span className="text-xs font-mono font-bold text-[#1463FF]">
                        {scanProgress}%
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">
                      Analyzing domain, SSL records, DNS data and threat indicators...
                    </p>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-blue-100/70 rounded-full overflow-hidden mt-3">
                      <div 
                        className="h-full bg-[#1463FF] rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time step progress text */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#64748B] font-mono">
                    <Activity className="h-3.5 w-3.5 text-[#1463FF] animate-pulse" />
                    <span>{scanSteps[scanStepIndex]}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Evaluating heuristic models, homograph permutations, and domain entropy
                  </p>
                </div>
              </motion.div>
            ) : scanResult ? (
              /* COMPLETED RESULTS STATE */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Status banner matching Reference Image 1 (Scan Completed / Threat Detected) */}
                <div
                  className={`p-4 rounded-xl border flex items-center gap-4 ${
                    scanResult.rating === "SAFE"
                      ? "bg-[#ECFDF5] border-emerald-200"
                      : "bg-[#FEF2F2] border-rose-200"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${
                    scanResult.rating === "SAFE"
                      ? "bg-white border-emerald-300 text-emerald-600 shadow-2xs"
                      : "bg-white border-rose-300 text-rose-600 shadow-2xs"
                  }`}>
                    {scanResult.rating === "SAFE" ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <AlertTriangle className="h-6 w-6" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm sm:text-base text-[#101D36]">
                        {scanResult.rating === "SAFE" ? "Scan Completed" : "Threat Detected"}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          scanResult.rating === "SAFE"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : scanResult.rating === "SUSPICIOUS"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}
                      >
                        {scanResult.rating}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {scanResult.rating === "SAFE"
                        ? "Analysis finished. Review the security evaluation on the left."
                        : "Potential security risks found. Review the detailed analysis."}
                    </p>

                    {/* 100% completed status bar */}
                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full ${
                          scanResult.rating === "SAFE" ? "bg-[#10B981]" : "bg-[#EF4444]"
                        }`}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Scanned URL bar with copy */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">URL</span>
                    <span className="text-xs text-[#101D36] font-mono truncate max-w-[260px] sm:max-w-md select-all">
                      {scanResult.url}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title="Copy URL"
                  >
                    {copiedUrl ? <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* BRAND ABUSE COMPARISON (If spoofing detected) */}
                {scanResult.rating !== "SAFE" && matchedBrand && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                      Brand Abuse Comparison
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50">
                        <span className="text-[9px] uppercase tracking-wider text-rose-700 font-bold block">
                          SUSPICIOUS HOST
                        </span>
                        <span className="text-xs font-bold text-[#101D36] mt-0.5 block truncate">
                          {scanResult.domain}
                        </span>
                        <span className="text-[10px] text-rose-600 font-medium mt-1 inline-flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Spoof Attempt
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold block">
                          LEGITIMATE TARGET
                        </span>
                        <span className="text-xs font-bold text-[#101D36] mt-0.5 block truncate">
                          {matchedBrand}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                          <Check className="h-3 w-3" /> Official Site
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* THREAT FACTORS LIST */}
                {scanResult.warnings?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      Threat Indicators Detected ({scanResult.warnings.length})
                    </span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {scanResult.warnings.map((warning, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold text-[#101D36]">{warning.title}</span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                warning.severity === "high"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {warning.severity} Risk
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] leading-relaxed">{warning.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECURITY CONTROLS PASSED */}
                {scanResult.safeIndicators?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Security Controls Passed
                    </span>
                    <div className="space-y-1">
                      {scanResult.safeIndicators.map((indicator, index) => (
                        <div
                          key={index}
                          className="flex gap-2 items-center text-xs text-[#64748B] bg-emerald-50/40 p-2 rounded-xl border border-emerald-100/50"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LIVE DNS & SSL METADATA (When Deep Inspection run) */}
                {scanResult.deepScan && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-[#1463FF]" />
                      Live DNS & SSL Server Metadata
                    </span>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-1.5 text-xs text-[#64748B]">
                      <div className="flex justify-between">
                        <span>Target IP Address</span>
                        <span className="font-bold text-[#101D36] font-mono">
                          {scanResult.deepScan.dns?.ip || "Host Not Resolving"}
                        </span>
                      </div>
                      {scanResult.deepScan.ssl?.hasCert && (
                        <>
                          <div className="flex justify-between">
                            <span>SSL Certificate Issuer</span>
                            <span className="font-bold text-[#101D36] font-mono truncate max-w-[200px]">
                              {scanResult.deepScan.ssl.issuer}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>SSL Expiration Date</span>
                            <span className="font-bold text-[#101D36] font-mono">
                              {new Date(scanResult.deepScan.ssl.validTo).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions bottom row */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSandbox(true);
                      setSandboxTab("render");
                    }}
                    className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E5ECF5] hover:bg-slate-50 text-xs font-semibold text-[#101D36] transition-all cursor-pointer shadow-2xs"
                  >
                    <Globe className="h-3.5 w-3.5 text-[#1463FF]" />
                    <span>Launch Sandbox Safe render</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 text-xs font-semibold text-[#64748B] hover:text-[#101D36] transition-colors cursor-pointer"
                  >
                    <span>New Scan</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* EMPTY IDLE STATE - PURE REACT + VECTOR SVG COMPONENTS (ZERO OVERFLOW) */
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col justify-between py-1 select-none w-full"
              >
                {/* Upper Centered Composition with Constrained Width for Orbit Fit */}
                <div className="relative w-full h-[255px] sm:h-[275px] flex items-center justify-center my-auto overflow-hidden">
                  {/* Center Shield & Orbital System (Pure Vector SVG) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg
                      viewBox="0 0 240 240"
                      className="w-[230px] h-[230px] sm:w-[250px] sm:h-[250px]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        {/* Soft Ambient Radial Aura */}
                        <radialGradient id="centerAura" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1463FF" stopOpacity="0.10" />
                          <stop offset="65%" stopColor="#00C2FF" stopOpacity="0.03" />
                          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </radialGradient>

                        {/* Inner Core Circle Gradient */}
                        <radialGradient id="shieldCoreGradient" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stopColor="#EFF6FF" />
                          <stop offset="100%" stopColor="#DBEAFE" />
                        </radialGradient>

                        {/* Crisp Shield Gradient */}
                        <linearGradient id="shieldBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1463FF" />
                          <stop offset="100%" stopColor="#00A3FF" />
                        </linearGradient>

                        {/* Shield Inner Glow */}
                        <linearGradient id="shieldInnerGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#1463FF" stopOpacity="0.09" />
                          <stop offset="100%" stopColor="#1463FF" stopOpacity="0.02" />
                        </linearGradient>

                        {/* Glow Filter for Orbital Particle Nodes */}
                        <filter id="nodeGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Ambient Radial Aura */}
                      <circle cx="120" cy="120" r="110" fill="url(#centerAura)" />

                      {/* Outer Dashed Orbit Path (Radius 106) */}
                      <circle
                        cx="120"
                        cy="120"
                        r="106"
                        stroke="#CBD5E1"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                        className="opacity-70"
                      />

                      {/* Middle Solid Orbit Path (Radius 88) */}
                      <circle
                        cx="120"
                        cy="120"
                        r="88"
                        stroke="#E2E8F0"
                        strokeWidth="1.2"
                      />

                      {/* Soft Shaded Ring (Radius 66) */}
                      <circle
                        cx="120"
                        cy="120"
                        r="66"
                        stroke="#BFDBFE"
                        strokeWidth="1.2"
                        fill="#F8FAFC"
                        fillOpacity="0.5"
                      />

                      {/* Inner Glowing Core (Radius 46) */}
                      <circle
                        cx="120"
                        cy="120"
                        r="46"
                        fill="url(#shieldCoreGradient)"
                        stroke="#93C5FD"
                        strokeWidth="1.2"
                      />

                      {/* ORBITAL PARTICLES & NODES DIRECTLY ON PATHS */}
                      {/* Top Right Cyan Node (radius ~88, angle ~45 deg) */}
                      <circle cx="182" cy="58" r="4.5" fill="#00C2FF" filter="url(#nodeGlowFilter)" />
                      <circle cx="182" cy="58" r="1.8" fill="#FFFFFF" />

                      {/* Top Blue Node (radius ~106, angle ~90 deg) */}
                      <circle cx="120" cy="14" r="3.5" fill="#1463FF" filter="url(#nodeGlowFilter)" />

                      {/* Top Left Blue Node (radius ~88, angle ~135 deg) */}
                      <circle cx="58" cy="58" r="4" fill="#1463FF" />

                      {/* Far Left Green Node (radius ~88, angle ~180 deg) */}
                      <circle cx="32" cy="120" r="3.5" fill="#10B981" filter="url(#nodeGlowFilter)" />

                      {/* Bottom Right Purple Node (radius ~106, angle ~315 deg) */}
                      <circle cx="195" cy="195" r="4" fill="#8B5CF6" filter="url(#nodeGlowFilter)" />

                      {/* Bottom Blue Node (radius ~88, angle ~270 deg) */}
                      <circle cx="120" cy="208" r="3" fill="#1463FF" />

                      {/* Inner Cyan Pulse Node */}
                      <circle cx="156" cy="84" r="3.2" fill="#00C2FF" />

                      {/* ============= CENTRAL CYBER SECURITY SHIELD ============= */}
                      {/* Shield Inner Fill */}
                      <path
                        d="M120 95 C128 92 136 89 144 89 C144 114 138 132 120 146 C102 132 96 114 96 89 C104 89 112 92 120 95 Z"
                        fill="url(#shieldInnerGlow)"
                      />

                      {/* Crisp Vector Shield Stroke */}
                      <path
                        d="M120 95 C128 92 136 89 144 89 C144 114 138 132 120 146 C102 132 96 114 96 89 C104 89 112 92 120 95 Z"
                        stroke="url(#shieldBorderGradient)"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Shield Highlight Glint */}
                      <path
                        d="M120 100 C126 98 132 95 136 94 C136 109 133 121 120 132"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        opacity="0.65"
                      />
                    </svg>
                  </div>

                  {/* Left Column Badges */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around py-2 z-10">
                    {/* 1. Threat Detection */}
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-rose-100 shadow-[0_2px_10px_rgba(239,68,68,0.06)] hover:shadow-md transition-all">
                      <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-500 shrink-0">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#101D36] whitespace-nowrap">
                        Threat Detection
                      </span>
                    </div>

                    {/* 2. SSL Analysis */}
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-blue-100 shadow-[0_2px_10px_rgba(20,99,255,0.06)] hover:shadow-md transition-all">
                      <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-[#1463FF] shrink-0">
                        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#101D36] whitespace-nowrap">
                        SSL Analysis
                      </span>
                    </div>
                  </div>

                  {/* Right Column Badges */}
                  <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around py-2 z-10">
                    {/* 3. DNS Inspection */}
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-[0_2px_10px_rgba(16,185,129,0.06)] hover:shadow-md transition-all">
                      <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                        <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#101D36] whitespace-nowrap">
                        DNS Inspection
                      </span>
                    </div>

                    {/* 4. Brand Spoofing */}
                    <div className="flex items-center gap-2 sm:gap-2.5 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border border-purple-100 shadow-[0_2px_10px_rgba(139,92,246,0.06)] hover:shadow-md transition-all">
                      <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 shrink-0">
                        <Crosshair className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#101D36] whitespace-nowrap">
                        Brand Spoofing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text underneath */}
                <div className="text-center pt-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#101D36] tracking-tight">
                    Awaiting Security Evaluation
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 leading-relaxed">
                    Submit a URL on the left panel to scan structural characteristics, SSL records, and DNS profiles.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= 3. LOWER WORKSPACE (BOTTOM ROW) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT BOTTOM CARD: Detection Indicators (Matching Prompt Section 6) */}
        <div className="bg-white rounded-2xl border border-[#E5ECF5] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm sm:text-base font-bold text-[#101D36]">
                Detection Indicators
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mb-5">
              Review common warning signs before trusting a link.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60 shadow-2xs">
                  <Lock className="h-4 w-4" />
                </div>
                <span className="font-medium">Check domain spelling carefully.</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#1463FF] flex items-center justify-center shrink-0 border border-blue-100/60 shadow-2xs">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="font-medium">Watch for lookalike domains.</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/60 shadow-2xs">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="font-medium">Verify unexpected login and payment links.</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-8 w-8 rounded-xl bg-cyan-50 text-[#00C2FF] flex items-center justify-center shrink-0 border border-cyan-100/60 shadow-2xs">
                  <QrCode className="h-4 w-4" />
                </div>
                <span className="font-medium">Treat suspicious QR destinations carefully.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT BOTTOM CARD: On-Device Protection Client ("Extend Your Protection" matching Reference Images 1 & 3) */}
        <div className="bg-[#0B1933] text-white rounded-2xl border border-slate-800 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-[330px]">
              <span className="text-[10px] font-bold text-[#00C2FF] uppercase tracking-wider block">
                ON-DEVICE PROTECTION CLIENT
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
                Extend Your Protection
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Get offline local ML evaluation, sandbox renderings, and browser integrations on Android endpoints.
              </p>

              {/* 4 Features Checkmarks in 2x2 grid (From Reference Image 1 & 3) */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>Offline threat analysis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>Browser integration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>Sandbox renderings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span>Lightweight and secure</span>
                </div>
              </div>

              {/* Download APK Button */}
              <div className="mt-5">
                <a
                  href="/AV-SAFE.apk"
                  download="AV-SAFE.apk"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1463FF] hover:bg-[#0D52DD] active:scale-[0.99] px-5 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm shadow-[#1463FF]/30"
                >
                  <Download className="h-4 w-4" />
                  <span>Download APK File</span>
                </a>
              </div>
              <span className="text-[10px] text-slate-400 block mt-3">
                Available for Android devices • Use on supported endpoints only
              </span>
            </div>

            {/* Android phone mockup illustration (Using high quality extracted asset) */}
            <div className="hidden sm:flex relative items-center justify-center w-44 h-48 shrink-0">
              <Image
                src="/android_phone_illustration.png"
                alt="AV-SAFE Android Protection Client"
                width={320}
                height={400}
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,194,255,0.2)]"
                priority
              />
            </div>
          </div>
        </div>

      </div>

      {/* ================= 4. "HOW IT WORKS?" POPUP MODAL ================= */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E5ECF5] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#1463FF]/10 text-[#1463FF] flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101D36]">How AI Threat Engine Works</h3>
                  <span className="text-[10px] text-[#64748B]">Multi-Layer Heuristic & Machine Learning Pipeline</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#64748B]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-[#101D36] block mb-0.5">1. Lexical & Syntax Verification</span>
                Analyzes URL structure, TLD character length, protocol validity, and sensitive keyword density.
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-[#101D36] block mb-0.5">2. Typosquatting & Brand Spoofing Check</span>
                Calculates Levenshtein edit distance and homograph substitutions against high-profile enterprise brands.
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-[#101D36] block mb-0.5">3. Shannon Entropy Scoring</span>
                Evaluates character randomness to detect algorithmically generated domains (DGA) used by botnets.
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-[#101D36] block mb-0.5">4. Machine Learning Logistic Scoring</span>
                Computes logistic classification probability using trained Kaggle dataset feature weights.
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-[#101D36] block mb-0.5">5. Deep Inspection Protocol</span>
                Performs live DNS resolution, SSL/TLS handshake certificate verification, and form credential audits.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                className="px-4 py-2 rounded-xl bg-[#1463FF] hover:bg-[#0D52DD] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
