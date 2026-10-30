"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ChevronDown, CheckCircle2, User, Camera } from "lucide-react";

export default function TestimonialsSection() {
  const [activeFounder, setActiveFounder] = useState(null);

  const founders = {
    hritik: {
      id: "hritik",
      name: "Hritik Jaishwal",
      initials: "HJ",
      role: "Lead Security Researcher & ML Architect",
      work: "Phishing Detection Engine & Heuristics Core",
      tag: "Security Lead",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      avatarUrl: "", // placeholder mode
      glowColor: "from-[#1463FF] to-sky-400",
      accentBg: "bg-gradient-to-br from-blue-600/20 via-sky-500/10 to-slate-900",
      accentIconColor: "text-blue-400",
      description: "Architected the 24-feature zero-latency URL scanner, Shannon entropy matrix, and heuristic defense against IDN homograph attacks.",
      skills: ["ML Phishing Engine", "Heuristic Rules", "Threat Modeling", "PhiUSIIL Benchmark"]
    },
    tanay: {
      id: "tanay",
      name: "Tanay Agrawal",
      initials: "TA",
      role: "Full-Stack & Systems Engineer",
      work: "Platform Architecture & Realtime Protection",
      tag: "Platform Core",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      avatarUrl: "", // placeholder mode
      glowColor: "from-indigo-500 to-purple-500",
      accentBg: "bg-gradient-to-br from-indigo-600/20 via-purple-500/10 to-slate-900",
      accentIconColor: "text-indigo-400",
      description: "Built the scalable Next.js & Android client infrastructure, telemetry-free on-device execution sandbox, and threat dashboard visualization.",
      skills: ["Web & Android Core", "Real-Time Sandbox", "API Pipeline", "System Performance"]
    },
    anmol: {
      id: "anmol",
      name: "Anmol Malviya",
      initials: "AM",
      role: "AI & Threat Intelligence Engineer",
      work: "RAG Pipeline & Continuous Model Retraining",
      tag: "AI & Intelligence",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      avatarUrl: "", // placeholder mode
      glowColor: "from-emerald-500 to-teal-400",
      accentBg: "bg-gradient-to-br from-emerald-600/20 via-teal-500/10 to-slate-900",
      accentIconColor: "text-emerald-400",
      description: "Spearheaded threat intelligence vector embedding pipelines, automated phishing telemetry classification, and feedback loop retraining.",
      skills: ["Threat Intelligence RAG", "Qdrant Vector DB", "Model Retraining", "Security Analytics"]
    }
  };

  return (
    <section id="team" className="relative py-20 lg:py-28 overflow-hidden bg-white/70 border-t border-[#E5ECF5]">
      {/* Background Subtle Fluid Wave */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/wave-bg-3.jpg')" }}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Centered */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E5ECF5] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-4 shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#1463FF]" />
            MEET THE BUILDERS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101D36]">
            Architected by Security & AI Pioneers
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#64748B] leading-relaxed">
            The minds engineering AV-SAFE&apos;s zero-latency threat engine, real-time client protections, and decentralized phishing defense network.
          </p>
        </motion.div>

        {/* MAIN SHOWCASE CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-6 sm:p-10 lg:p-14 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl relative"
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* ============================================================== */}
          {/* DESKTOP/TABLET HUD CALLOUT LAYOUT (Left & Right Leader Lines) */}
          {/* ============================================================== */}
          <div className="hidden lg:grid lg:grid-cols-12 items-center gap-4 py-8 relative">
            
            {/* 1. LEFT CALLOUT: HRITIK JAISHWAL */}
            <div 
              className="col-span-3 flex flex-col items-end text-right relative z-30"
              onMouseEnter={() => setActiveFounder("hritik")}
              onMouseLeave={() => setActiveFounder(null)}
            >
              <div 
                onClick={() => setActiveFounder(activeFounder === "hritik" ? null : "hritik")}
                className={`cursor-pointer group p-3.5 rounded-2xl border transition-all backdrop-blur-md select-none w-full max-w-[240px] ${
                  activeFounder === "hritik"
                    ? "bg-white shadow-xl border-blue-500/50 ring-2 ring-blue-500/20 translate-x-1"
                    : "bg-white/90 hover:bg-white border-slate-200/90 shadow-xs hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-end gap-1.5 mb-1">
                  <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${founders.hritik.badgeColor}`}>
                    {founders.hritik.tag}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#1463FF] transition-colors">
                  {founders.hritik.name}
                </h3>
                <p className="text-[11px] font-semibold text-[#1463FF] mt-0.5 truncate">
                  {founders.hritik.work}
                </p>
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-end gap-1 text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Hover for details</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeFounder === "hritik" ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expandable Details Card (Positioned Below Left Callout) */}
              <AnimatePresence>
                {activeFounder === "hritik" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-3 right-0 w-80 p-5 rounded-2xl bg-white/98 backdrop-blur-2xl border border-blue-200 shadow-2xl text-left z-50"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div>
                        <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Designation</div>
                        <div className="text-xs font-bold text-slate-900">{founders.hritik.role}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Lead</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {founders.hritik.description}
                    </p>
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Key Deliverables</div>
                      {founders.hritik.skills.map((skill, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-[11px] text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. CENTER TRI-HEXAGON FORMATION WITH SVG POINTER LINES */}
            <div className="col-span-6 flex flex-col items-center justify-center relative">
              
              {/* Dynamic SVG Pointer Lines connecting left & right callouts to hexagons */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                viewBox="0 0 500 320" 
                fill="none" 
                preserveAspectRatio="none"
              >
                {/* Left Line: from Left Callout (-20, 90) -> Left Hexagon (135, 90) */}
                <path 
                  d="M -10 100 L 90 100" 
                  stroke={activeFounder === "hritik" ? "#1463FF" : "#CBD5E1"} 
                  strokeWidth={activeFounder === "hritik" ? "2.5" : "1.5"} 
                  strokeDasharray={activeFounder === "hritik" ? "none" : "4 4"}
                  className="transition-colors duration-300"
                />
                <circle cx="-10" cy="100" r="4" fill={activeFounder === "hritik" ? "#1463FF" : "#CBD5E1"} />
                <circle cx="90" cy="100" r="4" fill={activeFounder === "hritik" ? "#1463FF" : "#CBD5E1"} />

                {/* Right Line: from Right Hexagon (410, 100) -> Right Callout (510, 100) */}
                <path 
                  d="M 410 100 L 510 100" 
                  stroke={activeFounder === "anmol" ? "#10B981" : "#CBD5E1"} 
                  strokeWidth={activeFounder === "anmol" ? "2.5" : "1.5"} 
                  strokeDasharray={activeFounder === "anmol" ? "none" : "4 4"}
                  className="transition-colors duration-300"
                />
                <circle cx="410" cy="100" r="4" fill={activeFounder === "anmol" ? "#10B981" : "#CBD5E1"} />
                <circle cx="510" cy="100" r="4" fill={activeFounder === "anmol" ? "#10B981" : "#CBD5E1"} />

                {/* Center Lower Line: from Tanay's Hexagon bottom (250, 245) -> Down to callout (250, 275) */}
                <path 
                  d="M 250 245 L 250 280" 
                  stroke={activeFounder === "tanay" ? "#6366F1" : "#CBD5E1"} 
                  strokeWidth={activeFounder === "tanay" ? "2.5" : "1.5"} 
                  strokeDasharray={activeFounder === "tanay" ? "none" : "4 4"}
                  className="transition-colors duration-300"
                />
                <circle cx="250" cy="245" r="4" fill={activeFounder === "tanay" ? "#6366F1" : "#CBD5E1"} />
                <circle cx="250" cy="280" r="4" fill={activeFounder === "tanay" ? "#6366F1" : "#CBD5E1"} />
              </svg>

              {/* The Three Hexagon Frames (Clean Geometric Placeholders) */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 relative z-20">
                {/* Left Hexagon: Hritik */}
                <div 
                  className="cursor-pointer -translate-y-4 transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setActiveFounder("hritik")}
                  onMouseLeave={() => setActiveFounder(null)}
                >
                  <div 
                    className={`w-[155px] h-[178px] p-[3px] bg-gradient-to-b ${founders.hritik.glowColor} ${activeFounder === "hritik" ? "ring-4 ring-blue-400/40 scale-105" : ""} transition-all duration-300 shadow-md`}
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                  >
                    <div 
                      className={`w-full h-full ${founders.hritik.accentBg} overflow-hidden relative flex flex-col items-center justify-center text-white`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                    >
                      {founders.hritik.avatarUrl ? (
                        <Image
                          src={founders.hritik.avatarUrl}
                          alt={founders.hritik.name}
                          width={220}
                          height={250}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-1 text-blue-300 shadow-inner">
                            <User className="w-7 h-7" />
                          </div>
                          <span className="text-base font-extrabold tracking-wider text-blue-200">
                            {founders.hritik.initials}
                          </span>
                          <span className="text-[10px] font-mono text-blue-300/80 uppercase">
                            Placeholder
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center Hexagon: Tanay (Sits Lower) */}
                <div 
                  className="cursor-pointer translate-y-7 transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setActiveFounder("tanay")}
                  onMouseLeave={() => setActiveFounder(null)}
                >
                  <div 
                    className={`w-[165px] h-[190px] p-[3px] bg-gradient-to-b ${founders.tanay.glowColor} ${activeFounder === "tanay" ? "ring-4 ring-indigo-400/40 scale-105" : ""} transition-all duration-300 shadow-md`}
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                  >
                    <div 
                      className={`w-full h-full ${founders.tanay.accentBg} overflow-hidden relative flex flex-col items-center justify-center text-white`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                    >
                      {founders.tanay.avatarUrl ? (
                        <Image
                          src={founders.tanay.avatarUrl}
                          alt={founders.tanay.name}
                          width={220}
                          height={250}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-1 text-indigo-300 shadow-inner">
                            <User className="w-7 h-7" />
                          </div>
                          <span className="text-base font-extrabold tracking-wider text-indigo-200">
                            {founders.tanay.initials}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-300/80 uppercase">
                            Placeholder
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Hexagon: Anmol */}
                <div 
                  className="cursor-pointer -translate-y-4 transition-transform duration-300 hover:scale-105"
                  onMouseEnter={() => setActiveFounder("anmol")}
                  onMouseLeave={() => setActiveFounder(null)}
                >
                  <div 
                    className={`w-[155px] h-[178px] p-[3px] bg-gradient-to-b ${founders.anmol.glowColor} ${activeFounder === "anmol" ? "ring-4 ring-emerald-400/40 scale-105" : ""} transition-all duration-300 shadow-md`}
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                  >
                    <div 
                      className={`w-full h-full ${founders.anmol.accentBg} overflow-hidden relative flex flex-col items-center justify-center text-white`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                    >
                      {founders.anmol.avatarUrl ? (
                        <Image
                          src={founders.anmol.avatarUrl}
                          alt={founders.anmol.name}
                          width={220}
                          height={250}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-1 text-emerald-300 shadow-inner">
                            <User className="w-7 h-7" />
                          </div>
                          <span className="text-base font-extrabold tracking-wider text-emerald-200">
                            {founders.anmol.initials}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300/80 uppercase">
                            Placeholder
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Callout underneath Tanay Agrawal */}
              <div 
                className="mt-12 text-center relative z-30"
                onMouseEnter={() => setActiveFounder("tanay")}
                onMouseLeave={() => setActiveFounder(null)}
              >
                <div 
                  onClick={() => setActiveFounder(activeFounder === "tanay" ? null : "tanay")}
                  className={`cursor-pointer group p-3.5 rounded-2xl border transition-all backdrop-blur-md select-none w-full max-w-[240px] mx-auto ${
                    activeFounder === "tanay"
                      ? "bg-white shadow-xl border-indigo-500/50 ring-2 ring-indigo-500/20 translate-y-1"
                      : "bg-white/90 hover:bg-white border-slate-200/90 shadow-xs hover:border-indigo-400"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${founders.tanay.badgeColor}`}>
                      {founders.tanay.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {founders.tanay.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-indigo-600 mt-0.5 truncate">
                    {founders.tanay.work}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <span>Hover for details</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeFounder === "tanay" ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expandable Details Card for Tanay */}
                <AnimatePresence>
                  {activeFounder === "tanay" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-80 p-5 rounded-2xl bg-white/98 backdrop-blur-2xl border border-indigo-200 shadow-2xl text-left z-50"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <div>
                          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Designation</div>
                          <div className="text-xs font-bold text-slate-900">{founders.tanay.role}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Core</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {founders.tanay.description}
                      </p>
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Key Deliverables</div>
                        {founders.tanay.skills.map((skill, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 text-[11px] text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* 3. RIGHT CALLOUT: ANMOL MALVIYA */}
            <div 
              className="col-span-3 flex flex-col items-start text-left relative z-30"
              onMouseEnter={() => setActiveFounder("anmol")}
              onMouseLeave={() => setActiveFounder(null)}
            >
              <div 
                onClick={() => setActiveFounder(activeFounder === "anmol" ? null : "anmol")}
                className={`cursor-pointer group p-3.5 rounded-2xl border transition-all backdrop-blur-md select-none w-full max-w-[240px] ${
                  activeFounder === "anmol"
                    ? "bg-white shadow-xl border-emerald-500/50 ring-2 ring-emerald-500/20 -translate-x-1"
                    : "bg-white/90 hover:bg-white border-slate-200/90 shadow-xs hover:border-emerald-400"
                }`}
              >
                <div className="flex items-center justify-start gap-1.5 mb-1">
                  <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${founders.anmol.badgeColor}`}>
                    {founders.anmol.tag}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {founders.anmol.name}
                </h3>
                <p className="text-[11px] font-semibold text-emerald-600 mt-0.5 truncate">
                  {founders.anmol.work}
                </p>
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-start gap-1 text-[11px] text-slate-400 group-hover:text-emerald-600 transition-colors">
                  <span>Hover for details</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeFounder === "anmol" ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expandable Details Card (Positioned Below Right Callout) */}
              <AnimatePresence>
                {activeFounder === "anmol" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-3 left-0 w-80 p-5 rounded-2xl bg-white/98 backdrop-blur-2xl border border-emerald-200 shadow-2xl text-left z-50"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div>
                        <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Designation</div>
                        <div className="text-xs font-bold text-slate-900">{founders.anmol.role}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">AI Lead</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {founders.anmol.description}
                    </p>
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">Key Deliverables</div>
                      {founders.anmol.skills.map((skill, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-[11px] text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ============================================================== */}
          {/* MOBILE/TABLET RESPONSIVE FALLBACK (< lg screens) */}
          {/* ============================================================== */}
          <div className="lg:hidden flex flex-col items-center gap-8 py-4">
            {Object.values(founders).map((m) => {
              const isOpen = activeFounder === m.id;
              return (
                <div key={m.id} className="flex flex-col items-center text-center w-full max-w-sm">
                  {/* Hexagon Placeholder */}
                  <div 
                    className={`w-[160px] h-[184px] p-[3px] bg-gradient-to-b ${m.glowColor} mb-3`}
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                  >
                    <div 
                      className={`w-full h-full ${m.accentBg} overflow-hidden relative flex flex-col items-center justify-center text-white`}
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                    >
                      <div className="flex flex-col items-center justify-center p-3">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1 text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-extrabold tracking-wider">{m.initials}</span>
                        <span className="text-[9px] font-mono opacity-80 uppercase">Placeholder</span>
                      </div>
                    </div>
                  </div>

                  {/* Name Card */}
                  <div 
                    onClick={() => setActiveFounder(isOpen ? null : m.id)}
                    className="w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer"
                  >
                    <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                      {m.tag}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{m.name}</h3>
                    <p className="text-xs font-semibold text-[#1463FF]">{m.work}</p>
                    
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <span>{isOpen ? "Hide details" : "Tap for details"}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-3 border-t border-slate-100 text-left space-y-2">
                        <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                        <div className="space-y-1 pt-1">
                          {m.skills.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Interactive Guide */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-center text-xs text-slate-400 text-center">
            <span>Hover on any founder&apos;s name or callout tag to expand complete technical contributions &amp; deliverables.</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
