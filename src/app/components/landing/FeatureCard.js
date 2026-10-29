"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FeatureCard({ icon: Icon, title, description, iconColor = "text-[#1463FF]", iconBg = "bg-[#F3F7FF]", href = "/system" }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group relative flex flex-col justify-between rounded-2xl border border-[#E5ECF5] bg-white p-6 sm:p-7 shadow-xs hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-colors"
    >
      <div>
        {/* Rounded square icon */}
        <motion.div 
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.08 }}
          transition={{ duration: 0.3 }}
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor} border border-[#E5ECF5]`}
        >
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </motion.div>

        {/* Title */}
        <h3 className="mt-5 text-base sm:text-lg font-bold text-[#101D36] group-hover:text-[#1463FF] transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#64748B]">
          {description}
        </p>
      </div>

      {/* Blue Arrow Link */}
      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center text-sm font-semibold text-[#1463FF] hover:text-[#0D52DD] transition-all group-hover:translate-x-1.5"
          aria-label={`Learn more about ${title}`}
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
