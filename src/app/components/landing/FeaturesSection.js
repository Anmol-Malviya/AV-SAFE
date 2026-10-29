import FeatureCard from "./FeatureCard";
import { Link2, Mail, Cpu } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Link2,
      title: "URL Threat Analysis",
      description: "Scan any link for phishing, malware and fraud using AI.",
      iconColor: "text-[#1463FF]",
      iconBg: "bg-[#F0F6FE]",
    },
    {
      icon: Mail,
      title: "Email Security",
      description: "Detect suspicious emails and malicious attachments.",
      iconColor: "text-[#1463FF]",
      iconBg: "bg-[#F0F6FE]",
    },
    {
      icon: Cpu,
      title: "AI-Powered Detection",
      description: "Advanced models to identify new and evolving threats.",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-24 bg-white relative">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-4 flex flex-col justify-start">
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#F0F6FE] border border-[#E5ECF5] px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-[#1463FF] mb-4">
              FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101D36] leading-[1.18]">
              Powerful Protection, <br />
              Made Simple
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#64748B] leading-relaxed max-w-sm">
              Advanced AI tools to detect, analyze and block threats before they reach you.
            </p>
          </div>

          {/* Right Column: 3 Feature Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
