"use client";

import { motion } from "framer-motion";

export default function WorkflowStep({ stepNumber, title, description, icon: Icon, isLast = false }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex-1 flex flex-col items-start text-left group"
    >
      {/* Icon with step badge */}
      <div className="relative mb-4">
        <motion.div 
          whileHover={{ scale: 1.08 }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F6FE] border border-[#E5ECF5] text-[#1463FF] shadow-xs group-hover:border-blue-300 transition-colors"
        >
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </motion.div>
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1463FF] text-[9px] font-bold text-white shadow-xs">
          {stepNumber}
        </span>
      </div>

      {/* Step Title */}
      <h3 className="text-sm sm:text-base font-bold text-[#101D36] group-hover:text-[#1463FF] transition-colors">
        {title}
      </h3>

      {/* Step Description */}
      <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed max-w-xs">
        {description}
      </p>
    </motion.div>
  );
}
