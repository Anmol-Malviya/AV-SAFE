"use client";

import { motion } from "framer-motion";
import WorkflowStep from "./WorkflowStep";
import { Link2, Search, FileCheck } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      stepNumber: "01",
      title: "Enter a URL or Email →",
      description: "Paste any link, email or attachment to analyze.",
      icon: Link2,
    },
    {
      stepNumber: "02",
      title: "AI Analysis →",
      description: "Our AI scans and checks against multiple threat databases.",
      icon: Search,
    },
    {
      stepNumber: "03",
      title: "Get Results",
      description: "Instant risk score and clear explanation.",
      icon: FileCheck,
      isLast: true,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-white border-t border-[#E5ECF5] relative">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Heading & Subtitle */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-4 flex flex-col justify-start"
          >
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101D36] leading-[1.18]">
              From Link to Insight <br />
              in Seconds
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-sm">
              A simple, powerful process to keep you safe online.
            </p>
          </motion.div>

          {/* Right Column: 3 Steps */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="lg:col-span-8 flex flex-col sm:flex-row items-start justify-between gap-8 sm:gap-6 pt-2"
          >
            {steps.map((step, index) => (
              <WorkflowStep key={index} {...step} />
            ))}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
