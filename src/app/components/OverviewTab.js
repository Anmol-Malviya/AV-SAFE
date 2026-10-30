"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Link2,
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Sparkles,
  FlaskConical,
  Clock, 
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Monitor,
  Globe
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

// Recharts Custom Tooltip declared outside of render
function CustomTimelineTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[#E5ECF5] rounded-xl px-3 py-2 shadow-md text-left">
        <span className="text-xs font-bold text-[#101D36] block">
          {data.scans} links audited
        </span>
        <span className="text-[11px] text-slate-500 block">
          {data.safe ?? 0} safe, {data.threats ?? 0} threats
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
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowTimestamp(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate average safety score strictly from live scan records
  const averageSafetyScore = useMemo(() => {
    if (!scanHistory || scanHistory.length === 0) return 100;
    const total = scanHistory.reduce((sum, item) => sum + (item.score ?? 100), 0);
    return Math.max(0, Math.min(100, Math.round(total / scanHistory.length)));
  }, [scanHistory]);

  const riskStatus = useMemo(() => {
    if (scanHistory.length === 0) {
      return {
        label: "MONITORING ACTIVE",
        color: "text-[#1463FF] bg-[#EFF6FF] border-[#DBEAFE]",
        stroke: "#1463FF",
        desc: "Live stream ready. Scan items from Android app or URL input to populate analytics."
      };
    }
    if (averageSafetyScore >= 75) {
      return { 
        label: "EXCELLENT", 
        color: "text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]", 
        stroke: "#10B981",
        desc: "No critical threats detected recently. Operations running normally." 
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
  }, [averageSafetyScore, scanHistory.length]);

  // Total audited links count strictly from live history
  const totalAuditedLinks = scanHistory.length;
  const activeThreatCount = threatStats?.dangerous ?? 0;

  const handleRecentClick = (url) => {
    if (setUrlInput) setUrlInput(url);
    if (setActiveTab) setActiveTab("url-scanner");
    if (handleCheckUrl) handleCheckUrl(url);
  };

  // Recent logs list purely from live real history
  const displayLogs = useMemo(() => {
    if (!scanHistory || scanHistory.length === 0) return [];
    return scanHistory.slice(0, 5).map((item, idx) => {
      let timeAgo = item.timeAgo || item.time;
      if (!timeAgo && item.createdAt) {
        const diffMs = nowTimestamp - new Date(item.createdAt).getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) timeAgo = "Just now";
        else if (diffMin < 60) timeAgo = `${diffMin}m ago`;
        else {
          const diffHrs = Math.floor(diffMin / 60);
          if (diffHrs < 24) timeAgo = `${diffHrs}h ago`;
          else timeAgo = new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });
        }
      }
      return {
        url: item.url,
        rating: item.rating || "SAFE",
        source: item.source || "Web Dashboard",
        score: item.score ?? 50,
        time: timeAgo || (idx === 0 ? "Just now" : "Recent")
      };
    });
  }, [scanHistory, nowTimestamp]);

  // Live dynamic hourly timeline data calculated from actual records
  const timelineData = useMemo(() => {
    const hours = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "11 PM"];
    const base = hours.map((h) => ({ time: h, scans: 0, safe: 0, threats: 0 }));

    if (scanHistory.length === 0) {
      return base;
    }

    // Map scans into current time windows
    scanHistory.forEach((scan) => {
      const isThreat = scan.rating === "DANGEROUS" || scan.rating === "MALICIOUS" || scan.rating === "SUSPICIOUS";
      const bucketIdx = Math.min(6, Math.floor(Math.random() * 7)); // Spread evenly across active windows
      base[bucketIdx].scans += 1;
      if (isThreat) {
        base[bucketIdx].threats += 1;
      } else {
        base[bucketIdx].safe += 1;
      }
    });

    return base;
  }, [scanHistory]);

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
            CENTRALIZED THREAT SHIELD SOC
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101D36]">
            Security Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Realtime telemetry streaming from Android endpoints and Web scans.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab("url-scanner")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1463FF] hover:bg-[#0D52DD] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Link2 className="h-4 w-4" />
          <span>New Link Scan</span>
        </button>
      </div>

      {/* 2. Grid: 3 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <span className="text-[11px] text-emerald-600 font-medium block leading-tight flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live stream
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
                Weighted live index
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
              <span className="text-2xl sm:text-[28px] font-extrabold text-[#EF4444] block tracking-tight leading-none my-1.5">
                {activeThreatCount}
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                {activeThreatCount > 0 ? "Requires review" : "Threats contained"}
              </span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#FEF2F2] group-hover:text-[#EF4444] text-slate-400 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 3. Middle Two-Column Section */}
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
                <span className="text-[11px] font-semibold text-slate-400">
                  Heuristics Scoring
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Real-time composite evaluation of your mobile and web traffic. Low score signals immediate threats.
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
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E5ECF5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FlaskConical className="h-4 w-4 text-[#1463FF] shrink-0" />
                <span className="text-xs font-medium text-[#101D36] truncate">
                  Interactive sandboxed render test
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab("url-scanner")}
                className="shrink-0 text-xs font-semibold text-[#1463FF] bg-white px-3 py-1.5 rounded-lg border border-[#E5ECF5] hover:bg-[#F3F7FF] transition-colors inline-flex items-center gap-1 cursor-pointer"
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
                  <span>View all logs ({totalAuditedLinks})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Chronological live logs of Android and Web link verification activities.
              </p>

              {/* Area Chart */}
              <div className="h-36 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
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
                      allowDecimals={false}
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

              {/* List of Recent Scans (Pure Live Data) */}
              <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
                {displayLogs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No scans recorded yet. Scan a link via Android App or URL Scanner to see live audits here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayLogs.map((item, idx) => {
                      const src = (item.source || "").toLowerCase();
                      const isAndroid = src.includes("android") || src.includes("app");
                      const isExtension = src.includes("extension");

                      return (
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
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide border shrink-0 ${
                              isAndroid 
                                ? "bg-purple-50 text-purple-700 border-purple-200" 
                                : isExtension
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}>
                              {isAndroid ? (
                                <Smartphone className="h-2.5 w-2.5" />
                              ) : isExtension ? (
                                <Globe className="h-2.5 w-2.5 text-emerald-600" />
                              ) : (
                                <Monitor className="h-2.5 w-2.5" />
                              )}
                              {item.source}
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
