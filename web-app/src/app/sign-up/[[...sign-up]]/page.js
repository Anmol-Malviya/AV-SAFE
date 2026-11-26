import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Sign Up | AV-SAFE Threat Intelligence",
  description: "Create an account to protect your devices with centralized phishing intelligence.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mb-6 flex items-center justify-between w-full max-w-md px-2 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          SecOps Shield
        </div>
      </div>

      <div className="z-10 w-full max-w-md flex justify-center">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/system"
        />
      </div>
    </div>
  );
}
