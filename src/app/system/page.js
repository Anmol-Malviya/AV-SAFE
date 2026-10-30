"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeURL, analyzeEmailHeaders } from "../../lib/phishingEngine";
import {
  LayoutDashboard,
  Globe,
  Mail,
  BarChart3,
  QrCode,
  History,
  GraduationCap,
  Settings,
  ShieldAlert
} from "lucide-react";

// Import modular components
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import OverviewTab from "../components/OverviewTab";
import UrlCheckerTab from "../components/UrlCheckerTab";
import EmailAnalyzerTab from "../components/EmailAnalyzerTab";
import AnalyticsTab from "../components/AnalyticsTab";
import QrScannerTab from "../components/QrScannerTab";
import HistoryTab from "../components/HistoryTab";
import SecurityGuideTab from "../components/SecurityGuideTab";
import SettingsTab from "../components/SettingsTab";
import ComplaintsTab from "../components/ComplaintsTab";
import SafeSandboxModal from "../components/SafeSandboxModal";

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [urlInput, setUrlInput] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("ALL");

  // Deep Scan states
  const [isDeepScan, setIsDeepScan] = useState(false);
  const [deepScanLoading, setDeepScanLoading] = useState(false);

  // Sandbox state
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxTab, setSandboxTab] = useState("render");

  // Email Analyzer state
  const [emailHeadersInput, setEmailHeadersInput] = useState("");
  const [emailScanResult, setEmailScanResult] = useState(null);
  const [emailScanLoading, setEmailScanLoading] = useState(false);

  // Threat navigation items - Consolidated & Cleaned
  const navItems = useMemo(
    () => [
      { id: "overview", icon: <LayoutDashboard size={18} />, label: "Overview" },
      { id: "url-scanner", icon: <Globe size={18} />, label: "Scanner & QR" },
      { id: "email-scanner", icon: <Mail size={18} />, label: "Email Scanner" },
      { id: "analytics", icon: <BarChart3 size={18} />, label: "Analytics" },
      { id: "history", icon: <History size={18} />, label: "Live Logs" },
      { id: "complaints", icon: <ShieldAlert size={18} />, label: "Threat Reports" },
      { id: "settings", icon: <Settings size={18} />, label: "Settings" }
    ],
    []
  );

  // Compute threat stats from pure live history
  const threatStats = useMemo(() => {
    const safe = scanHistory.filter((h) => h.rating === "SAFE").length;
    const suspicious = scanHistory.filter((h) => h.rating === "SUSPICIOUS").length;
    const dangerous = scanHistory.filter((h) => h.rating === "DANGEROUS" || h.rating === "MALICIOUS").length;
    return { safe, suspicious, dangerous };
  }, [scanHistory]);

  // Pure live data fetcher with real-time polling
  const fetchLiveHistory = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const res = await fetch("/api/history", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setScanHistory(data);
            localStorage.setItem("phishguard_live_history", JSON.stringify(data));
            return;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load live history from database:", e);
    }

    // Offline local storage fallback
    const saved = localStorage.getItem("phishguard_live_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setScanHistory(parsed);
        }
      } catch {
        // ignore fallback errors
      }
    }
  }, []);

  // Check online/offline status & trigger real-time polling every 4 seconds
  useEffect(() => {
    let isCancelled = false;

    const syncLiveHistory = async () => {
      try {
        if (typeof window !== "undefined" && navigator.onLine) {
          const res = await fetch("/api/history", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && !isCancelled) {
              setScanHistory(data);
              localStorage.setItem("phishguard_live_history", JSON.stringify(data));
              return;
            }
          }
        }
      } catch (e) {
        console.error("Failed to load live history from database:", e);
      }

      if (typeof window !== "undefined" && !isCancelled) {
        const saved = localStorage.getItem("phishguard_live_history");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && !isCancelled) {
              setScanHistory(parsed);
            }
          } catch {
            // ignore fallback errors
          }
        }
      }
    };

    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (!isCancelled) setIsOnline(navigator.onLine);
      }, 0);

      const handleOnline = () => {
        setIsOnline(true);
        syncLiveHistory();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Initial async load
      syncLiveHistory();

      // Live realtime sync: poll every 4 seconds for fresh scans from Mobile App
      const liveInterval = setInterval(() => {
        syncLiveHistory();
      }, 4000);

      return () => {
        isCancelled = true;
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        clearInterval(liveInterval);
      };
    }
  }, []);

  // Web Audio Success Beep
  const playSuccessBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable
    }
  };

  const getRatingColorClass = (rating) => {
    switch (rating) {
      case "SAFE":
        return "text-green-800 bg-green-100 border-green-200";
      case "SUSPICIOUS":
        return "text-amber-800 bg-amber-100 border-amber-200";
      case "DANGEROUS":
      case "MALICIOUS":
        return "text-red-800 bg-red-100 border-red-200";
      default:
        return "text-slate-800 bg-slate-100 border-slate-200";
    }
  };

  const handleCheckUrl = async (urlToCheck) => {
    const targetUrl = urlToCheck || urlInput;
    if (!targetUrl.trim()) return;

    const baseResult = analyzeURL(targetUrl);
    let finalResult = { ...baseResult };

    if (isDeepScan && isOnline) {
      setDeepScanLoading(true);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (response.ok) {
          const deepData = await response.json();
          finalResult.deepScan = deepData;

          let finalRiskScore = finalResult.riskScore;

          if (deepData.dns && !deepData.dns.active) {
            finalResult.warnings.push({
              id: "dns_inactive",
              title: "Inactive Domain / No DNS",
              desc: "This domain has no active DNS records. Phishing campaigns often deploy links using temporary domains that are taken offline quickly.",
              severity: "high",
              value: 40,
            });
            finalRiskScore += 40;
          }

          if (deepData.ssl) {
            if (!deepData.ssl.hasCert) {
              finalResult.warnings.push({
                id: "ssl_missing_cert",
                title: "Missing SSL Certificate",
                desc: "Could not retrieve a valid SSL certificate for HTTPS. The connection is insecure.",
                severity: "high",
                value: 30,
              });
              finalRiskScore += 30;
            } else {
              if (deepData.ssl.isExpired) {
                finalResult.warnings.push({
                  id: "ssl_expired",
                  title: "Expired SSL Certificate",
                  desc: `The SSL certificate for this domain expired on ${new Date(
                    deepData.ssl.validTo
                  ).toLocaleDateString()}.`,
                  severity: "medium",
                  value: 20,
                });
                finalRiskScore += 20;
              }
              if (deepData.ssl.isSelfSigned) {
                finalResult.warnings.push({
                  id: "ssl_self_signed",
                  title: "Self-Signed Certificate",
                  desc: "The website uses a self-signed certificate which is not trusted by web browsers.",
                  severity: "medium",
                  value: 25,
                });
                finalRiskScore += 25;
              }
            }
          }

          if (deepData.page && deepData.page.success) {
            if (deepData.page.hasPasswordInput) {
              finalResult.warnings.push({
                id: "page_password_field",
                title: "Login Form on Insecure/Suspicious Page",
                desc: "We detected password input fields on this page. Entering credentials here could expose them to hackers.",
                severity: "high",
                value: 35,
              });
              finalRiskScore += 35;
            }
            if (deepData.page.hasExternalForm) {
              finalResult.warnings.push({
                id: "page_external_submit",
                title: "External Form Submission Target",
                desc: "Data entered in forms on this website will be sent to a different domain. This is a common sign of credential harvesting.",
                severity: "high",
                value: 40,
              });
              finalRiskScore += 40;
            }
            if (deepData.page.hasMetaRedirect || deepData.page.hasScriptRedirect) {
              finalResult.warnings.push({
                id: "page_redirects",
                title: "Automatic Script Redirects",
                desc: "The page contains code that automatically redirects visitors. Phishers use this to evade security scrapers.",
                severity: "medium",
                value: 15,
              });
              finalRiskScore += 15;
            }
          }

          finalRiskScore = Math.min(100, Math.max(0, finalRiskScore));
          finalResult.riskScore = finalRiskScore;
          finalResult.score = 100 - finalRiskScore;

          if (finalRiskScore >= 70) {
            finalResult.rating = "DANGEROUS";
          } else if (finalRiskScore >= 35) {
            finalResult.rating = "SUSPICIOUS";
          } else {
            finalResult.rating = "SAFE";
          }
        }
      } catch (err) {
        console.error("Deep Scan Request failed:", err);
      } finally {
        setDeepScanLoading(false);
      }
    }

    setScanResult(finalResult);

    const newHistoryItem = {
      url: finalResult.url,
      rating: finalResult.rating,
      score: finalResult.score,
      source: "Web Dashboard",
      detectionReasons: finalResult.warnings || [],
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString()
    };

    if (isOnline) {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHistoryItem),
      })
        .then(() => fetchLiveHistory())
        .catch((e) => console.error("Failed to save to database:", e));
    }

    setScanHistory((prevHistory) => {
      const base = Array.isArray(prevHistory) ? prevHistory : [];
      const filtered = base.filter(
        (item) => (item.url || "").toLowerCase() !== finalResult.url.toLowerCase()
      );
      const updated = [newHistoryItem, ...filtered].slice(0, 50);
      localStorage.setItem("phishguard_live_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCheckEmailHeaders = (customHeaders) => {
    const textToAnalyze = typeof customHeaders === "string" ? customHeaders : emailHeadersInput;
    if (!textToAnalyze || !textToAnalyze.trim()) return;
    if (typeof customHeaders === "string") {
      setEmailHeadersInput(customHeaders);
    }
    setEmailScanLoading(true);
    setTimeout(() => {
      const result = analyzeEmailHeaders(textToAnalyze);
      setEmailScanResult(result);
      setEmailScanLoading(false);
    }, 700);
  };

  const handleQrScanSuccess = (decodedUrl) => {
    playSuccessBeep();
    setUrlInput(decodedUrl);
    setActiveTab("url-scanner");
    handleCheckUrl(decodedUrl);
  };

  const handleClearInput = () => {
    setUrlInput("");
    setScanResult(null);
  };

  const handleClearEmailInput = () => {
    setEmailHeadersInput("");
    setEmailScanResult(null);
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to purge all centralized live diagnostic history?")) {
      setScanHistory([]);
      localStorage.removeItem("phishguard_live_history");
      if (isOnline) {
        try {
          await fetch("/api/history", { method: "DELETE" });
        } catch (e) {
          console.error("Failed to purge logs from database:", e);
        }
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#101D36] font-sans antialiased overflow-hidden selection:bg-[#1463FF]/15 selection:text-[#1463FF]">

      {/* Desktop/Tablet Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        threatStats={threatStats}
      />

      {/* Main Container */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">

        {/* Top Header Bar */}
        <Header
          threatStats={threatStats}
          isOnline={isOnline}
          setActiveTab={setActiveTab}
          scanHistory={scanHistory}
        />

        {/* Dynamic Content Pane with Smooth Fade Transitions */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
          {activeTab === "overview" && (
            <OverviewTab
              threatStats={threatStats}
              scanHistory={scanHistory}
              setActiveTab={setActiveTab}
              setUrlInput={setUrlInput}
              handleCheckUrl={handleCheckUrl}
            />
          )}

          {activeTab === "url-scanner" && (
            <UrlCheckerTab
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              isDeepScan={isDeepScan}
              setIsDeepScan={setIsDeepScan}
              deepScanLoading={deepScanLoading}
              isOnline={isOnline}
              handleCheckUrl={handleCheckUrl}
              handleClearInput={handleClearInput}
              scanResult={scanResult}
              getRatingColorClass={getRatingColorClass}
              setShowSandbox={setShowSandbox}
              setSandboxTab={setSandboxTab}
              handleQrScanSuccess={handleQrScanSuccess}
            />
          )}

          {activeTab === "email-scanner" && (
            <EmailAnalyzerTab
              emailHeadersInput={emailHeadersInput}
              setEmailHeadersInput={setEmailHeadersInput}
              emailScanResult={emailScanResult}
              setEmailScanResult={setEmailScanResult}
              emailScanLoading={emailScanLoading}
              handleCheckEmailHeaders={handleCheckEmailHeaders}
              handleClearEmailInput={handleClearEmailInput}
              getRatingColorClass={getRatingColorClass}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab scanHistory={scanHistory} />
          )}

          {activeTab === "qr-scanner" && (
            <QrScannerTab handleQrScanSuccess={handleQrScanSuccess} />
          )}

          {activeTab === "complaints" && (
            <ComplaintsTab isOnline={isOnline} />
          )}

          {activeTab === "history" && (
            <HistoryTab
              scanHistory={scanHistory}
              historyFilter={historyFilter}
              setHistoryFilter={setHistoryFilter}
              handleClearHistory={handleClearHistory}
              setUrlInput={setUrlInput}
              handleCheckUrl={handleCheckUrl}
              setActiveTab={setActiveTab}
              getRatingColorClass={getRatingColorClass}
            />
          )}

          {activeTab === "guide" && (
            <SecurityGuideTab />
          )}

          {activeTab === "settings" && (
            <SettingsTab />
          )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
      />

      {/* Safe Sandbox DOM Renderer Modal */}
      <SafeSandboxModal
        showSandbox={showSandbox}
        setShowSandbox={setShowSandbox}
        scanResult={scanResult}
        sandboxTab={sandboxTab}
        setSandboxTab={setSandboxTab}
        getRatingColorClass={getRatingColorClass}
      />
    </div>
  );
}
