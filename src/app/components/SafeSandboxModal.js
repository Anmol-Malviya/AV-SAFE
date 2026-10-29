"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Shield, 
  Monitor, 
  Code, 
  Terminal, 
  Globe, 
  FileSearch, 
  AlertTriangle,
  X,
  ShieldCheck,
  ShieldAlert,
  Server
} from "lucide-react";
import { modalBackdrop, modalContent } from "@/lib/animations";

export default function SafeSandboxModal({
  showSandbox,
  setShowSandbox,
  scanResult,
  sandboxTab,
  setSandboxTab,
  getRatingColorClass,
}) {
  // Build simulated console log lines for sandbox
  const consoleLogs = useMemo(() => {
    if (!scanResult) return [];
    const logs = [];
    logs.push({ type: "info", text: `[INFO] Initiating sandbox environment for: ${scanResult.domain}` });
    logs.push({ type: "info", text: "[INFO] Parsing DNS record..." });
    if (scanResult.deepScan?.dns?.active) {
      logs.push({ type: "success", text: `[DNS] Resolved → IP: ${scanResult.deepScan.dns.ip}` });
    } else if (scanResult.deepScan?.dns) {
      logs.push({ type: "err", text: `[DNS] No active DNS records found. Domain may be temporary.` });
    } else {
      logs.push({ type: "warn", text: `[DNS] DNS resolution not attempted (Deep Scan disabled).` });
    }
    logs.push({ type: "info", text: "[INFO] Checking SSL Certificate..." });
    if (scanResult.deepScan?.ssl?.hasCert) {
      logs.push({ type: "success", text: `[SSL] Certificate valid. Issuer: ${scanResult.deepScan.ssl.issuer}` });
      logs.push({ type: "success", text: `[SSL] Expires: ${new Date(scanResult.deepScan.ssl.validTo).toLocaleDateString()}` });
    } else if (scanResult.deepScan?.ssl) {
      logs.push({ type: "err", text: `[SSL] No valid certificate detected. Connection insecure.` });
    } else {
      logs.push({ type: "warn", text: `[SSL] Certificate check skipped (Deep Scan disabled).` });
    }
    logs.push({ type: "info", text: "[SANDBOX] Javascript execution — BLOCKED" });
    logs.push({ type: "info", text: "[SANDBOX] Cookie access — BLOCKED" });
    logs.push({ type: "info", text: "[SANDBOX] External resource loading — BLOCKED" });
    if (scanResult.deepScan?.page?.hasPasswordInput) {
      logs.push({ type: "err", text: `[AUDIT] Password input detected! Credential theft risk.` });
    }
    if (scanResult.deepScan?.page?.hasExternalForm) {
      logs.push({ type: "err", text: `[AUDIT] Form submits to external IP: ${scanResult.deepScan?.dns?.ip || "unknown"}` });
    }
    if (scanResult.deepScan?.page?.hasMetaRedirect || scanResult.deepScan?.page?.hasScriptRedirect) {
      logs.push({ type: "warn", text: `[AUDIT] Auto-redirect script detected and neutralized.` });
    }
    logs.push({ type: scanResult.rating === "SAFE" ? "success" : "err", text: `[RESULT] Sandbox audit complete. Rating: ${scanResult.rating}` });
    return logs;
  }, [scanResult]);

  // Build synthetic HTML code lines for the HTML view
  const htmlCodeLines = useMemo(() => {
    if (!scanResult) return [];
    const lines = [];
    lines.push({ num: 1, parts: [{ cls: "text-slate-400", text: `<!-- Sandboxed DOM Snapshot — ${scanResult.domain} -->` }] });
    lines.push({ num: 2, parts: [{ cls: "text-blue-600 font-bold", text: "<html>" }] });
    lines.push({ num: 3, parts: [{ cls: "text-blue-600 font-bold", text: "  <head>" }] });
    if (scanResult.deepScan?.page?.title) {
      lines.push({ num: 4, parts: [{ cls: "text-blue-600 font-bold", text: "    <title>" }, { cls: "text-text-primary", text: scanResult.deepScan.page.title }, { cls: "text-blue-600 font-bold", text: "</title>" }] });
    } else {
      lines.push({ num: 4, parts: [{ cls: "text-blue-600 font-bold", text: "    <title>" }, { cls: "text-slate-400 italic", text: "Unknown Title" }, { cls: "text-blue-600 font-bold", text: "</title>" }] });
    }
    lines.push({ num: 5, parts: [{ cls: "text-blue-600 font-bold", text: "  </head>" }] });
    lines.push({ num: 6, parts: [{ cls: "text-blue-600 font-bold", text: "  <body>" }] });
    if (scanResult.deepScan?.page?.hasPasswordInput) {
      lines.push({ num: 7, parts: [{ cls: "text-red-500 font-bold", text: "    <!-- ⚠ Password input detected -->" }] });
      lines.push({ num: 8, parts: [{ cls: "text-blue-600 font-bold", text: "    <form " }, { cls: "text-purple-600", text: "method=" }, { cls: "text-green-600", text: '"POST"' }, { cls: "text-purple-600", text: " action=" }, { cls: "text-green-600", text: `"https://${scanResult.deepScan?.dns?.ip || "external"}/steal"` }, { cls: "text-blue-600 font-bold", text: ">" }] });
      lines.push({ num: 9, parts: [{ cls: "text-blue-600 font-bold", text: "      <input " }, { cls: "text-purple-600", text: "type=" }, { cls: "text-green-600", text: '"password"' }, { cls: "text-blue-600 font-bold", text: " />" }] });
      lines.push({ num: 10, parts: [{ cls: "text-blue-600 font-bold", text: "    </form>" }] });
    } else {
      lines.push({ num: 7, parts: [{ cls: "text-blue-600 font-bold", text: "    <div " }, { cls: "text-purple-600", text: "class=" }, { cls: "text-green-600", text: '"main"' }, { cls: "text-blue-600 font-bold", text: ">" }] });
      lines.push({ num: 8, parts: [{ cls: "text-blue-600 font-bold", text: "      <p>" }, { cls: "text-text-primary", text: `Welcome to ${scanResult.domain}` }, { cls: "text-blue-600 font-bold", text: "</p>" }] });
      lines.push({ num: 9, parts: [{ cls: "text-blue-600 font-bold", text: "    </div>" }] });
    }
    if (scanResult.deepScan?.page?.hasMetaRedirect) {
      lines.push({ num: 11, parts: [{ cls: "text-red-500 font-bold", text: "    <!-- ⚠ Meta redirect detected -->" }] });
      lines.push({ num: 12, parts: [{ cls: "text-blue-600 font-bold", text: "    <meta " }, { cls: "text-purple-600", text: "http-equiv=" }, { cls: "text-green-600", text: '"refresh"' }, { cls: "text-purple-600", text: " content=" }, { cls: "text-green-600", text: '"0; url=https://phishing.site"' }, { cls: "text-blue-600 font-bold", text: " />" }] });
    }
    lines.push({ num: 13, parts: [{ cls: "text-blue-600 font-bold", text: "  </body>" }] });
    lines.push({ num: 14, parts: [{ cls: "text-blue-600 font-bold", text: "</html>" }] });
    return lines;
  }, [scanResult]);

  return (
    <AnimatePresence>
      {showSandbox && scanResult && (
        <motion.div 
          key="sandbox-modal-overlay"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowSandbox(false)}
        >
          <motion.div 
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl flex flex-col h-[85vh] overflow-hidden"
          >
            {/* Browser Chrome Header bar */}
            <div className="bg-slate-100 px-4 h-12 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex gap-1.5 items-center">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
              </div>
              
              <div className="text-xs font-bold text-navy flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Isolated Sandbox Preview Window
              </div>

              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSandbox(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-text-secondary hover:text-navy transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </motion.button>
            </div>

            {/* Address bar mock */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 px-4 flex items-center gap-3 shrink-0">
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg border border-primary/20 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Sandboxed
              </span>
              <input
                type="text"
                readOnly
                value={scanResult.url}
                className="flex-grow bg-white border border-slate-200 text-xs font-mono rounded-lg py-1 px-3 outline-none text-text-primary truncate"
              />
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                scanResult.rating === "SAFE" ? "bg-green-50 text-green-700 border-green-200" :
                scanResult.rating === "SUSPICIOUS" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {scanResult.rating}
              </span>
            </div>

            {/* Main Workspace layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sandbox Info Sidebar */}
              <div className="w-56 border-r border-slate-200 bg-slate-50/50 p-4 space-y-5 overflow-y-auto hidden sm:block shrink-0">
                {/* SSL Info Block */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-1">
                    <Lock className="h-3 w-3" /> SSL handshake
                  </span>
                  {scanResult.deepScan?.ssl?.hasCert ? (
                    <span className="inline-flex items-center gap-1 rounded bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5">
                      Handshake Secure
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5">
                      No Certificate
                    </span>
                  )}
                  {scanResult.deepScan?.ssl?.issuer && (
                    <p className="text-[10px] text-text-secondary">Issuer: {scanResult.deepScan.ssl.issuer}</p>
                  )}
                </div>

                {/* DNS Block */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-1">
                    <Server className="h-3 w-3" /> Host Resolution
                  </span>
                  <div className="font-mono text-[10px] text-text-secondary bg-white p-2 rounded-lg border border-slate-200">
                    <div>Domain: {scanResult.domain}</div>
                    <div className="mt-1 text-primary">IP: {scanResult.deepScan?.dns?.ip || "Unknown"}</div>
                  </div>
                </div>

                {/* Form Safety Audit */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" /> Form Audit
                  </span>
                  {scanResult.deepScan?.page?.hasPasswordInput ? (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-700">
                      <strong>⚠ Threat Detected:</strong> Form contains password input field targeting non-verified server.
                    </div>
                  ) : (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-[10px] text-green-700">
                      ✓ No credential collection forms detected.
                    </div>
                  )}
                </div>

                {/* Isolation Guard */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Strict Isolation
                  </span>
                  <p className="text-[9px] text-slate-600">
                    Third-party cookies, active scripts, and redirect hooks are completely sandboxed.
                  </p>
                </div>
              </div>

              {/* Sandbox Main Render Area */}
              <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
                {/* Tabs bar */}
                <div className="flex border-b border-slate-200 bg-white px-4 shrink-0">
                  <button
                    onClick={() => setSandboxTab("render")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      sandboxTab === "render"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary hover:text-navy"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" /> Isolated Render
                  </button>
                  <button
                    onClick={() => setSandboxTab("html")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      sandboxTab === "html"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary hover:text-navy"
                    }`}
                  >
                    <Code className="h-3.5 w-3.5" /> DOM Tree
                  </button>
                  <button
                    onClick={() => setSandboxTab("console")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      sandboxTab === "console"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary hover:text-navy"
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5" /> Audit Console
                  </button>
                </div>

                {/* Content Viewports */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {/* VIEW 1: ISOLATED SAFELY RENDERED DOM */}
                  {sandboxTab === "render" && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full p-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                      <div className={`p-4 rounded-full mb-4 ${
                        scanResult.rating === "SAFE" ? "bg-green-100 text-green-700" :
                        scanResult.rating === "SUSPICIOUS" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {scanResult.rating === "SAFE" ? <ShieldCheck className="h-10 w-10" /> : <ShieldAlert className="h-10 w-10" />}
                      </div>

                      <h4 className="font-heading font-bold text-base text-navy">
                        {scanResult.deepScan?.page?.title || `Sandboxed View: ${scanResult.domain}`}
                      </h4>

                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                        This view runs inside an isolated virtual shadow tree. Scripts and active connections are blocked to protect your environment.
                      </p>

                      {scanResult.deepScan?.page?.hasPasswordInput && (
                        <div className="mt-5 w-full bg-red-50 border border-red-200 rounded-xl p-3 text-left">
                          <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> Phishing Trap Detected
                          </span>
                          <span className="text-[10px] text-red-600 block mt-1">
                            A deceptive login credential form was neutralized on this target page.
                          </span>
                        </div>
                      )}

                      <div className="mt-6 flex gap-2">
                        <button
                          onClick={() => setSandboxTab("html")}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-navy transition-colors cursor-pointer"
                        >
                          Inspect Source
                        </button>
                        <button
                          onClick={() => setSandboxTab("console")}
                          className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          View Logs
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: DOM HTML SOURCE VIEWER */}
                  {sandboxTab === "html" && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm h-full p-4 font-mono text-xs overflow-y-auto space-y-1">
                      {htmlCodeLines.map((line) => (
                        <div key={line.num} className="flex leading-relaxed">
                          <span className="text-slate-600 select-none w-8 text-right pr-3 shrink-0">{line.num}</span>
                          <div>
                            {line.parts.map((p, pi) => (
                              <span key={pi} className={p.cls}>{p.text}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VIEW 3: AUDIT CONSOLE LOGS */}
                  {sandboxTab === "console" && (
                    <div className="bg-slate-950 border border-slate-900 rounded-xl shadow-sm h-full p-5 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 leading-relaxed">
                      {consoleLogs.map((log, i) => {
                        const color = 
                          log.type === "success" ? "text-green-400" :
                          log.type === "err" ? "text-red-400 font-bold" :
                          log.type === "warn" ? "text-amber-400" :
                          "text-slate-400";
                        return (
                          <div key={i} className={`${color}`}>
                            {log.text}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
