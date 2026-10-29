"use client";

import { motion } from "framer-motion";
import { 
  Activity, 
  Zap, 
  WifiOff, 
  User, 
  Settings as SettingsIcon 
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, threatStats, navItems, isOnline }) {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#0B1933] text-white h-full border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-[68px] border-b border-slate-800/80">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1463FF] to-[#0D52DD] flex items-center justify-center shadow-md shadow-[#1463FF]/30 shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M8.5 13l2.5-5 2.5 5" strokeWidth="2" />
            <path d="M9.5 11.5h3" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-base tracking-wide text-white leading-tight">
            AV-SAFE
          </span>
          <span className="text-[10px] text-[#00C2FF] font-bold uppercase tracking-widest leading-none mt-0.5">
            Threat Shield
          </span>
        </div>
      </div>

      {/* Threat Radar Stats Panel */}
      <div className="p-4 mx-4 mt-5 bg-slate-900/60 rounded-2xl border border-slate-800/60">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-3">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#1463FF]" />
            Threat Radar
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/30">
            <span className="block text-sm font-bold text-[#10B981]">{threatStats?.safe ?? 0}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Safe</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/30">
            <span className="block text-sm font-bold text-[#F59E0B]">{threatStats?.suspicious ?? 0}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Warn</span>
          </div>
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/30">
            <span className="block text-sm font-bold text-[#EF4444]">{threatStats?.dangerous ?? 0}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Threat</span>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1463FF] text-white shadow-md shadow-[#1463FF]/30 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <span className={`transition-colors shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Analyst Profile & Connection Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              SA
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white leading-tight truncate">
                SecOps Analyst
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight mt-0.5 truncate">
                Level-2 Access
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            title="Open Settings"
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Defense Active Status Capsule */}
        <div className="flex items-center justify-between bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? "bg-[#10B981]" : "bg-[#F59E0B]"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-[#10B981]" : "bg-[#F59E0B]"}`} />
            </span>
            <span className="text-[10px] font-bold text-slate-200 truncate">
              {isOnline ? "Defense Active" : "Local Mode (Offline)"}
            </span>
          </div>
          {isOnline ? (
            <Zap className="h-3.5 w-3.5 text-[#1463FF] shrink-0" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
          )}
        </div>
      </div>
    </aside>
  );
}
