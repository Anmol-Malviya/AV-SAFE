"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { QrCode, Mail, Clock } from "lucide-react";
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

            {/* Store Buttons (Google Play & App Store) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Google Play / Android APK Download */}
              <motion.a
                href="/AV-SAFE.apk"
                download="AV-SAFE.apk"
                whileHover={buttonHover}
                whileTap={buttonTap}
                className="flex items-center gap-3 rounded-xl bg-black hover:bg-slate-900 text-white px-4 py-2.5 transition-colors shadow-md"
              >
                {/* Google Play Triangle SVG */}
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.609 1.814L13.792 12 3.61 22.186A2.214 2.214 0 0 1 3 20.627V3.373c0-.6.224-1.162.609-1.559z"/>
                  <path fill="#FBBC04" d="M17.556 8.236l-3.764 3.764 3.764 3.764 4.254-2.431a1.458 1.458 0 0 0 0-2.666l-4.254-2.431z"/>
                  <path fill="#34A853" d="M3.609 22.186L13.792 12l3.764 3.764-11.895 6.8c-.58.331-1.28.243-1.777-.253a.972.972 0 0 1-.27-.125z"/>
                  <path fill="#EA4335" d="M3.609 1.814A.972.972 0 0 1 3.879 1.69c.497-.497 1.197-.585 1.777-.254l11.895 6.8L13.792 12 3.609 1.814z"/>
                </svg>
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-300 font-medium">GET IT ON</span>
                  <span className="block text-xs font-bold leading-none text-white mt-0.5">Google Play</span>
                </div>
              </motion.a>

              {/* App Store Badge */}
              <motion.a
                href="#download"
                whileHover={buttonHover}
                whileTap={buttonTap}
                className="flex items-center gap-3 rounded-xl bg-black hover:bg-slate-900 text-white px-4 py-2.5 transition-colors shadow-md"
              >
                {/* Apple Logo SVG */}
                <svg className="h-6 w-6 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.03-.49 2.65-1.24z"/>
                </svg>
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-300 font-medium">Download on the</span>
                  <span className="block text-xs font-bold leading-none text-white mt-0.5">App Store</span>
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
