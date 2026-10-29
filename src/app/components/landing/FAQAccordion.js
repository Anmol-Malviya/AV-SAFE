"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(-1);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-[#1463FF]/30 bg-[#F0F6FE]/30 shadow-xs"
                : "border-[#E5ECF5] bg-white hover:border-slate-300"
            }`}
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-[#101D36] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1463FF]"
              aria-expanded={isOpen}
            >
              <span className="pr-4">{item.question}</span>
              <ChevronRight
                className={`h-4 w-4 text-[#94A3B8] transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? "rotate-90 text-[#1463FF]" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-[#64748B] border-t border-[#E5ECF5]/60 pt-3 animate-in fade-in-50 duration-200">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
