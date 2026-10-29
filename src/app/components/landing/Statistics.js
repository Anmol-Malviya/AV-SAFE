import { Link2, Shield, Crosshair, Zap } from "lucide-react";

export default function Statistics() {
  const stats = [
    {
      value: "2.5M+",
      label: "URLs Analyzed",
      icon: Link2,
      iconColor: "text-[#1463FF]",
      iconBg: "bg-[#F0F6FE]",
    },
    {
      value: "120K+",
      label: "Threats Blocked",
      icon: Shield,
      iconColor: "text-[#1463FF]",
      iconBg: "bg-[#F0F6FE]",
    },
    {
      value: "98.7%",
      label: "Detection Accuracy",
      icon: Crosshair,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
    {
      value: "30ms",
      label: "Average Response Time",
      icon: Zap,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Single horizontal elevated metrics card */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#E5ECF5] bg-white p-6 sm:p-8 shadow-md shadow-blue-900/5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[#E5ECF5]">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3.5 ${
                    i > 0 ? "pt-5 lg:pt-0 lg:pl-6" : ""
                  }`}
                >
                  {/* Colored circular icon */}
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${stat.iconBg} ${stat.iconColor} border border-[#E5ECF5]/80`}>
                    <Icon className="h-5 w-5 stroke-[2.2]" />
                  </div>

                  {/* Value and label */}
                  <div className="text-left">
                    <span className="block text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101D36] leading-none">
                      {stat.value}
                    </span>
                    <span className="block text-xs font-medium text-[#64748B] mt-1">
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
