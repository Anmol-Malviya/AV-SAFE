export default function WorkflowStep({ stepNumber, title, description, icon: Icon, isLast = false }) {
  return (
    <div className="flex-1 flex flex-col items-start text-left">
      {/* Icon with step badge */}
      <div className="relative mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F6FE] border border-[#E5ECF5] text-[#1463FF]">
          <Icon className="h-5 w-5 stroke-[2.2]" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1463FF] text-[9px] font-bold text-white">
          {stepNumber}
        </span>
      </div>

      {/* Step Title */}
      <h3 className="text-sm sm:text-base font-bold text-[#101D36]">
        {title}
      </h3>

      {/* Step Description */}
      <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}
