"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Menu, X, Lock } from "lucide-react";
import { GlitchLogo } from "./ui/GlitchLogo";
import { HorologicalAudio } from "./HorologicalAudio";
import { MagneticButton } from "./ui/MagneticButton";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "act-story", label: "Chamber" },
  { id: "act-method", label: "Matrix" },
  { id: "act-archive", label: "Timeline" },
  { id: "seal-lock", label: "Vault" },
];

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("act-story");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 280;
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* UNIFIED FLOATING SMOKED-CARBON PILL ARCHITECTURE                          */}
      {/* ========================================================================= */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1360px] h-14 px-6 rounded-full bg-[#141416]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex items-center justify-between select-none">
        
        {/* Left: Clean Glitch Wordmark (Single-Line Footprint, Zero Gray Box) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          title="Return to Zenith Epoch"
          className="flex items-center cursor-pointer"
        >
          <GlitchLogo />
        </a>

        {/* Center: Minimal Typographic Links (Azeret Mono + Tiny 4px Active Dot) */}
        <nav
          aria-label="Chronicle Navigation"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`relative py-1 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "text-[#F7F7F5] font-semibold"
                    : "text-[#F7F7F5]/60 hover:text-[#F7F7F5]"
                }`}
              >
                <span>{item.label}</span>

                {/* Single Tiny 4px #FF4F00 Dot Underneath Active Link */}
                {isActive && (
                  <motion.span
                    layoutId="cleanNavDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#FF4F00] shadow-[0_0_8px_#FF4F00]"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Integrated Minimal Controls */}
        <div className="flex items-center gap-3.5">
          {/* Minimalist Sound Toggle (Icon + SOUND OFF/ON + [M]) */}
          <HorologicalAudio variant="minimal" />

          {/* Subtle 1px Vertical Divider */}
          <div className="hidden sm:block h-4 w-[1px] bg-white/10" />

          {/* Sleek Compact CTA Pill (Forge Lock ↗) */}
          <MagneticButton
            magneticStrength={0.35}
            onClick={() => scrollToSection("seal-lock")}
            className="h-9 px-4 rounded-full bg-[#FF4F00] text-[#141416] hover:bg-[#F7F7F5] font-mono text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <span>Forge Lock</span>
            <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </MagneticButton>

          {/* Mobile Hamburger Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[#F7F7F5] border border-white/10 md:hidden transition-transform duration-200 active:scale-95 cursor-pointer ml-1"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER HUD MENU                                                    */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-between bg-[#141416]/98 backdrop-blur-2xl px-8 pt-28 pb-12 md:hidden text-[#F7F7F5]">
          <nav className="flex flex-col gap-6">
            {NAV_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="flex items-center justify-between border-b border-white/10 pb-4 text-left font-display text-2xl font-bold text-[#F7F7F5] hover:text-[#FF4F00] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[#FF4F00] tabular-nums">
                    [0{idx + 1}]
                  </span>
                  <span>{item.label}</span>
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/40" />
              </button>
            ))}
          </nav>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => scrollToSection("seal-lock")}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF4F00] py-4 font-mono text-sm font-bold uppercase text-[#141416] shadow-[0_10px_30px_rgba(255,79,0,0.35)] cursor-pointer transition-transform active:scale-98"
            >
              <Lock className="h-4 w-4" />
              <span>FORGE VAULT LOCK ↗</span>
            </button>
            <div className="text-center font-mono text-[10px] text-white/40 uppercase tracking-widest tabular-nums">
              Aetheria // Single-Surface Architectural Bar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
