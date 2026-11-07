"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { PenTool, Lock, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { THREE_STEPS } from "@/lib/data";

export function Act3Steps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const prevStepIndexRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let nextIndex = 0;
    if (latest < 0.33) {
      nextIndex = 0;
    } else if (latest < 0.66) {
      nextIndex = 1;
    } else {
      nextIndex = 2;
    }
    if (nextIndex !== prevStepIndexRef.current) {
      prevStepIndexRef.current = nextIndex;
      setActiveStepIndex(nextIndex);
    }
  });

  const activeStep = THREE_STEPS[activeStepIndex];

  return (
    <section
      ref={containerRef}
      id="act-method"
      data-nav-theme="light"
      className="relative w-full h-[300vh] bg-[#E2E4E6] text-[#141416] overflow-x-clip"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between px-8 md:px-16 lg:px-24 pt-28 pb-10 md:pt-32 max-w-[1520px] mx-auto">
        
        {/* Section Top Status Header - Borderless */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#141416] font-semibold tabular-nums">
              ACT 02 // METHODOLOGY
            </span>
            <span className="text-[#141416]/30">•</span>
            <span className="font-mono text-xs text-[#141416]/75 tabular-nums">
              SPLIT-SCREEN SPATIAL STAGE
            </span>
          </div>

          <div className="font-mono text-xs font-bold text-[#141416] tabular-nums">
            ROW 0{activeStepIndex + 1} OF 03 ACTIVE
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SPLIT-SCREEN STAGE GRID (12 Columns)                                      */}
        {/* ========================================================================= */}
        <div className="relative grid flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-12 py-4">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN (5 Cols): The Horology Index & Giant Rolling Counter        */}
          {/* ----------------------------------------------------------------------- */}
          <div className="col-span-1 lg:col-span-5 flex flex-col justify-between h-full max-h-[520px] py-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#141416]/70 font-semibold tabular-nums">
                  PRECISION CHOREOGRAPHY
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-[#141416] leading-[1.05]">
                Three quiet{" "}
                <span className="font-editorial italic font-light text-[#FF4F00]">
                  steps.
                </span>
              </h2>
              <p className="mt-3 max-w-sm font-sans text-xs sm:text-sm text-[#141416]/75 leading-relaxed">
                Scroll to traverse the spatial stage: each phase unlocks its cryptographic schematic while the active monolith recalibrates in real-time.
              </p>
            </div>

            {/* Giant Rolling Step Counter + 3 Vertical Progress Pills */}
            <div className="flex items-end justify-between pt-6">
              <div className="relative overflow-hidden h-[120px] sm:h-[150px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep.number}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display font-black text-7xl sm:text-9xl text-[#141416] leading-none tracking-tighter tabular-nums select-none transform-gpu will-change-transform"
                  >
                    {activeStep.number}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 3 Minimal Vertical Progress Pills */}
              <div className="flex items-center gap-2.5 pb-2">
                {[0, 1, 2].map((idx) => {
                  const isActive = idx === activeStepIndex;
                  return (
                    <motion.div
                      key={idx}
                      animate={{
                        height: isActive ? 64 : 32,
                        backgroundColor: isActive ? "#FF4F00" : "rgba(20, 20, 22, 0.15)",
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`w-2 rounded-full cursor-pointer transition-shadow ${
                        isActive ? "shadow-[0_0_12px_rgba(255,79,0,0.5)]" : ""
                      }`}
                      onClick={() => setActiveStepIndex(idx)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN (7 Cols): Floating Machined Carbon Monolith Stage          */}
          {/* ----------------------------------------------------------------------- */}
          <div className="col-span-1 lg:col-span-7 flex items-center justify-center">
            <div
              data-cursor-stage="true"
              data-cursor-label="PHASE SPEC"
              className="w-full h-[480px] sm:h-[520px] rounded-[32px] bg-[#141416] text-[#F7F7F5] p-8 md:p-12 shadow-[0_20px_50px_rgba(20,20,22,0.25)] border border-white/10 flex flex-col justify-between relative overflow-hidden transform-gpu will-change-transform"
            >
              
              {/* Subtle Dot-Matrix Background */}
              <div className="pointer-events-none absolute inset-0 opacity-10">
                <div className="h-full w-full bg-[radial-gradient(#F7F7F5_1px,transparent_1px)] [background-size:24px_24px]" />
              </div>

              {/* Top Specular Hairline */}
              <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Stage Content Transition via AnimatePresence */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.number}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex flex-col justify-between h-full transform-gpu will-change-transform"
                >
                  {/* Top Bar inside Stage: Eyebrow Tag + Interactive Schematic */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-[#FF4F00] font-bold tracking-widest uppercase tabular-nums">
                        {activeStep.eyebrow}
                      </span>
                      <span className="text-[#F7F7F5]/30">•</span>
                      <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
                    </div>

                    {/* Upper-Right Quadrant: Animated 3D-Style Technical Schematic */}
                    <div className="relative h-24 w-32 sm:h-28 sm:w-40 rounded-2xl bg-[#09090B] border border-white/10 shadow-inner flex items-center justify-center overflow-hidden">
                      {activeStepIndex === 0 && (
                        <svg className="w-full h-full p-2" viewBox="0 0 160 100" fill="none">
                          <path
                            d="M 10 50 Q 40 20 80 50 T 150 50"
                            stroke="#FF4F00"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            className="animate-pulse"
                          />
                          <path
                            d="M 10 65 Q 50 35 90 65 T 150 65"
                            stroke="#F7F7F5"
                            strokeWidth="1.25"
                            opacity="0.45"
                          />
                          <circle cx="80" cy="50" r="4" fill="#FF4F00" className="animate-ping" />
                          <circle cx="80" cy="50" r="3" fill="#F7F7F5" />
                        </svg>
                      )}

                      {activeStepIndex === 1 && (
                        <svg className="w-full h-full p-2" viewBox="0 0 160 100" fill="none">
                          <circle cx="80" cy="50" r="32" stroke="#FF4F00" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.6" />
                          <circle cx="80" cy="50" r="22" stroke="#F7F7F5" strokeWidth="1" opacity="0.4" />
                          <circle cx="80" cy="50" r="10" fill="#FF4F00" opacity="0.8" />
                          <line x1="80" y1="18" x2="80" y2="82" stroke="#FF4F00" strokeWidth="1" opacity="0.5" />
                          <line x1="48" y1="50" x2="112" y2="50" stroke="#FF4F00" strokeWidth="1" opacity="0.5" />
                        </svg>
                      )}

                      {activeStepIndex === 2 && (
                        <svg className="w-full h-full p-2" viewBox="0 0 160 100" fill="none">
                          <circle cx="80" cy="50" r="36" stroke="#F7F7F5" strokeWidth="1" opacity="0.3" />
                          <circle cx="80" cy="50" r="26" stroke="#FF4F00" strokeWidth="1.5" opacity="0.7" />
                          <circle cx="80" cy="50" r="6" fill="#FF4F00" className="animate-ping" />
                          <line x1="80" y1="50" x2="110" y2="25" stroke="#FF4F00" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="110" cy="25" r="3" fill="#F7F7F5" />
                        </svg>
                      )}

                      <span className="absolute bottom-1 right-2 font-mono text-[7px] text-[#FF4F00] tracking-widest uppercase">
                        SCHEMATIC // VDF
                      </span>
                    </div>
                  </div>

                  {/* Lower-Left Quadrant: Bold Title + Editorial Description */}
                  <div className="my-auto py-4">
                    <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#F7F7F5] tracking-tight leading-tight">
                      {activeStep.title}
                    </h3>
                    <p className="font-editorial italic font-light text-lg sm:text-xl text-[#FF4F00] mt-1 mb-3">
                      {activeStep.subtitle}
                    </p>
                    <p className="font-sans text-xs sm:text-sm text-[#F7F7F5]/80 leading-relaxed max-w-lg">
                      {activeStep.description}
                    </p>
                  </div>

                  {/* Sleek Recessed Telemetry Bar at Bottom */}
                  <div className="bg-[#09090B] border border-white/10 px-5 py-3 rounded-2xl flex items-center justify-between font-mono text-[10px] text-[#F7F7F5]/65 tabular-nums shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-pulse" />
                      <span>{activeStep.technicalTag}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#F7F7F5]/50">
                      <ShieldCheck className="h-3 w-3 text-[#FF4F00]" />
                      <span>SWISS OBSERVATORY AUDIT</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
