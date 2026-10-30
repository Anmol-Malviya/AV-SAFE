"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { buttonHover, buttonTap } from "@/lib/animations";

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
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E5ECF5]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
            transition={{ duration: 0.3 }}
            className="relative h-9 w-auto flex items-center rounded-xl overflow-hidden"
          >
            <Image
              src="/logo.png"
              alt="AV-SAFE Logo"
              width={44}
              height={32}
              className="h-8 w-auto object-contain rounded-xl mix-blend-multiply"
              priority
            />
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-[#101D36]">
            AV-SAFE
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.href}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium text-[#64748B] hover:text-[#101D36] transition-colors relative"
            >
              {link.name}
            </motion.a>
          ))}
        </nav>

        {/* Desktop Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Link
              href="/system"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0B1933] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#101D36] transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-xl border border-[#E5ECF5] text-[#101D36] hover:bg-[#F3F7FF] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-[#E5ECF5] bg-white/98 backdrop-blur-lg px-4 shadow-xl"
          >
            <div className="flex flex-col space-y-3 py-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
