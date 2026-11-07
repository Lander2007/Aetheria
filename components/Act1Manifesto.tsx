"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Lock } from "lucide-react";

const MANIFESTO_TENETS = [
  {
    index: 0,
    eyebrow: "TENET 01 // AGAINST NOISE",
    prefix: "Everything truly ",
    italic: "important",
    suffix: " was never meant for an ephemeral feed.",
    epoch: "2030",
  },
  {
    index: 1,
    eyebrow: "TENET 02 // ARCHITECTURAL FORM",
    prefix: "We build architectural vessels for the ",
    italic: "unspoken promise.",
    suffix: "",
    epoch: "2065",
  },
  {
    index: 2,
    eyebrow: "TENET 03 // HOROLOGICAL RESOLUTION",
    prefix: "What you seal today will ",
    italic: "awaken decades later",
    suffix: " with pristine fidelity.",
    epoch: "2100",
  },
];

export function Act1Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTenet, setActiveTenet] = useState(0);
  const prevTenetRef = useRef(0);

  const [horizonYear, setHorizonYear] = useState(2030);
  const prevYearRef = useRef(2030);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track active tenet phase based on scroll depth (0.00-0.33, 0.33-0.66, 0.66-1.00)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let nextTenet = 0;
    if (latest < 0.33) {
      nextTenet = 0;
    } else if (latest < 0.66) {
      nextTenet = 1;
    } else {
      nextTenet = 2;
    }
    if (nextTenet !== prevTenetRef.current) {
      prevTenetRef.current = nextTenet;
      setActiveTenet(nextTenet);
    }
  });

  // Live Scrolling Horizon Year (2030 -> 2100)
  const targetYearVal = useTransform(scrollYProgress, [0, 1], [2030, 2100]);
  useMotionValueEvent(targetYearVal, "change", (latest) => {
    const rounded = Math.round(latest);
    if (rounded !== prevYearRef.current) {
      prevYearRef.current = rounded;
      setHorizonYear(rounded);
    }
  });

  // Kinetic scroll velocity for natural horological resistance
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 350,
  });
  const escapementJitter = useTransform(smoothVelocity, [-1, 1], [-2.5, 2.5]);

  // Counter-Rotating Chronograph Rings
  // Outer tick ring: Clockwise 0deg -> 180deg
  const outerRotation = useTransform(scrollYProgress, [0, 1], [0, 180]);
  // Inner escapement gear ring: Counter-Clockwise 0deg -> -240deg
  const innerRotation = useTransform(scrollYProgress, [0, 1], [0, -240]);

  // Chronograph bottom progress line
  const progressLine = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      id="act-story"
      data-nav-theme="dark"
      className="relative w-full h-[280vh] bg-[#141416] text-[#F7F7F5] overflow-x-clip"
    >
      {/* 100% Full-Bleed Sticky Viewport (Zero Side Margins on Any Viewport Size) */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#141416] flex flex-col justify-between">
        
        {/* Strictly Centered Architecture Container */}
        <div className="max-w-[1540px] mx-auto w-full h-full px-8 md:px-16 pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col justify-between relative z-10">
          
          {/* ========================================================================= */}
          {/* TOP STATUS BAR: Precision Horological Vault Header                       */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#FF4F00] font-semibold tabular-nums">
                ACT 01 // INTERIOR CHAMBER
              </span>
              <span className="text-[#F7F7F5]/30">•</span>
              <span className="font-mono text-xs text-[#F7F7F5]/60 tabular-nums">
                ROTARY ESCAPEMENT MANIFESTO
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-[#FF4F00] tabular-nums">
              <Lock className="h-3.5 w-3.5 text-[#FF4F00]" />
              <span>IMMUTABLE WITNESS // AES-256</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MAIN CHAMBER GRID: STRICT 12-COLUMN SPLIT (ZERO OVERLAP)                  */}
          {/* Left Column: 7 Cols (max-w-[680px]) | Right Column: 5 Cols Contained Dial */}
          {/* ========================================================================= */}
          <div className="relative grid flex-1 grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 py-4">
            
            {/* ----------------------------------------------------------------------- */}
            {/* LEFT COLUMN (7 Cols): The 3 Manifesto Tenets (Max-W 680px, High Contrast)*/}
            {/* ----------------------------------------------------------------------- */}
            <div className="col-span-1 lg:col-span-7 pr-4 lg:pr-8 z-20 max-w-[680px]">
              <div className="flex flex-col justify-center space-y-10 sm:space-y-12 lg:space-y-14">
                {MANIFESTO_TENETS.map((tenet) => {
                  const isActive = tenet.index === activeTenet;
                  return (
                    <div
                      key={tenet.index}
                      className="flex items-stretch gap-5 sm:gap-6 group"
                    >
                      {/* Left Vertical Indicator Bar: 100% Signal Orange when Active, Subtle White/10 when Inactive */}
                      <div className="relative w-[3px] self-stretch rounded-full bg-white/10 overflow-hidden shrink-0 transition-all duration-500">
                        <div
                          className={`w-full h-full rounded-full transition-all duration-500 ${
                            isActive
                              ? "bg-[#FF4F00] shadow-[0_0_16px_#FF4F00]"
                              : "opacity-0"
                          }`}
                        />
                      </div>

                      {/* Manifesto Tenet Content */}
                      <div
                        className={`flex flex-col transition-all duration-500 transform-gpu ${
                          isActive
                            ? "opacity-100 translate-x-2"
                            : "opacity-20 translate-x-0"
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] uppercase font-bold tracking-[0.22em] mb-2.5 transition-colors duration-500 tabular-nums ${
                            isActive ? "text-[#FF4F00]" : "text-[#F7F7F5]/50"
                          }`}
                        >
                          {tenet.eyebrow}
                        </span>

                        <p className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] leading-[1.18] tracking-tight text-[#F7F7F5]">
                          {tenet.prefix}
                          <span
                            className={`font-editorial italic font-light transition-all duration-500 ${
                              isActive
                                ? "text-[#FF4F00] border-b border-[#FF4F00]/50 pb-0.5"
                                : "text-[#F7F7F5]"
                            }`}
                          >
                            {tenet.italic}
                          </span>
                          {tenet.suffix}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------------- */}
            {/* RIGHT COLUMN (5 Cols): Contained Machined Chronograph Escapement HUD   */}
            {/* Zero Collision: 440px x 440px Contained Instrument with Digital Aperture */}
            {/* ----------------------------------------------------------------------- */}
            <div className="col-span-1 lg:col-span-5 relative flex items-center justify-center lg:justify-end z-10">
              
              <div
                data-cursor-stage="true"
                data-cursor-label="2100 HORIZON"
                className="relative w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] xl:w-[480px] xl:h-[480px] flex items-center justify-center pointer-events-auto"
              >
                {/* Subtle Ambient Radial Backlight */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,79,0,0.16)_0%,transparent_70%)] pointer-events-none" />

                {/* 1. Static Outer Bezel Ring with Hairline Graduations */}
                <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]" />

                {/* 2. Docked Target Epoch Pointer (Docked Cleanly on Top Rim - NEVER sticking left) */}
                <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none select-none">
                  <div className="bg-[#0B0B0D] border border-[#FF4F00] text-[#FF4F00] text-[9px] font-mono font-bold px-3 py-1 rounded-full shadow-[0_0_12px_rgba(255,79,0,0.4)] flex items-center gap-1.5 tabular-nums">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-ping" />
                    <span>TARGET EPOCH // 2100</span>
                  </div>
                  <div className="w-[1.5px] h-3 bg-gradient-to-b from-[#FF4F00] to-transparent shadow-[0_0_8px_#FF4F00]" />
                </div>

                {/* 3. Outer Rotating Tick Ring (Clockwise: 0deg -> 180deg) */}
                <motion.div
                  style={{
                    rotate: outerRotation,
                    y: escapementJitter,
                  }}
                  className="absolute inset-4 rounded-full flex items-center justify-center transform-gpu will-change-transform pointer-events-none"
                >
                  <svg
                    viewBox="0 0 500 500"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Concentric Calibration Circles */}
                    <circle cx="250" cy="250" r="236" stroke="#FF4F00" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.6" />
                    <circle cx="250" cy="250" r="220" stroke="#F7F7F5" strokeWidth="1" opacity="0.3" />
                    <circle cx="250" cy="250" r="185" stroke="#FF4F00" strokeWidth="1" strokeDasharray="4 8" opacity="0.4" />

                    {/* 72 Horological Tick Calibrations */}
                    {Array.from({ length: 72 }).map((_, i) => {
                      const angle = (i * 360) / 72;
                      const isMajor = i % 6 === 0;
                      return (
                        <line
                          key={i}
                          x1="250"
                          y1="16"
                          x2="250"
                          y2={isMajor ? "38" : "28"}
                          transform={`rotate(${angle} 250 250)`}
                          strokeWidth={isMajor ? "2" : "1"}
                          stroke={isMajor ? "#FF4F00" : "rgba(247, 247, 245, 0.35)"}
                        />
                      );
                    })}

                    {/* Horology Calibrated Coordinates */}
                    <circle cx="250" cy="46" r="3" fill="#FF4F00" />
                    <circle cx="454" cy="250" r="3" fill="#FF4F00" />
                    <circle cx="250" cy="454" r="3" fill="#FF4F00" />
                    <circle cx="46" cy="250" r="3" fill="#FF4F00" />
                  </svg>
                </motion.div>

                {/* 4. Inner Escapement Gear Ring (Counter-Clockwise: 0deg -> -240deg) */}
                <motion.div
                  style={{
                    rotate: innerRotation,
                  }}
                  className="absolute inset-16 sm:inset-20 rounded-full flex items-center justify-center transform-gpu will-change-transform pointer-events-none"
                >
                  <svg
                    viewBox="0 0 340 340"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="170" cy="170" r="158" stroke="#F7F7F5" strokeWidth="1.2" opacity="0.25" />
                    <circle cx="170" cy="170" r="125" stroke="#FF4F00" strokeWidth="1" opacity="0.4" />

                    {/* 36 Escapement Teeth */}
                    {Array.from({ length: 36 }).map((_, i) => {
                      const angle = (i * 360) / 36;
                      return (
                        <rect
                          key={i}
                          x="168"
                          y="12"
                          width="4"
                          height="14"
                          transform={`rotate(${angle} 170 170)`}
                          fill={i % 3 === 0 ? "#FF4F00" : "rgba(247, 247, 245, 0.45)"}
                        />
                      );
                    })}

                    {/* Balance Arms */}
                    <line x1="170" y1="20" x2="170" y2="320" stroke="#F7F7F5" strokeWidth="1" opacity="0.2" />
                    <line x1="20" y1="170" x2="320" y2="170" stroke="#F7F7F5" strokeWidth="1" opacity="0.2" />
                  </svg>
                </motion.div>

                {/* 5. Center Digital Horology Aperture Window (Fixed Upright - Zero Upside-down Numbers) */}
                <div className="relative z-20 bg-[#0B0B0D]/95 border border-[#FF4F00]/60 px-6 py-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center text-center select-none backdrop-blur-md">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#F7F7F5]/55 font-semibold mb-1">
                    TARGET HORIZON
                  </span>
                  
                  {/* Big Bold Upright Horology Year */}
                  <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#FF4F00] tracking-tight tabular-nums shadow-sm">
                    {horizonYear}
                  </div>

                  <span className="font-mono text-[8px] uppercase tracking-wider text-[#F7F7F5]/65 mt-1 font-medium">
                    LOCKED // VDF-SHA512
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* BOTTOM CHAMBER HOROLOGY STATUS BAR: Borderless & Clean                     */}
          {/* ========================================================================= */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10 text-[11px] font-mono text-[#F7F7F5]/65">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#FF4F00] font-semibold tabular-nums">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-pulse" />
                CHAMBER STATUS: HERMETIC VDF
              </span>
              <span className="hidden md:inline text-[#F7F7F5]/30">|</span>
              <span className="hidden md:inline tabular-nums">SWISS ESCAPEMENT: 28,800 VPH REF</span>
            </div>

            <div className="flex items-center gap-3 mt-2 sm:mt-0 text-[#F7F7F5]/60 tabular-nums">
              <div className="h-1.5 w-32 bg-[#F7F7F5]/15 rounded-full overflow-hidden">
                <motion.div
                  style={{ width: progressLine }}
                  className="h-full bg-[#FF4F00] rounded-full"
                />
              </div>
              <span>VDF SEQUENCE</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
