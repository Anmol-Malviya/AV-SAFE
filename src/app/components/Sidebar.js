"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Activity, 
  Zap, 
  WifiOff, 
  User, 
  Settings as SettingsIcon,
  ChevronsLeft
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, threatStats, navItems, isOnline }) {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-white text-slate-800 h-full border-r border-slate-200 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-[68px] border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 group" title="AV-SAFE Home">
          <div className="relative h-10 w-auto flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="AV-SAFE Logo"
              width={48}
              height={36}
              className="h-9 w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-heading font-extrabold text-base tracking-wide text-slate-900 leading-tight">
              AV-SAFE
            </span>
            <span className="text-[10px] text-[#1463FF] font-bold uppercase tracking-widest leading-none mt-0.5">
              Threat Shield
            </span>
          </div>
        </Link>

        <button
          type="button"
          title="Sidebar Control"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Threat Radar Stats Panel */}
      <div className="p-4 mx-4 mt-5 bg-[#F8FAFD] rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-3">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#1463FF]" />
            Threat Radar
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="block text-sm font-bold text-[#10B981]">{threatStats?.safe ?? 8}</span>
            <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Safe</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="block text-sm font-bold text-[#F59E0B]">{threatStats?.suspicious ?? 3}</span>
            <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Warn</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="block text-sm font-bold text-[#EF4444]">{threatStats?.dangerous ?? 4}</span>
            <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Threat</span>
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
                  ? "bg-[#1463FF] text-white shadow-md shadow-[#1463FF]/25 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span className={`transition-colors shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Analyst Profile & Connection Status Footer */}
      <div className="p-4 border-t border-slate-100 bg-[#F8FAFD]/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-[#1463FF]/10 border border-[#1463FF]/20 flex items-center justify-center text-xs font-bold text-[#1463FF] shrink-0">
              SA
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-slate-900 leading-tight truncate">
                SecOps Analyst
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">
                Level-2 Access
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            title="Open Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Defense Active Status Capsule */}
        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? "bg-[#10B981]" : "bg-[#F59E0B]"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-[#10B981]" : "bg-[#F59E0B]"}`} />
            </span>
            <span className="text-[10px] font-bold text-slate-700 truncate">
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
