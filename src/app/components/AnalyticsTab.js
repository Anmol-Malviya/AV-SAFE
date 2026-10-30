"use client";

import { useMemo } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  RadialBarChart, 
  RadialBar 
} from "recharts";
import { ShieldCheck, BarChart3, TrendingUp, Smartphone, Monitor, Globe, ShieldAlert } from "lucide-react";

export default function AnalyticsTab({ scanHistory = [] }) {
  // Chart Colors based on brand guidelines
  const COLORS = {
    primary: "#2563EB",     // Royal Blue
    navy: "#0B1F3A",        // Deep Navy
    accent: "#06B6D4",      // Cyan
    purple: "#8B5CF6",      // App Purple
    safe: "#16A34A",        // Safe (Green)
    warning: "#D97706",     // Warning (Orange)
    danger: "#DC2626",      // Danger (Red)
    neutral: "#64748B",     // Muted text gray
    lightBg: "#F8FAFC"
  };

  // Device Source Analytics (Dynamic calculation from real unified history)
  const sourceStats = useMemo(() => {
    let appCount = 0;
    let webCount = 0;
    let appThreats = 0;
    let webThreats = 0;

    scanHistory.forEach((item) => {
      const isApp = (item.source || "").toLowerCase().includes("android") || (item.source || "").toLowerCase().includes("app");
      const isThreat = item.rating === "DANGEROUS" || item.rating === "MALICIOUS" || item.rating === "SUSPICIOUS";

      if (isApp) {
        appCount++;
        if (isThreat) appThreats++;
      } else {
        webCount++;
        if (isThreat) webThreats++;
      }
    });

    const total = scanHistory.length || 1;
    return {
      appCount,
      webCount,
      appThreats,
      webThreats,
      appPercent: Math.round((appCount / total) * 100),
      webPercent: Math.round((webCount / total) * 100),
      data: [
        { name: "Android App", count: appCount, threats: appThreats, color: COLORS.purple },
        { name: "Web Dashboard", count: webCount, threats: webThreats, color: COLORS.primary }
      ]
    };
  }, [scanHistory]);

  // Mock static data for Trends (7 Days)
  const trendsData = [
    { day: "Mon", Scans: 120, Threats: 8, Mobile: 45, Web: 75 },
    { day: "Tue", Scans: 150, Threats: 12, Mobile: 60, Web: 90 },
    { day: "Wed", Scans: 180, Threats: 15, Mobile: 85, Web: 95 },
    { day: "Thu", Scans: 140, Threats: 9, Mobile: 55, Web: 85 },
    { day: "Fri", Scans: 210, Threats: 25, Mobile: 98, Web: 112 },
    { day: "Sat", Scans: 90, Threats: 4, Mobile: 52, Web: 38 },
    { day: "Sun", Scans: 110, Threats: 6, Mobile: 68, Web: 42 }
  ];

  // Threat Categories
  const categoryData = [
    { name: "Brand Spoofing", value: 45, color: COLORS.danger },
    { name: "Typosquatting", value: 30, color: COLORS.warning },
    { name: "Insecure (HTTP)", value: 15, color: COLORS.primary },
    { name: "IDN Homographs", value: 10, color: COLORS.accent }
  ];

  // Country Distribution
  const countryData = [
    { country: "United States", count: 850, percentage: 42 },
    { country: "Russia", count: 480, percentage: 24 },
    { country: "China", count: 320, percentage: 16 },
    { country: "Germany", count: 200, percentage: 10 },
    { country: "Netherlands", count: 150, percentage: 8 }
  ];

  // Targeted Brands
  const brandData = [
    { name: "PayPal", value: 240 },
    { name: "Chase Bank", value: 180 },
    { name: "Microsoft", value: 150 },
    { name: "Google", value: 120 },
    { name: "MetaMask", value: 90 }
  ];

  // AI Confidence radial chart
  const radialData = [
    { name: "Precision", value: 99.4, fill: COLORS.safe },
    { name: "Recall", value: 98.7, fill: COLORS.primary },
    { name: "F1 Score", value: 99.1, fill: COLORS.accent }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Centralized Threat Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">Cross-platform telemetry fusing mobile app interceptions & web intelligence.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-navy bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <BarChart3 className="h-4 w-4 text-primary" />
          Cross-Platform Sync: Live
        </div>
      </div>

      {/* Row 0: Centralized Telemetry Hub (Mobile App vs Web Scans) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Synced Scans</span>
            <h3 className="text-2xl font-black text-navy">{scanHistory.length}</h3>
            <p className="text-[11px] text-slate-400">Aggregated across all endpoints</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Globe className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Android App Scans</span>
            <h3 className="text-2xl font-black text-purple-900">{sourceStats.appCount}</h3>
            <p className="text-[11px] text-purple-600 font-medium">{sourceStats.appPercent}% of ecosystem volume</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Smartphone className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Web Dashboard Scans</span>
            <h3 className="text-2xl font-black text-blue-900">{sourceStats.webCount}</h3>
            <p className="text-[11px] text-blue-600 font-medium">{sourceStats.webPercent}% of ecosystem volume</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Monitor className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Row 1: Weekly Scan Trends & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Scan Trends (Area Chart) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-sm text-navy">Platform Scans & Threat Timeline</h3>
              <p className="text-xs text-text-secondary mt-0.5">Mobile app vs Web audits with detected threat spikes</p>
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +15.4% scans
            </span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke={COLORS.neutral} fontSize={10} tickLine={false} />
                <YAxis stroke={COLORS.neutral} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px", border: "1px solid #E5E7EB" }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                <Area type="monotone" dataKey="Mobile" stroke={COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#colorMobile)" name="📱 Android Mobile App" />
                <Area type="monotone" dataKey="Web" stroke={COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorWeb)" name="💻 Web Dashboard" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Ecosystem Share (Pie Chart) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-navy">Centralized Source Split</h3>
            <p className="text-xs text-text-secondary mt-0.5">Telemetry origin by client platform</p>
          </div>
          
          <div className="h-[200px] w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceStats.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {sourceStats.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600"></span>
                <span className="text-slate-600 font-medium">Android App</span>
              </div>
              <span className="font-bold text-navy">{sourceStats.appCount} ({sourceStats.appPercent}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 font-medium">Web Dashboard</span>
              </div>
              <span className="font-bold text-navy">{sourceStats.webCount} ({sourceStats.webPercent}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Attack Sources & Targeted Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Country distribution (Horizontal Bar Chart) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-heading font-bold text-sm text-navy">Geographical Threat Vectors</h3>
            <p className="text-xs text-text-secondary mt-0.5">Primary host server networks originating threats</p>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke={COLORS.neutral} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="country" type="category" stroke={COLORS.neutral} fontSize={10} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px" }} />
                <Bar dataKey="count" fill={COLORS.accent} radius={[0, 4, 4, 0]} barSize={10} name="Total URLs Hosted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Targeted Brands (Vertical Bar Chart) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="font-heading font-bold text-sm text-navy">Most Targeted Brands</h3>
            <p className="text-xs text-text-secondary mt-0.5">Corporate identities spoofed in phishing payloads</p>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke={COLORS.neutral} fontSize={10} tickLine={false} />
                <YAxis stroke={COLORS.neutral} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px" }} />
                <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={20} name="Intercepted Spoofs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Accuracy metrics & AI precision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Radial Accuracy Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-navy">AI Classifier Accuracy</h3>
              <p className="text-xs text-text-secondary mt-0.5">Model evaluations against Kaggle phishing validation sets.</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600"></span>
                <span className="text-text-secondary">Precision: 99.4%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span className="text-text-secondary">Recall Ratio: 98.7%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
                <span className="text-text-secondary">F1 Harmonic: 99.1%</span>
              </div>
            </div>
          </div>

          <div className="h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={8} data={radialData}>
                <RadialBar
                  minAngle={15}
                  label={{ position: "insideStart", fill: "#fff" }}
                  background
                  clockWise
                  dataKey="value"
                />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="font-heading font-bold text-sm text-navy">Threat Vector Categories</h3>
            <p className="text-xs text-text-secondary mt-0.5">Distribution breakdown across reported & audited items</p>
          </div>
          <div className="space-y-2">
            {categoryData.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-text-secondary font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-navy">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
