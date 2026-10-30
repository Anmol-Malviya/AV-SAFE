"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
  QrCode
} from "lucide-react";

const QrScanner = dynamic(() => import("./QrScanner"), { ssr: false });

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
  handleQrScanSuccess,
}) {
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [localScanning, setLocalScanning] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
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
    const interval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % scanSteps.length);
    }, 300);
    return () => clearInterval(interval);
  }, [localScanning, deepScanLoading, scanSteps.length]);

  const handleSubmit = () => {
    if (!urlInput.trim() || localScanning || deepScanLoading) return;
    setScanStepIndex(0);
    setLocalScanning(true);
    setTimeout(() => {
      handleCheckUrl(urlInput);
      setLocalScanning(false);
    }, 1500);
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
      {/* ================= PAGE HEADING ================= */}
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

      {/* ================= MAIN SCANNER WORKSPACE (TOP ROW) ================= */}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1463FF] bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Scan QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHowItWorks(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1463FF] hover:underline cursor-pointer"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>How it works?</span>
                </button>
              </div>
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
                  placeholder="e.g. https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-transparent pl-3 pr-8 text-xs sm:text-sm text-[#101D36] placeholder:text-[#94A3B8] outline-none"
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={handleClearInput}
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
        <div className="bg-white rounded-2xl border border-[#E5ECF5] p-6 sm:p-7 shadow-xs flex flex-col justify-between min-h-[340px]">
          <AnimatePresence mode="wait">
            {/* SCANNING STATE */}
            {isScanningActive ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4"
              >
                {/* Radar sweep circle */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#1463FF]/5 border border-[#1463FF]/15">
                  <RefreshCw className="h-8 w-8 text-[#1463FF] animate-spin" />
                  <div className="absolute inset-0 rounded-full border border-[#1463FF]/20 animate-pulse-ring" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-[#101D36]">
                    AI Threat Diagnostics Running
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Dissecting URL parameters, checking homograph patterns, and validating hostname entropy.
                  </p>
                </div>

                {/* Scan step pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#64748B] font-mono">
                  <Activity className="h-3.5 w-3.5 text-[#1463FF] animate-pulse" />
                  <span>{scanSteps[scanStepIndex]}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="absolute h-full w-1/3 bg-[#1463FF] rounded-full animate-scanning-bar" />
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
                className="space-y-5"
              >
                {/* Header safety bar */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    scanResult.rating === "SAFE"
                      ? "bg-emerald-50/70 border-emerald-200/80"
                      : scanResult.rating === "SUSPICIOUS"
                      ? "bg-amber-50/70 border-amber-200/80"
                      : "bg-rose-50/70 border-rose-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual score circle */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="#E2E8F0" strokeWidth="4" fill="transparent" />
                        <motion.circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke={
                            scanResult.rating === "SAFE"
                              ? "#10B981"
                              : scanResult.rating === "SUSPICIOUS"
                              ? "#F59E0B"
                              : "#EF4444"
                          }
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 24}
                          initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - scanResult.score / 100) }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xs font-extrabold text-[#101D36] leading-none">
                          {scanResult.score}
                        </span>
                        <span className="text-[7px] text-[#64748B] mt-0.5">Score</span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#101D36]">Diagnostic Result</span>
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                          title="Copy URL"
                        >
                          {copiedUrl ? <CheckCheck className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <span className="text-xs text-[#64748B] block truncate max-w-[220px] sm:max-w-xs mt-0.5 font-mono select-all">
                        {scanResult.url}
                      </span>
                    </div>
                  </div>

                  {/* Verdict Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shrink-0 self-start sm:self-auto border ${
                      scanResult.rating === "SAFE"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : scanResult.rating === "SUSPICIOUS"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-rose-100 text-rose-800 border-rose-300"
                    }`}
                  >
                    {scanResult.rating === "SAFE" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : scanResult.rating === "SUSPICIOUS" ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    )}
                    <span>{scanResult.rating}</span>
                  </span>
                </div>

                {/* BRAND ABUSE COMPARISON (If spoofing detected) */}
                {scanResult.rating !== "SAFE" && matchedBrand && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                      Brand Abuse Comparison
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/50">
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
                      <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
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
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      Threat Indicators Detected ({scanResult.warnings.length})
                    </span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {scanResult.warnings.map((warning, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold text-[#101D36]">{warning.title}</span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
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
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Security Controls Passed
                    </span>
                    <div className="space-y-1.5">
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
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#101D36] uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-[#1463FF]" />
                      Live DNS & SSL Server Metadata
                    </span>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2 text-xs text-[#64748B]">
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
                    onClick={handleClearInput}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 text-xs font-semibold text-[#64748B] hover:text-[#101D36] transition-colors cursor-pointer"
                  >
                    <span>New Scan</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* EMPTY IDLE STATE - EXACT MATCH TO VISUAL REFERENCE */
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* Center graphic and message */}
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  {/* Concentric rings graphic */}
                  <div className="relative flex items-center justify-center w-28 h-28 rounded-full border border-dashed border-[#1463FF]/30 bg-gradient-to-b from-[#F3F7FF] to-white/40 mb-5">
                    <div className="w-20 h-20 rounded-full border border-[#1463FF]/20 bg-white flex items-center justify-center shadow-xs">
                      <Shield className="h-9 w-9 text-[#1463FF]" strokeWidth={1.8} />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#101D36]">
                    Awaiting Security Evaluation
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-sm mt-1.5 leading-relaxed">
                    Submit a URL on the left panel to scan structural characteristics, SSL records, and DNS profiles.
                  </p>
                </div>

                {/* Bottom 4 capability indicators */}
                <div className="pt-4 border-t border-[#E5ECF5]/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Shield className="h-4 w-4 text-[#EF4444] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#101D36]">Threat Detection</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Lock className="h-4 w-4 text-[#1463FF] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#101D36]">SSL Analysis</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Database className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#101D36]">DNS Inspection</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Crosshair className="h-4 w-4 text-[#8B5CF6] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#101D36]">Brand Spoofing</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= LOWER WORKSPACE (BOTTOM ROW) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT BOTTOM CARD: Detection Indicators */}
        <div className="bg-white rounded-2xl border border-[#E5ECF5] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm sm:text-base font-bold text-[#101D36]">
                Detection Indicators
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mb-4">
              We analyze multiple signals to identify potential threats.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <span>Official websites always use HTTPS/SSL.</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-[#1463FF] flex items-center justify-center shrink-0">
                  <HelpCircle className="h-3.5 w-3.5" />
                </div>
                <span>Watch for numeric characters mimicking alphabets.</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span>Multi-layered subdomains denote obfuscation.</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#101D36]">
                <div className="h-7 w-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Smartphone className="h-3.5 w-3.5" />
                </div>
                <span>Scan QR codes in sandboxes first.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT BOTTOM CARD: On-Device Protection Client */}
        <div className="bg-[#0B1933] text-white rounded-2xl border border-slate-800 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="max-w-[320px]">
              <span className="text-[10px] font-bold text-[#00C2FF] uppercase tracking-wider block">
                ON-DEVICE PROTECTION CLIENT
              </span>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Get offline local ML evaluation, sandbox renderings, and browser integrations on Android endpoints.
              </p>
              <div className="mt-4">
                <a
                  href="/AV-SAFE.apk"
                  download="AV-SAFE.apk"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 px-4 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download APK File</span>
                </a>
              </div>
              <span className="text-[10px] text-slate-400 block mt-3">
                Available for Android devices • Use on supported endpoints only
              </span>
            </div>

            {/* Stylized Smartphone graphic matching visual reference */}
            <div className="hidden sm:flex relative items-center justify-center w-36 h-36 shrink-0">
              {/* Background circular radar line */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-pulse-ring" />
              <div className="absolute w-28 h-28 rounded-full border border-blue-500/20" />

              {/* Tilted phone mockup */}
              <div className="relative w-20 h-32 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 shadow-2xl flex flex-col items-center justify-center p-1.5 transform rotate-6">
                {/* Notch */}
                <div className="w-6 h-1 bg-slate-950 rounded-full mb-2" />
                
                {/* Screen with glowing Android robot */}
                <div className="flex-1 w-full rounded-xl bg-[#071326] flex items-center justify-center border border-cyan-500/20">
                  <svg className="w-7 h-7 text-[#00C2FF]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993s-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8532 8.0838 12 8.0838s-3.5902.3272-5.1368.866L4.8409 5.4468a.4161.4161 0 0 0-.5677-.1521.4157.4157 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.741h24c-.3432-4.0821-2.6889-7.5543-6.1185-9.4196" />
                  </svg>
                </div>
              </div>

              {/* Floating Badge 1: Blue Shield on top right */}
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-xl bg-[#1463FF] border border-blue-400/40 shadow-lg flex items-center justify-center text-white z-20">
                <Shield className="h-4 w-4" />
              </div>

              {/* Floating Badge 2: Blue Download on bottom right */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#1463FF] border border-blue-400/40 shadow-lg flex items-center justify-center text-white z-20">
                <Download className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= "HOW IT WORKS?" POPUP MODAL ================= */}
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

      {/* ================= MODAL: SCAN QR CODE ================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in-50 duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#EFF6FF] text-[#1463FF]">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101D36]">Scan QR Code for Hidden URLs</h3>
                  <p className="text-[11px] text-slate-400">Aim camera or upload a QR image to extract link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-2">
              <QrScanner
                onScanSuccess={(decodedText) => {
                  setShowQrModal(false);
                  if (handleQrScanSuccess) {
                    handleQrScanSuccess(decodedText);
                  } else {
                    setUrlInput(decodedText);
                    handleCheckUrl(decodedText);
                  }
                }}
                onScanError={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
