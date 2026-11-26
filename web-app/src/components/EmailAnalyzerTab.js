"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Upload, 
  FileText, 
  Folder, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  RefreshCw, 
  Download, 
  Copy, 
  CheckCheck,
  ChevronRight,
  AlertOctagon,
  FileCode,
  Sparkles,
  Info
} from "lucide-react";

// Pre-packaged realistic sample headers for instant verification & testing
const SAMPLE_LEGIT_HEADERS = `From: Security Team <security@notifications.github.com>
Return-Path: <bounce-9281@notifications.github.com>
Subject: [GitHub] Security verification: New sign-in from recognized device
Date: Fri, 30 Oct 2026 09:15:32 +0000
Authentication-Results: mx.google.com;
 dkim=pass header.i=@notifications.github.com header.s=s202109;
 spf=pass (google.com: domain of bounce-9281@notifications.github.com designates 192.30.252.204 as permitted sender);
 dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=notifications.github.com
Received-SPF: pass (google.com: domain of bounce-9281@notifications.github.com designates 192.30.252.204 as permitted sender)
Message-ID: <auth-notice-910248@notifications.github.com>`;

const SAMPLE_SPOOFED_HEADERS = `From: PayPal Support <support@paypal.com>
Return-Path: <attacker@scam-relay-vps.ru>
Subject: URGENT: Your PayPal account has been suspended! Action required
Date: Fri, 30 Oct 2026 10:20:45 +0000
Authentication-Results: mx.google.com;
 dkim=fail;
 spf=fail (google.com: domain of attacker@scam-relay-vps.ru does not designate 185.220.101.4 as permitted sender);
 dmarc=fail (p=REJECT) header.from=paypal.com
Received-SPF: fail
Message-ID: <phish-fake-session-3891@scam-relay-vps.ru>`;

export default function EmailAnalyzerTab({
  emailHeadersInput = "",
  setEmailHeadersInput,
  emailScanResult,
  setEmailScanResult,
  emailScanLoading = false,
  handleCheckEmailHeaders,
  handleClearEmailInput,
  getRatingColorClass,
}) {
  const [activeMode, setActiveMode] = useState("upload"); // "upload" | "paste"
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);
  const fileInputRef = useRef(null);

  // Maximum allowed file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Format file size helper
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Process selected file
  const processFile = (file) => {
    setFileError("");
    if (!file) return;

    // Check extension
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "eml" && extension !== "txt") {
      setFileError("Unsupported file type. Please upload a .eml or .txt email file.");
      return;
    }

    // Check size limit
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds 10MB limit. Please upload a smaller email file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setSelectedFile({
        name: file.name,
        size: formatBytes(file.size),
        rawBytes: file.size,
        content: content,
      });
      if (setEmailHeadersInput) {
        setEmailHeadersInput(content);
      }
    };
    reader.onerror = () => {
      setFileError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (handleClearEmailInput) {
      handleClearEmailInput();
    } else if (setEmailHeadersInput) {
      setEmailHeadersInput("");
    }
  };

  // Primary action button click
  const handleAnalyzeClick = () => {
    if (emailScanLoading) return;

    let textToAnalyze = "";
    if (activeMode === "upload") {
      if (!selectedFile?.content) {
        setFileError("Please select or drop an email file first.");
        return;
      }
      textToAnalyze = selectedFile.content;
    } else {
      if (!emailHeadersInput?.trim()) return;
      textToAnalyze = emailHeadersInput;
    }

    if (handleCheckEmailHeaders) {
      handleCheckEmailHeaders(textToAnalyze);
    }
  };

  // Load sample headers into paste mode
  const handleLoadSample = (sampleText) => {
    if (setEmailHeadersInput) {
      setEmailHeadersInput(sampleText);
    }
    setShowSamplesMenu(false);
  };

  // Download raw report
  const handleDownloadReport = () => {
    if (!emailScanResult) return;
    const reportText = `=====================================================
AV-SAFE THREAT SHIELD - EMAIL AUTHENTICATION REPORT
Generated: ${new Date().toLocaleString()}
=====================================================

OVERALL VERDICT: ${emailScanResult.rating || "UNKNOWN"}
SAFETY / TRUST SCORE: ${emailScanResult.score ?? "N/A"}/100

SENDER IDENTITY:
----------------
From: ${emailScanResult.from || "Unknown"}
Subject: ${emailScanResult.subject || "(No Subject)"}
Return-Path Domain: ${emailScanResult.returnPathDomain || "Not Found"}
Date: ${emailScanResult.date || "Unknown"}

AUTHENTICATION CHECKS:
----------------------
SPF Status:   ${emailScanResult.spfStatus || "NONE"}
DKIM Status:  ${emailScanResult.dkimStatus || "NONE"}
DMARC Status: ${emailScanResult.dmarcStatus || "NONE"}

DETECTED THREAT INDICATORS:
---------------------------
${(emailScanResult.warnings && emailScanResult.warnings.length > 0)
  ? emailScanResult.warnings.map((w, idx) => `[${w.severity ? w.severity.toUpperCase() : "WARN"}] ${w.title}: ${w.desc}`).join("\n")
  : "None detected."}

VERIFIED SECURITY CONTROLS:
---------------------------
${(emailScanResult.safeIndicators && emailScanResult.safeIndicators.length > 0)
  ? emailScanResult.safeIndicators.map((s) => `[PASSED] ${s}`).join("\n")
  : "None."}

=====================================================
AV-SAFE Security Defense System
=====================================================`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AV-SAFE-Email-Audit-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy report summary to clipboard
  const handleCopySummary = () => {
    if (!emailScanResult) return;
    const summary = `AV-SAFE Email Security Verdict: ${emailScanResult.rating} (${emailScanResult.score}/100)\nFrom: ${emailScanResult.from}\nSPF: ${emailScanResult.spfStatus} | DKIM: ${emailScanResult.dkimStatus} | DMARC: ${emailScanResult.dmarcStatus}`;
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Determine if primary button should be enabled
  const canAnalyze = useMemo(() => {
    if (emailScanLoading) return false;
    if (activeMode === "upload") {
      return Boolean(selectedFile?.content);
    }
    return Boolean(emailHeadersInput && emailHeadersInput.trim().length > 0);
  }, [activeMode, selectedFile, emailHeadersInput, emailScanLoading]);

  return (
    <div className="space-y-6">
      
      {/* ================= 1. BREADCRUMB & PAGE HEADING ================= */}
      <div>
        {/* Breadcrumb matching reference */}
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] font-medium mb-3">
          <span className="hover:text-[#64748B] transition-colors cursor-pointer">Home</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#CBD5E1]" />
          <span className="text-[#64748B] font-semibold">Email Scanner</span>
        </div>

        {/* Category Pill Tag */}
        <div className="flex items-center gap-1.5 text-[#1463FF] text-[11px] font-bold tracking-widest uppercase mb-1">
          <Mail className="h-3.5 w-3.5" />
          <span>EMAIL SCANNER</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101D36] tracking-tight">
          Email Authentication Analysis
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
          Analyze email headers to identify spoofing and authentication failures.
        </p>
      </div>

      {/* ================= 2. MAIN TWO-COLUMN WORKSPACE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* ================= LEFT CARD: ANALYZE EMAIL HEADERS ================= */}
        <div className="bg-white rounded-2xl border border-[#E5ECF5] p-6 sm:p-7 shadow-xs flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Card Header */}
            <div className="flex items-start gap-2.5 mb-5">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[#1463FF] shrink-0 mt-0.5">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#101D36] leading-tight">
                  Analyze Email Headers
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                  Upload an email file (.eml / .txt) or paste raw headers to start the analysis.
                </p>
              </div>
            </div>

            {/* Input Mode Tabs Switcher */}
            <div className="bg-[#F1F5F9] p-1 rounded-xl flex items-center mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("upload");
                  setFileError("");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeMode === "upload"
                    ? "bg-white text-[#101D36] shadow-xs"
                    : "text-[#64748B] hover:text-[#101D36]"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode("paste");
                  setFileError("");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeMode === "paste"
                    ? "bg-white text-[#101D36] shadow-xs"
                    : "text-[#64748B] hover:text-[#101D36]"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Paste Headers</span>
              </button>
            </div>

            {/* TAB CONTENT: UPLOAD FILE */}
            {activeMode === "upload" && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".eml,.txt,message/rfc822,text/plain"
                  className="hidden"
                />

                {!selectedFile ? (
                  /* Clean Drag-and-Drop Area matching screenshot */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-7 sm:p-9 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isDragOver
                        ? "border-[#1463FF] bg-[#1463FF]/5 scale-[1.01]"
                        : "border-[#CBD5E1] hover:border-[#1463FF]/50 bg-white"
                    }`}
                  >
                    {/* Cloud Icon with Arrow inside */}
                    <div className="w-12 h-12 rounded-full bg-[#1463FF]/10 text-[#1463FF] flex items-center justify-center mb-3">
                      <svg
                        className="w-7 h-7 stroke-[#1463FF] fill-none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                        <path d="M12 12v9" />
                        <path d="m8 16 4-4 4 4" />
                      </svg>
                    </div>

                    <h3 className="text-xs sm:text-sm font-semibold text-[#101D36]">
                      Drag & drop your .eml or .txt file here
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      or click to browse
                    </p>

                    {/* Choose File Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1463FF] hover:bg-[#0D52DD] active:scale-[0.99] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <Folder className="h-3.5 w-3.5" />
                      <span>Choose File</span>
                    </button>

                    <p className="text-[11px] text-[#94A3B8] mt-3">
                      Supported formats: .eml, .txt (Max 10MB)
                    </p>
                  </div>
                ) : (
                  /* Selected File Preview Box */
                  <div className="border border-[#E5ECF5] bg-[#F8FAFD] rounded-2xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1463FF]/10 text-[#1463FF] flex items-center justify-center shrink-0">
                          <FileCode className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[#101D36] truncate">
                            {selectedFile.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#64748B]">
                              {selectedFile.size}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <Check className="h-2.5 w-2.5" /> Ready for scan
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E5ECF5] text-xs">
                      <span className="text-[#64748B]">Change file:</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#1463FF] hover:text-[#0D52DD] font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Browse another file
                      </button>
                    </div>
                  </div>
                )}

                {/* Validation Error Banner */}
                {fileError && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PASTE HEADERS */}
            {activeMode === "paste" && (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={8}
                    value={emailHeadersInput}
                    onChange={(e) => {
                      if (setEmailHeadersInput) {
                        setEmailHeadersInput(e.target.value);
                      }
                    }}
                    placeholder={`Paste raw email headers here...\n\nFrom: sender@example.com\nReturn-Path: <bounce@example.com>\nAuthentication-Results: spf=pass...`}
                    className="w-full h-48 sm:h-56 rounded-xl border border-[#E5ECF5] p-3.5 font-mono text-xs text-[#101D36] placeholder:text-[#94A3B8] focus:border-[#1463FF] focus:ring-1 focus:ring-[#1463FF] outline-none transition-all resize-none bg-white"
                  />

                  {emailHeadersInput && (
                    <button
                      type="button"
                      onClick={() => {
                        if (handleClearEmailInput) handleClearEmailInput();
                        else if (setEmailHeadersInput) setEmailHeadersInput("");
                      }}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Clear text"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Helper Toolbar for Samples */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#94A3B8] text-[11px]">Quick samples:</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSample(SAMPLE_LEGIT_HEADERS)}
                      className="px-2 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#101D36] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Legit Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample(SAMPLE_SPOOFED_HEADERS)}
                      className="px-2 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#101D36] text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Spoofed / Phish
                    </button>
                  </div>

                  <span className="text-[11px] text-[#94A3B8]">
                    {emailHeadersInput ? `${emailHeadersInput.split("\n").length} lines` : "Empty input"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button: "Analyze Email" */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={!canAnalyze}
              className="w-full h-11 sm:h-12 rounded-xl bg-[#1463FF] hover:bg-[#0D52DD] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#1463FF]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {emailScanLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Analyzing Email Headers...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Analyze Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= RIGHT CARD: ANALYSIS RESULTS ================= */}
        <div className="bg-white rounded-2xl border border-[#E5ECF5] p-6 sm:p-7 shadow-xs flex flex-col justify-between min-h-[460px] relative overflow-hidden">
          
          <div>
            {/* Card Header */}
            <div className="flex items-start gap-2.5 mb-5">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[#1463FF] shrink-0 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#101D36] leading-tight">
                  Analysis Results
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                  Your email header analysis results will appear here.
                </p>
              </div>
            </div>

            {/* RESULTS CONTENT AREA */}
            <AnimatePresence mode="wait">
              {/* 1. LOADING STATE */}
              {emailScanLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-14 sm:py-16 flex flex-col items-center justify-center text-center"
                >
                  <div className="relative flex items-center justify-center w-20 h-20 mb-5">
                    <div className="absolute inset-0 rounded-full border-2 border-[#1463FF]/20 animate-pulse-ring" />
                    <div className="w-16 h-16 rounded-full bg-[#1463FF]/10 flex items-center justify-center text-[#1463FF]">
                      <Mail className="h-8 w-8 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#101D36]">
                    Analyzing Email Authentication
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-xs mt-1">
                    Verifying SPF records, validating DKIM cryptographic signatures, and inspecting DMARC policy alignment...
                  </p>
                  <div className="w-48 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden mt-6">
                    <div className="h-full w-2/3 bg-[#1463FF] rounded-full animate-scanning-bar" />
                  </div>
                </motion.div>
              ) : emailScanResult && emailScanResult.isValid ? (
                
                /* 2. SUCCESSFUL STRUCTURED ANALYSIS STATE */
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Verdict & Safety Score Header Card */}
                  <div
                    className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      emailScanResult.rating === "SAFE"
                        ? "bg-emerald-50/40 border-emerald-200/80"
                        : emailScanResult.rating === "SUSPICIOUS"
                        ? "bg-amber-50/40 border-amber-200/80"
                        : "bg-red-50/40 border-red-200/80"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-14 h-14 transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="#E2E8F0"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke={
                              emailScanResult.rating === "SAFE"
                                ? "#10B981"
                                : emailScanResult.rating === "SUSPICIOUS"
                                ? "#F59E0B"
                                : "#EF4444"
                            }
                            strokeWidth="3.5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={2 * Math.PI * 24 * (1 - (emailScanResult.score ?? 50) / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-xs font-extrabold text-[#101D36]">
                          {emailScanResult.score}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                              emailScanResult.rating === "SAFE"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : emailScanResult.rating === "SUSPICIOUS"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {emailScanResult.rating === "SAFE" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : emailScanResult.rating === "SUSPICIOUS" ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <ShieldAlert className="h-3 w-3" />
                            )}
                            {emailScanResult.rating === "SAFE" ? "AUTHENTIC / SAFE" : emailScanResult.rating === "SUSPICIOUS" ? "SUSPICIOUS EMAIL" : "SPOOFED / MALICIOUS"}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-1 font-medium">
                          {emailScanResult.rating === "SAFE"
                            ? "All critical domain authentication controls passed."
                            : emailScanResult.rating === "SUSPICIOUS"
                            ? "Authentication warning or softfail detected."
                            : "Sender address spoofing or critical authentication failures."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#64748B] text-xs font-medium transition-colors"
                        title="Copy summary"
                      >
                        {copiedText ? (
                          <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadReport}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101D36] hover:bg-[#0B1933] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        title="Export TXT Report"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Sender Identity Details */}
                  <div className="bg-[#F8FAFD] rounded-xl border border-[#E5ECF5] p-3.5 text-xs space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[#94A3B8] font-medium shrink-0">Sender (From):</span>
                      <span className="font-semibold text-[#101D36] truncate text-right font-mono text-[11px]">
                        {emailScanResult.from}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[#94A3B8] font-medium shrink-0">Return-Path:</span>
                      <span className="font-semibold text-[#101D36] truncate text-right font-mono text-[11px]">
                        {emailScanResult.returnPathDomain || "None / Not Specified"}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[#94A3B8] font-medium shrink-0">Subject:</span>
                      <span className="font-medium text-[#101D36] truncate text-right">
                        {emailScanResult.subject}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[#94A3B8] font-medium shrink-0">Date:</span>
                      <span className="text-[#64748B] text-right">
                        {emailScanResult.date}
                      </span>
                    </div>
                  </div>

                  {/* 3 Core Security Checks: SPF, DKIM, DMARC */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* SPF Status */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all ${
                        emailScanResult.spfStatus === "PASS"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                          : emailScanResult.spfStatus === "FAIL"
                          ? "bg-red-50/70 border-red-200 text-red-800"
                          : emailScanResult.spfStatus === "SOFTFAIL"
                          ? "bg-amber-50/70 border-amber-200 text-amber-800"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider block text-[#64748B]">
                        SPF Check
                      </span>
                      <span className="text-xs font-extrabold block mt-1">
                        {emailScanResult.spfStatus || "NONE"}
                      </span>
                      <span className="text-[9px] block text-[#64748B] mt-0.5 leading-tight">
                        {emailScanResult.spfStatus === "PASS"
                          ? "Authorized Server"
                          : emailScanResult.spfStatus === "FAIL"
                          ? "Unauthorized IP"
                          : emailScanResult.spfStatus === "SOFTFAIL"
                          ? "Softfail Policy"
                          : "No Record Found"}
                      </span>
                    </div>

                    {/* DKIM Status */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all ${
                        emailScanResult.dkimStatus === "PASS"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                          : emailScanResult.dkimStatus === "FAIL"
                          ? "bg-red-50/70 border-red-200 text-red-800"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider block text-[#64748B]">
                        DKIM Crypto
                      </span>
                      <span className="text-xs font-extrabold block mt-1">
                        {emailScanResult.dkimStatus || "NONE"}
                      </span>
                      <span className="text-[9px] block text-[#64748B] mt-0.5 leading-tight">
                        {emailScanResult.dkimStatus === "PASS"
                          ? "Signature Valid"
                          : emailScanResult.dkimStatus === "FAIL"
                          ? "Signature Invalid"
                          : "Not Signed"}
                      </span>
                    </div>

                    {/* DMARC Status */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all ${
                        emailScanResult.dmarcStatus === "PASS"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                          : emailScanResult.dmarcStatus === "FAIL"
                          ? "bg-red-50/70 border-red-200 text-red-800"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider block text-[#64748B]">
                        DMARC Align
                      </span>
                      <span className="text-xs font-extrabold block mt-1">
                        {emailScanResult.dmarcStatus || "NONE"}
                      </span>
                      <span className="text-[9px] block text-[#64748B] mt-0.5 leading-tight">
                        {emailScanResult.dmarcStatus === "PASS"
                          ? "Policy Aligned"
                          : emailScanResult.dmarcStatus === "FAIL"
                          ? "Alignment Failed"
                          : "No Policy"}
                      </span>
                    </div>
                  </div>

                  {/* Detected Threats / Warnings List */}
                  {emailScanResult.warnings && emailScanResult.warnings.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <h4 className="text-xs font-bold text-[#101D36] flex items-center gap-1.5 uppercase tracking-wider">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span>Detected Threats & Findings</span>
                      </h4>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {emailScanResult.warnings.map((warning, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-red-100 bg-red-50/40 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-[#101D36]">
                                {warning.title}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                                {warning.severity || "Risk"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B] leading-relaxed">
                              {warning.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Controls Passed */}
                  {emailScanResult.safeIndicators && emailScanResult.safeIndicators.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-xs font-bold text-[#101D36] flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Verified Security Controls</span>
                      </h4>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {emailScanResult.safeIndicators.map((indicator, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/30 border border-emerald-100/40 text-xs text-[#64748B]"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[11px]">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : emailScanResult && !emailScanResult.isValid ? (

                /* 3. ERROR STATE */
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                    <AlertOctagon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#101D36]">
                    Analysis Could Not Complete
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-xs">
                    {emailScanResult.warnings?.[0] || "Invalid or empty email headers. Please provide valid RFC-formatted headers."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (handleClearEmailInput) handleClearEmailInput();
                      else if (setEmailScanResult) setEmailScanResult(null);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1463FF] text-white text-xs font-semibold hover:bg-[#0D52DD] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Try Again</span>
                  </button>
                </motion.div>
              ) : (

                /* 4. INITIAL EMPTY STATE (Matching screenshot visual reference precisely) */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 sm:py-16 flex flex-col items-center justify-center text-center relative z-10"
                >
                  {/* Concentric Circle Illustration with Blue Envelope */}
                  <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 mb-6">
                    {/* Outer Dashed/Dotted Ring */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#CBD5E1]" />

                    {/* 4 Cardinal Node Dots */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-[#94A3B8]" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border border-[#94A3B8]" />
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-[#94A3B8]" />
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-[#94A3B8]" />

                    {/* Inner Circular Disc with soft gradient */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-[#EDF5FF] to-[#DCE9FF] flex items-center justify-center shadow-xs">
                      
                      {/* Stylized Modern Blue Mail Envelope with white card sticking out */}
                      <div className="relative w-14 h-10 bg-[#1463FF] rounded-lg shadow-md flex items-center justify-center">
                        {/* White paper sheet / card peeking out from top */}
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-4 bg-white rounded-t-sm shadow-xs border-t border-x border-[#E2E8F0] flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-[#CBD5E1] rounded-full" />
                        </div>

                        {/* Envelope flap folds */}
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 56 40"
                          fill="none"
                        >
                          {/* Top fold lines */}
                          <path
                            d="M2 3L28 20L54 3"
                            stroke="rgba(255,255,255,0.7)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Bottom corner accents */}
                          <path
                            d="M2 37L20 20M54 37L36 20"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                    </div>
                  </div>

                  {/* Heading & Subtitle */}
                  <h3 className="text-base sm:text-lg font-bold text-[#101D36]">
                    Waiting for email analysis
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-xs">
                    Upload an email file or paste its headers to begin.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative subtle wavy gradient at bottom matching reference screenshot */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-14">
            <svg
              className="w-full h-full opacity-60"
              viewBox="0 0 500 80"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0,50 C120,75 300,20 500,45 L500,80 L0,80 Z"
                fill="#F0F6FE"
              />
            </svg>
          </div>

        </div>

      </div>

    </div>
  );
}
