import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Profile & Identity | AV-SAFE",
  description: "Manage your AV-SAFE user identity and security credentials.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <Link
            href="/system"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Shield className="w-4 h-4" />
            Identity Management
          </div>
        </div>

        <div className="flex justify-center">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full max-w-4xl",
                card: "border border-slate-800 bg-slate-900/90 shadow-2xl rounded-2xl",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
