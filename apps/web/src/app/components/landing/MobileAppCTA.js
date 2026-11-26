"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { QrCode, Mail, Clock, Download } from "lucide-react";
import { buttonHover, buttonTap } from "@/lib/animations";

export default function MobileAppCTA() {
  return (
    <section id="download" className="relative min-h-[580px] overflow-hidden bg-white py-20 lg:py-28 border-t border-[#E5ECF5] flex items-center">
      
      {/* ============ BACKGROUND IMAGE (CYBER WAVES & SHIELD) ============ */}
      <div 
        className="absolute inset-0 pointer-events-none bg-no-repeat bg-cover bg-left lg:bg-center opacity-85"
        style={{ backgroundImage: "url('/cyber-bg.png')" }}
      >
        {/* Subtle white overlay so text has high contrast */}
        <div className="absolute inset-0 bg-white/40 lg:bg-white/20" />
      </div>

      <div className="relative mx-auto max-w-[1240px] w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* ============ LEFT COLUMN: COPY & STORE BADGES ============ */}
          <motion.div 
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col justify-center text-left z-10"
          >
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-4">
              MOBILE APP
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-[#101D36] leading-[1.12]">
              Carry AV-SAFE <br />
              <span className="text-[#1463FF]">In Your Pocket</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-lg">
              Scan QR codes, check links, and get instant threat alerts with the AV-SAFE mobile app. Stay protected anytime, anywhere.
            </p>

            {/* Direct Download Button */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <motion.a
                href="/AV-SAFE.apk"
                download="AV-SAFE.apk"
                whileHover={buttonHover}
                whileTap={buttonTap}
                className="inline-flex items-center gap-3 rounded-xl bg-[#0B1933] hover:bg-[#1463FF] text-white px-6 py-3.5 transition-all duration-200 shadow-lg shadow-blue-900/20 group cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] uppercase tracking-wider text-blue-200 font-semibold">DIRECT APK DOWNLOAD</span>
                  <span className="block text-sm font-bold leading-tight text-white">Download AV-SAFE App (.apk)</span>
                </div>
              </motion.a>
            </div>

          </motion.div>

          {/* ============ RIGHT COLUMN: SMARTPHONE MOCKUP ============ */}
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center lg:justify-end z-10"
          >
            <motion.div 
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              
              {/* Smartphone Frame (Sleek Modern Phone) */}
              <div
                className="relative w-[240px] sm:w-[260px] rounded-[2.6rem] bg-white p-2.5 border-[5px] border-slate-900 shadow-2xl shadow-blue-900/15 overflow-hidden"
                style={{ aspectRatio: "9/18.5" }}
              >
                {/* Speaker Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-900 rounded-full z-30" />

                {/* Smartphone Screen Canvas */}
                <div className="relative h-full w-full rounded-[2.1rem] bg-[#F8FAFC] overflow-hidden flex flex-col justify-start p-4 pt-8 text-[#101D36]">
                  
                  {/* Top Mobile Status Header */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Image
                      src="/logo.png"
                      alt="AV-SAFE Logo"
                      width={32}
                      height={24}
                      className="h-6 w-auto object-contain mix-blend-multiply"
                    />
                    <span className="font-bold text-sm tracking-tight text-[#101D36]">AV-SAFE</span>
                  </div>

                  {/* 3 Menu Cards */}
                  <div className="space-y-3">
                    {/* Card 1: Scan QR */}
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="rounded-xl bg-white border border-[#E5ECF5] p-3 flex items-center gap-3 shadow-xs"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F6FE] text-[#1463FF]">
                        <QrCode className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[#101D36]">Scan QR</span>
                    </motion.div>

                    {/* Card 2: Check Email */}
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="rounded-xl bg-white border border-[#E5ECF5] p-3 flex items-center gap-3 shadow-xs"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F6FE] text-[#1463FF]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[#101D36]">Check Email</span>
                    </motion.div>

                    {/* Card 3: Recent Scans */}
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="rounded-xl bg-white border border-[#E5ECF5] p-3 flex items-center gap-3 shadow-xs"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F6FE] text-[#1463FF]">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[#101D36]">Recent Scans</span>
                    </motion.div>
                  </div>

                </div>
              </div>

            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
