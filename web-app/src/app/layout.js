import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import PwaRegister from "./PwaRegister";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "SecureOS | QR & Phishing Link Scanner",
  description: "Mobile-first scanner to check links and QR codes for phishing attempts instantly, offline-ready.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SecureOS",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              for (var i = 0; i < registrations.length; i++) {
                registrations[i].unregister();
              }
            });
          }
        `}} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/ic_app_logo.png" type="image/png" />
        <meta name="theme-color" content="#060411" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <ClerkProvider
          appearance={{
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
            },
            variables: {
              colorPrimary: "#2563eb",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#0f172a",
              colorText: "#0f172a",
              colorTextSecondary: "#64748b",
              colorTextOnPrimaryBackground: "#ffffff",
              borderRadius: "0.5rem",
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
            },
            elements: {
              card: "border border-slate-200/80 shadow-[0_12px_40px_rgb(0,0,0,0.06)] bg-white rounded-2xl p-6 sm:p-8",
              navbar: "hidden",
              headerTitle: "text-slate-900 font-semibold tracking-tight text-xl text-center",
              headerSubtitle: "text-slate-500 text-xs text-center mt-1",
              socialButtonsBlockButton: "border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 font-medium transition-all shadow-none rounded-lg h-10",
              socialButtonsBlockButtonText: "text-slate-700 font-medium text-xs",
              dividerLine: "bg-slate-200/80",
              dividerText: "text-slate-400 text-[10px] font-semibold tracking-widest uppercase bg-white px-3",
              formFieldLabel: "text-slate-700 text-[11px] font-semibold uppercase tracking-wider mb-1.5",
              formFieldInput: "border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white text-slate-900 rounded-lg text-sm px-3.5 py-2.5 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs tracking-wide rounded-lg h-10 shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-md transition-all duration-150 active:scale-[0.99]",
              footer: "!hidden",
              footerAction: "border-t border-slate-100 pt-4 mt-2 justify-center",
              footerActionText: "text-slate-500 text-xs",
              footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors",
              identityPreviewText: "text-slate-900 font-medium",
              identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
              internal: "!hidden"
            }
          }}
        >
          <PwaRegister />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
