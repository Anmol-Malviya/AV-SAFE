"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E5ECF5]"
          : "bg-white/90 backdrop-blur-md border-b border-[#E5ECF5]/80"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1463FF] text-white shadow-sm shadow-blue-500/25">
            <Shield className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#101D36]">
            AV-SAFE
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#64748B] hover:text-[#101D36] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/system"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1933] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#101D36] active:scale-[0.98] transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-xl border border-[#E5ECF5] text-[#101D36] hover:bg-[#F3F7FF] transition-colors"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5ECF5] bg-white/98 backdrop-blur-lg px-4 py-5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F3F7FF] hover:text-[#101D36] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-[#E5ECF5]">
              <Link
                href="/system"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-full bg-[#0B1933] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#101D36]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
