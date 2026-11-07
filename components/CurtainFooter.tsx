"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { MagneticButton } from "./ui/MagneticButton";
import { InteractiveWordwall } from "./ui/InteractiveWordwall";
import { HorologicalAudio } from "./HorologicalAudio";

export function CurtainFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    footerRef.current.style.setProperty("--spot-x", `${x}px`);
    footerRef.current.style.setProperty("--spot-y", `${y}px`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToVault = () => {
    const el = document.getElementById("seal-lock");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer
      ref={footerRef}
      id="act-curtain"
      data-nav-theme="dark"
      onMouseMove={handleMouseMove}
      className="relative w-full bg-[#141416] text-[#F7F7F5] pt-44 pb-14 md:pt-48 px-6 md:px-16 lg:px-24 overflow-hidden select-none"
    >
      {/* ========================================================================= */}
      {/* 1. INTERACTIVE DARK MEMORY WORDWALL (Spotlight 350px Masked Layer)        */}
      {/* ========================================================================= */}
      <InteractiveWordwall variant="dark" />

      {/* ========================================================================= */}
      {/* 2. RADIAL VIGNETTE FOR FOREGROUND CONTRAST PROTECTION                    */}
      {/* ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 z-5"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(20, 20, 22, 0.92) 0%, rgba(20, 20, 22, 0.55) 45%, transparent 75%)",
        }}
      />

      {/* ========================================================================= */}
      {/* 3. FOREGROUND STAGE (z-10): Clean Swiss Display Typography & CTAs        */}
      {/* ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-[1600px]">
        
        {/* Top Eyebrow - Clean & Borderless */}
        <div className="flex items-center justify-between pb-6 mb-16">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF4F00] font-semibold tabular-nums">
              ACT 05 // CURTAIN CONCLUSION
            </span>
          </div>

          <div className="font-mono text-xs text-[#F7F7F5]/55 tabular-nums">
            HOROLOGICAL OBSERVATORY // CH-1200
          </div>
        </div>

        {/* Monumental Headline with Generous Spacing and Zero Clipping */}
        <div className="flex flex-col items-center text-center my-12">
          <h2 className="font-display font-black text-[clamp(2.5rem,7.5vw,7rem)] leading-[1.06] tracking-tight text-[#F7F7F5] max-w-5xl">
            What will you leave{" "}
            <span className="font-editorial italic font-light text-[#FF4F00]">
              behind?
            </span>
          </h2>

          <p className="mt-8 max-w-lg font-sans text-sm md:text-base text-[#F7F7F5]/75 leading-relaxed">
            The years will pass regardless. Inscribe your testament, your secrets, or your promises in high-density cryptographic permanence.
          </p>

          {/* Centered Signal Orange CTA Pill with Dual-Layer Magnetic Parallax */}
          <div className="mt-10">
            <MagneticButton
              magneticStrength={0.6}
              data-cursor-label="SEAL"
              onClick={scrollToVault}
              className="group flex items-center gap-3 rounded-full bg-[#FF4F00] px-8 py-4 font-mono text-sm font-extrabold uppercase tracking-wider text-[#141416] shadow-[0_10px_35px_rgba(255,79,0,0.35)] transition-colors hover:bg-[#F7F7F5] cursor-pointer tabular-nums"
            >
              <span>Seal a memory +</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>
          </div>
        </div>

        {/* 4-Column Architectural Horology Registry in Recessed Well */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 rounded-3xl bg-[#18181B]/85 backdrop-blur-md p-8 md:p-10 my-16 font-mono tabular-nums border border-white/10 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#F7F7F5]/45 uppercase tracking-widest mb-1 font-semibold">
              PROTOCOL INTEGRITY
            </span>
            <span className="text-xl font-bold text-[#FF4F00]">
              100% AUDITABLE
            </span>
            <span className="text-[10px] text-[#F7F7F5]/65 mt-1 font-sans">
              Zero backdoor bypass
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-[#F7F7F5]/45 uppercase tracking-widest mb-1 font-semibold">
              SOLSTICES MONITORED
            </span>
            <span className="text-xl font-bold text-[#F7F7F5]">
              84 OBSERVATIONS
            </span>
            <span className="text-[10px] text-[#F7F7F5]/65 mt-1 font-sans">
              Astronomical verification
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-[#F7F7F5]/45 uppercase tracking-widest mb-1 font-semibold">
              STORAGE LIFESPAN
            </span>
            <span className="text-xl font-bold text-[#FF4F00]">
              1,000+ YEARS
            </span>
            <span className="text-[10px] text-[#F7F7F5]/65 mt-1 font-sans">
              Optical quartz substrate
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-[#F7F7F5]/45 uppercase tracking-widest mb-1 font-semibold">
              SWISS HOROLOGY CLOCK
            </span>
            <span className="text-xl font-bold text-[#F7F7F5]">
              {utcTime || "12:00:00 UTC"}
            </span>
            <span className="text-[10px] text-[#FF4F00] mt-1 flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-ping" />
              ATOMIC SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Bottom Architectural Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs text-[#F7F7F5]/65 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-sm text-[#F7F7F5]">
              Aetheria<span className="text-[10px] text-[#FF4F00]">®</span>
            </span>
            <span>—</span>
            <span className="tabular-nums">Horology & Spatial Archive Edition</span>
          </div>

          <div className="flex items-center gap-6">
            <HorologicalAudio variant="minimal" />
            <MagneticButton
              magneticStrength={0.5}
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-[#FF4F00] hover:text-[#F7F7F5] transition-colors cursor-pointer font-semibold tabular-nums px-4 py-2 rounded-full hover:bg-white/5"
            >
              <span>Back to top</span>
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            </MagneticButton>
          </div>
        </div>

      </div>
    </footer>
  );
}
