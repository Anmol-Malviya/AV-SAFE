"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function TestimonialCard({ quote, name, role, avatarUrl, initials, rating = 5 }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="flex flex-col justify-between rounded-2xl border border-[#E5ECF5] bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-colors"
    >
      {/* Top: Avatar and User Details */}
      <div>
        <div className="flex items-center gap-3.5 mb-4">
          <motion.div 
            whileHover={{ scale: 1.08 }}
            className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0F6FE] border border-[#E5ECF5]"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-xs text-[#1463FF]">
                {initials}
              </div>
            )}
          </motion.div>
          <div>
            <h4 className="text-sm font-bold text-[#101D36]">{name}</h4>
            <p className="text-xs text-[#64748B]">{role}</p>
          </div>
        </div>

        {/* Quote */}
        <p className="text-xs sm:text-sm leading-relaxed text-[#101D36]">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* 5 Amber Stars */}
      <div className="mt-5 flex items-center gap-1 text-amber-400">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
    </motion.div>
  );
}
