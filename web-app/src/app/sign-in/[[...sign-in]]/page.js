import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Sign In | SecureOS Threat Intelligence",
  description: "Secure login to access your SecureOS dashboard and security scan telemetry.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 relative select-none">
      {/* Hairline subtle background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Soft Apple-style diffused radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-blue-50/70 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="mb-5 flex items-center justify-between w-full max-w-[420px] px-1 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100/80"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-full border border-slate-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          SecOps Protected
        </div>
      </div>

      {/* Clerk Card Container */}
      <div className="z-10 w-full max-w-[420px] flex justify-center [&_.cl-footer]:!hidden [&_.cl-internal-10ky91s]:!hidden [&_.cl-internal-b3fm6y]:!hidden">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/system"
        />
      </div>

      {/* Zero Emojis / Clean Apple Footer */}
      <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-400 z-10">
        <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>End-to-end encrypted zero-trust authorization</span>
      </div>
    </div>
  );
}
