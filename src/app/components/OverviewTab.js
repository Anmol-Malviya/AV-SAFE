"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Link2,
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Activity, 
  Calendar,
  Sparkles,
  FlaskConical,
  Clock, 
  Mail, 
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  QrCode,
  Scan
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

// Default old searched data preserved from original reference
const DEFAULT_OLD_SEARCHES = [
  { url: "https://example.com", rating: "SAFE", time: "2 min ago" },
  { url: "http://secure-login-update.com", rating: "SUSPICIOUS", time: "12 min ago" },
  { url: "https://github.com", rating: "SAFE", time: "28 min ago" },
  { url: "http://paypal-account-verifiy.net", rating: "MALICIOUS", time: "1 hour ago" }
];

// Timeline area chart points matching original reference
const TIMELINE_DATA = [
  { time: "12 AM", scans: 3, safe: 3, threats: 0 },
  { time: "4 AM", scans: 2, safe: 2, threats: 0 },
  { time: "8 AM", scans: 7, safe: 6, threats: 1 },
  { time: "12 PM", scans: 5, safe: 4, threats: 1 },
  { time: "4 PM", scans: 12, safe: 2, threats: 0 },
  { time: "8 PM", scans: 18, safe: 16, threats: 2 },
  { time: "11 PM", scans: 14, safe: 13, threats: 1 }
];

// Recharts Custom Tooltip declared outside of render
function CustomTimelineTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[#E5ECF5] rounded-xl px-3 py-2 shadow-md text-left">
        <span className="text-xs font-bold text-[#101D36] block">
          {data.scans || 12} links scanned
        </span>
        <span className="text-[11px] text-slate-500 block">
          {data.safe ?? 2} safe, {data.threats ?? 0} threats
        </span>
      </div>
    );
  }
  return null;
}

export default function OverviewTab({ 
  threatStats = { safe: 0, suspicious: 0, dangerous: 0 }, 
  scanHistory = [], 
  setActiveTab, 
  setUrlInput, 
  handleCheckUrl 
}) {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  // Live Date/Time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setNowTimestamp(now.getTime());
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate average safety score from authentic history
  const averageSafetyScore = useMemo(() => {
    if (!scanHistory || scanHistory.length === 0) return 100;
    const total = scanHistory.reduce((sum, item) => sum + (item.score ?? 100), 0);
    return Math.max(0, Math.min(100, Math.round(total / scanHistory.length)));
  }, [scanHistory]);

  const riskStatus = useMemo(() => {
    if (averageSafetyScore >= 75) {
      return { 
        label: "EXCELLENT", 
        color: "text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]", 
        stroke: "#10B981",
        desc: "No critical threats detected recently. Keep running normal operations." 
      };
    }
    if (averageSafetyScore >= 45) {
      return { 
        label: "ATTENTION", 
        color: "text-[#F59E0B] bg-[#FFFBEB] border-[#FDE68A]", 
        stroke: "#F59E0B",
        desc: "Recent scans contain suspicious URL elements. Inspect links before opening." 
      };
    }
    return { 
      label: "CRITICAL RISK", 
      color: "text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]", 
      stroke: "#EF4444",
      desc: "Multiple active phishing threats identified. Alert network administrators immediately." 
    };
  }, [averageSafetyScore]);

  // Total audited links count, preserving the historical base count
  const totalAuditedLinks = (scanHistory && scanHistory.length > 0) ? Math.max(15, scanHistory.length) : 15;
  const activeThreatCount = threatStats?.dangerous ?? 0;

  const handleRecentClick = (url) => {
    if (setUrlInput) setUrlInput(url);
    if (setActiveTab) setActiveTab("url-scanner");
    if (handleCheckUrl) handleCheckUrl(url);
  };

  // Recent logs list from actual history, preserving old searched records
  const displayLogs = useMemo(() => {
    if (scanHistory && scanHistory.length > 0) {
      const userScans = scanHistory.map((item, idx) => {
        let timeAgo = item.timeAgo || item.time;
        if (!timeAgo && item.timestamp) {
          const diffMs = nowTimestamp - new Date(item.timestamp).getTime();
          const diffMin = Math.floor(diffMs / 60000);
          if (diffMin < 1) timeAgo = "Just now";
          else if (diffMin < 60) timeAgo = `${diffMin} min ago`;
          else {
            const diffHrs = Math.floor(diffMin / 60);
            if (diffHrs < 24) timeAgo = `${diffHrs}h ago`;
            else timeAgo = new Date(item.timestamp).toLocaleDateString([], { month: "short", day: "numeric" });
          }
        }
        return {
          url: item.url,
          rating: item.rating || "SAFE",
          time: timeAgo || (idx === 0 ? "2 min ago" : "Recent")
        };
      });

      // Preserve old searched records
      const existingUrls = new Set(userScans.map((u) => (u.url || "").toLowerCase()));
      const preservedOld = DEFAULT_OLD_SEARCHES.filter(
        (o) => !existingUrls.has(o.url.toLowerCase())
      );
      return [...userScans, ...preservedOld].slice(0, 4);
    }
    return DEFAULT_OLD_SEARCHES;
  }, [scanHistory, nowTimestamp]);

  const renderVerdictBadge = (rating) => {
    const norm = (rating || "").toUpperCase();
    if (norm === "DANGEROUS" || norm === "MALICIOUS") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
          Malicious
        </span>
      );
    }
    if (norm === "SUSPICIOUS" || norm === "WARN") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]">
          Suspicious
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
        Safe
      </span>
    );
  };

  const renderIcon = (rating) => {
    const norm = (rating || "").toUpperCase();
    if (norm === "DANGEROUS" || norm === "MALICIOUS") {
      return <ShieldAlert className="h-4 w-4 text-[#EF4444] shrink-0" />;
    }
    if (norm === "SUSPICIOUS" || norm === "WARN") {
      return <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0" />;
    }
    return <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" />;
  };

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - averageSafetyScore / 100);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400 block mb-1">
            SECURITY OPERATIONS CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101D36]">
            Security Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor scan activity and review potential security threats.
          </p>
        </div>

        {/* Date & Time Widget */}
        <div className="flex items-center gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-[#E5ECF5] shadow-xs self-start sm:self-auto shrink-0">
          <div className="p-2 bg-[#F3F7FF] text-[#1463FF] rounded-lg">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="text-right flex flex-col justify-center">
            <span className="text-xs font-bold text-[#101D36] leading-tight">
              {currentDate || "Thu, 23 Oct 2026"}
            </span>
            <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
              {currentTime || "11:37 PM"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Audited Links */}
        <div 
          onClick={() => setActiveTab && setActiveTab("history")}
          className="group bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex items-center justify-between gap-4 hover:border-[#1463FF]/40 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-[#EFF6FF] text-[#1463FF] rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                TOTAL AUDITED LINKS
              </span>
              <span className="text-2xl sm:text-[28px] font-extrabold text-[#101D36] block tracking-tight leading-none my-1.5">
                {totalAuditedLinks}
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Updated live
              </span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#EFF6FF] group-hover:text-[#1463FF] text-slate-400 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Card 2: AI Safety Score */}
        <div 
          onClick={() => setActiveTab && setActiveTab("analytics")}
          className="group bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex items-center justify-between gap-4 hover:border-[#10B981]/40 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-[#ECFDF5] text-[#10B981] rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                AI SAFETY SCORE
              </span>
              <span className="text-2xl sm:text-[28px] font-extrabold text-[#101D36] block tracking-tight leading-none my-1.5">
                {averageSafetyScore}%
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Average confidence
              </span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#ECFDF5] group-hover:text-[#10B981] text-slate-400 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Card 3: Active Threat Alert */}
        <div 
          onClick={() => setActiveTab && setActiveTab("complaints")}
          className="group bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex items-center justify-between gap-4 hover:border-[#EF4444]/40 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-[#FEF2F2] text-[#EF4444] rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                ACTIVE THREAT ALERT
              </span>
              <span className="text-2xl sm:text-[28px] font-extrabold text-[#101D36] block tracking-tight leading-none my-1.5">
                {activeThreatCount}
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                {activeThreatCount > 0 ? "Requires review" : "No active threats"}
              </span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#FEF2F2] group-hover:text-[#EF4444] text-slate-400 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Card 4: Scan Engine Health */}
        <div 
          onClick={() => setActiveTab && setActiveTab("url-scanner")}
          className="group bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex items-center justify-between gap-4 hover:border-[#00C2FF]/40 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-[#ECFEFF] text-[#00C2FF] rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                SCAN ENGINE HEALTH
              </span>
              <span className="text-2xl sm:text-[28px] font-extrabold text-[#101D36] block tracking-tight leading-none my-1.5">
                Optimal
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                180ms latency
              </span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#ECFEFF] group-hover:text-[#00C2FF] text-slate-400 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: AI Threat Risk Meter (5 cols) + Scanned Threat Timeline (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side (5 cols): AI Threat Risk Meter */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white p-6 rounded-2xl border border-[#E5ECF5] shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-[#1463FF]" />
                  <h2 className="text-base font-bold text-[#101D36]">AI Threat Risk Meter</h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-[#E5ECF5] px-2.5 py-1 rounded-lg">
                  Heuristics Scoring
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Composite evaluation of your scanned items. Low scores mean dangerous elements have been checked.
              </p>
            </div>

            {/* Circular Gauge and Status Callout */}
            <div className="my-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6 sm:gap-7">
              {/* Circular Gauge Ring */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-38 h-38 transform -rotate-90">
                  <circle
                    cx="76"
                    cy="76"
                    r={radius}
                    stroke="#F1F5F9"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="76"
                    cy="76"
                    r={radius}
                    stroke={riskStatus.stroke}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#101D36] tracking-tight leading-none">
                    {averageSafetyScore}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    SAFETY INDEX
                  </span>
                </div>
              </div>

              {/* Status Box */}
              <div className={`p-4 rounded-2xl border flex-1 min-w-0 ${riskStatus.color}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="h-4.5 w-4.5 shrink-0" />
                  <span className="text-xs font-extrabold tracking-wide uppercase">
                    {riskStatus.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {riskStatus.desc}
                </p>
              </div>
            </div>

            {/* Bottom Action Banner */}
            <div className="bg-[#F8FAFC] border border-[#E5ECF5] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EFF6FF] text-[#1463FF] rounded-lg shrink-0">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#101D36] block leading-tight">
                    Interactive sandboxed render test
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">
                    Open a safe environment to analyze suspicious content.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab("url-scanner")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1463FF] hover:bg-[#0D52DD] active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                <span>Launch Scanner</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side (7 cols): Scanned Threat Timeline */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white p-6 rounded-2xl border border-[#E5ECF5] shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-[#1463FF]" />
                  <h2 className="text-base font-bold text-[#101D36]">Scanned Threat Timeline</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab("history")}
                  className="text-xs font-semibold text-[#1463FF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View all logs</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Chronological logs of recent link verification activities.
              </p>

              {/* Area Chart */}
              <div className="h-36 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={TIMELINE_DATA}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="origTimelineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1463FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#1463FF" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#94A3B8", fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#94A3B8", fontSize: 10 }}
                      domain={[0, 30]}
                      ticks={[0, 10, 20, 30]}
                    />
                    <Tooltip content={<CustomTimelineTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      stroke="#1463FF"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#origTimelineGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* List of Recent Scans, preserving old searched records */}
              <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
                <div className="space-y-2">
                  {displayLogs.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleRecentClick(item.url)}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer border border-transparent hover:border-[#E5ECF5]"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        {renderIcon(item.rating)}
                        <span className="text-xs font-medium text-[#101D36] group-hover:text-[#1463FF] transition-colors truncate font-mono">
                          {item.url}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {renderVerdictBadge(item.rating)}
                        <span className="text-[11px] text-slate-400 font-normal w-16 text-right">
                          {item.time}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#101D36] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Quick Actions */}
      <div className="bg-gradient-to-r from-[#F0F5FF]/70 via-white to-[#F0F5FF]/50 p-5 sm:p-6 rounded-2xl border border-[#E5ECF5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#EFF6FF] text-[#1463FF] rounded-xl shrink-0 border border-[#DBEAFE]">
            <Scan className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#101D36] block leading-tight">
              Ready to check for threats?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">
              Scan a URL, email or QR code to detect potential risks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab("url-scanner")}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1463FF] hover:bg-[#0D52DD] active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Link2 className="h-4 w-4" />
            <span>Scan URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab("email-scanner")}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 active:scale-98 text-[#101D36] border border-[#E5ECF5] text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Mail className="h-4 w-4 text-slate-500" />
            <span>Scan Email</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab("qr-scanner")}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 active:scale-98 text-[#101D36] border border-[#E5ECF5] text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <QrCode className="h-4 w-4 text-slate-500" />
            <span>Scan QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
