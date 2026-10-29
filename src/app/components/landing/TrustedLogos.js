"use client";

import { motion } from "framer-motion";

export default function TrustedLogos() {
  const logos = [
    {
      name: "Microsoft",
      element: (
        <div className="flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <span className="bg-[#F25022] w-2 h-2 rounded-[1px]" />
            <span className="bg-[#7FBA00] w-2 h-2 rounded-[1px]" />
            <span className="bg-[#00A4EF] w-2 h-2 rounded-[1px]" />
            <span className="bg-[#FFB900] w-2 h-2 rounded-[1px]" />
          </div>
          <span className="font-semibold text-slate-700 text-sm sm:text-base tracking-tight">Microsoft</span>
        </div>
      ),
    },
    {
      name: "Google",
      element: (
        <div className="flex items-center">
          <span className="font-bold text-base sm:text-lg tracking-tight">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
        </div>
      ),
    },
    {
      name: "Cloudflare",
      element: (
        <div className="flex items-center gap-1.5">
          <svg className="h-4 sm:h-5 text-[#F38020] fill-current" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          <span className="font-bold text-slate-800 text-xs sm:text-sm tracking-wider uppercase">Cloudflare</span>
        </div>
      ),
    },
    {
      name: "Cisco",
      element: (
        <div className="flex items-center gap-1">
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-0.5 h-1.5 bg-[#005073] rounded-full" />
            <span className="w-0.5 h-3 bg-[#005073] rounded-full" />
            <span className="w-0.5 h-2 bg-[#005073] rounded-full" />
            <span className="w-0.5 h-3.5 bg-[#005073] rounded-full" />
            <span className="w-0.5 h-2 bg-[#005073] rounded-full" />
            <span className="w-0.5 h-3 bg-[#005073] rounded-full" />
            <span className="w-0.5 h-1.5 bg-[#005073] rounded-full" />
          </div>
          <span className="font-extrabold text-[#005073] text-xs sm:text-sm tracking-wider">CISCO</span>
        </div>
      ),
    },
    {
      name: "CrowdStrike",
      element: (
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 sm:h-4 text-[#E01E26] fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 8.5L4 6.75v10.5L12 22l8-4.75V6.75L12 10.5z" />
          </svg>
          <span className="font-extrabold text-[#E01E26] text-xs sm:text-sm tracking-widest uppercase">CrowdStrike</span>
        </div>
      ),
    },
    {
      name: "IBM",
      element: (
        <div className="flex items-center">
          <span className="font-black text-sm sm:text-base tracking-widest text-[#006699] font-mono">
            IBM
          </span>
        </div>
      ),
    },
  ];

  return (
    <section className="border-y border-[#E5ECF5] bg-white py-9">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-[11px] font-bold tracking-widest text-[#94A3B8] uppercase mb-8"
        >
          TRUSTED BY LEADING ORGANIZATIONS
        </motion.p>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          className="flex flex-wrap items-center justify-center lg:justify-between gap-8 sm:gap-10"
        >
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
              whileHover={{ scale: 1.06, transition: { duration: 0.2 } }}
              className="cursor-default"
            >
              {logo.element}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
