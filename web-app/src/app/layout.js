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
  title: "AV-SAFE | QR & Phishing Link Scanner",
  description: "Mobile-first scanner to check links and QR codes for phishing attempts instantly, offline-ready.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AV-SAFE",
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
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#3b82f6",
              colorBackground: "#0b0f19",
              colorInputBackground: "#111827",
              colorInputText: "#f8fafc",
              colorText: "#f8fafc",
              colorTextSecondary: "#94a3b8",
              borderRadius: "0.5rem",
            },
            elements: {
              card: "border border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-xl",
              navbar: "hidden",
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
