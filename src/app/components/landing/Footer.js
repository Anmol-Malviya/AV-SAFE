import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const navLinks = [
    { name: "Product", href: "#hero" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="bg-white text-[#101D36] border-t border-[#E5ECF5] py-10">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Brand Logo & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="AV-SAFE Logo"
                width={38}
                height={28}
                className="h-7 w-auto object-contain mix-blend-multiply"
              />
              <span className="text-base font-bold tracking-tight text-[#101D36]">
                AV-SAFE
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[#CBD5E1]">|</span>
            <p className="text-xs text-[#64748B]">
              AI-powered phishing and email defense.
            </p>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-[#64748B]">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="hover:text-[#101D36] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Socials & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-3 text-[#64748B]">
              {/* LinkedIn */}
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1463FF] transition-colors" aria-label="LinkedIn">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 1 0 0-3.05 1.53 1.53 0 0 0 0 3.05M5.07 18.5h2.79v-8.37H5.07v8.37z" />
                </svg>
              </Link>
              {/* Twitter / X */}
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1463FF] transition-colors" aria-label="Twitter">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              {/* YouTube */}
              <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1463FF] transition-colors" aria-label="YouTube">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
            </div>
            <span>© 2026 AV-SAFE. All rights reserved.</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
