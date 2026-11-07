"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { MagneticButton } from "./ui/MagneticButton";
import { CipherTypewriter } from "./ui/CipherTypewriter";
import { InteractiveWordwall } from "./ui/InteractiveWordwall";
import { GlitchText } from "./ui/GlitchText";

// Dynamic client import for WebGL Three.js Canvas to guarantee zero SSR hydration issues
const TourbillonArtifact = dynamic(
  () => import("./TourbillonArtifact"),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] rounded-full border border-[#D4D7DA]/60 bg-[#141416]/5 animate-pulse flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-[#FF4F00] shadow-[0_0_12px_#FF4F00]" />
        </div>
      </div>
    ),
  }
);

export function Act0Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollValRef = useRef(0);
  const prevYearRef = useRef(2026);
  const [odometerYear, setOdometerYear] = useState("2026.00");
  const [isOutOfView, setIsOutOfView] = useState(false);
  const prevOutOfViewRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track raw scroll progress for Three.js camera dive (ZERO React re-renders)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    scrollValRef.current = latest;
    const outOfView = latest > 0.98;
    if (outOfView !== prevOutOfViewRef.current) {
      prevOutOfViewRef.current = outOfView;
      setIsOutOfView(outOfView);
    }
  });

  // Kinetic scroll velocity for subtle inertia
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 40,
    stiffness: 300,
  });
  const velocitySkew = useTransform(smoothVelocity, [-1, 1], [-1.5, 1.5]);

  // Smooth Crossfade to Carbon Chamber (#141416) on scroll
  const bgFadeToDark = useTransform(scrollYProgress, [0.35, 0.8], [0, 1]);

  // Foreground Framing Typography: fade out smoothly with subtle vertical parallax (0% -> 55%)
  const framingTextOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const framingTextY = useTransform(scrollYProgress, [0, 0.45], [0, -40]);

  // Central Chamber Dilated Readout (appears as camera passes through the artifact into deep vault)
  const chamberContentOpacity = useTransform(scrollYProgress, [0.65, 0.9], [0, 1]);

  // Central Odometer (2026.00 -> 2100.00) — ONLY updates state when integer changes
  const odometerProgress = useTransform(
    scrollYProgress,
    [0.4, 0.95],
    [2026, 2100]
  );

  useMotionValueEvent(odometerProgress, "change", (latest) => {
    const val = Math.min(2100, Math.max(2026, latest));
    const rounded = Math.round(val);
    if (rounded !== prevYearRef.current) {
      prevYearRef.current = rounded;
      setOdometerYear(`${rounded}.00`);
    }
  });

  const scrollToMethod = () => {
    const el = document.getElementById("act-method");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToVault = () => {
    const el = document.getElementById("seal-lock");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      id="act-hero"
      data-nav-theme="light"
      className="relative w-full h-[280vh] bg-[#E2E4E6] text-[#141416] overflow-x-clip"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between">
        
        {/* ========================================================================= */}
        {/* 1. SEAMLESS BACKGROUND CROSSFADE: TITANIUM (#E2E4E6) -> CARBON (#141416)  */}
        {/* ========================================================================= */}
        <motion.div
          style={{ opacity: bgFadeToDark }}
          className="absolute inset-0 bg-[#141416] pointer-events-none z-0"
        />

        {/* Ambient Signal Orange Glow Behind Artifact */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,79,0,0.14)_0%,transparent_70%)] pointer-events-none z-0" />

        {/* ========================================================================= */}
        {/* INTERACTIVE TITANIUM MEMORY WORDWALL (Background Layer z-0)               */}
        {/* ========================================================================= */}
        <InteractiveWordwall variant="hero" />

        {/* ========================================================================= */}
        {/* 2. CENTER STAGE (z-10): FULL-VIEWPORT 3D WEBGL TOURBILLON ARTIFACT        */}
        {/* Unobstructed: No text collisions across the central face                  */}
        {/* ========================================================================= */}
        <div
          data-cursor-stage="true"
          data-cursor-label="DRAG // ORBIT"
          className="absolute inset-0 z-10 h-full w-full pointer-events-auto"
        >
          <TourbillonArtifact
            scrollProgressRef={scrollValRef}
            isOutOfView={isOutOfView}
          />
        </div>

        {/* Dilated Chamber Center Readout (fades in as camera dives through into Carbon Chamber) */}
        <motion.div
          style={{ opacity: chamberContentOpacity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-15 flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#FF4F00] font-semibold mb-2 tabular-nums">
            TEMPORAL APERTURE // DILATED
          </span>
          <div className="font-mono text-4xl sm:text-6xl font-bold tracking-tight text-[#F7F7F5] tabular-nums">
            {odometerYear}
          </div>
          <span className="mt-2 font-sans text-[11px] tracking-wider text-[#F7F7F5]/60 uppercase">
            ENTERING THE IMMUTABLE VAULT
          </span>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. FOREGROUND EDITORIAL LAYOUT (z-20): CLEAN SWISS PRECISION              */}
        {/* ========================================================================= */}
        <div className="relative z-20 flex h-full w-full flex-col justify-between px-6 pt-28 pb-8 md:px-12 md:pt-32 md:pb-10 pointer-events-none">
          
          {/* Top Status Bar */}
          <motion.div
            style={{ opacity: framingTextOpacity }}
            className="flex items-center justify-between pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-[#141416]/85 uppercase font-semibold tabular-nums">
                ACT 00 // INITIATION
              </span>
              <span className="text-[#141416]/30">/</span>
              <span className="font-mono text-[10px] text-[#141416]/75 font-medium tabular-nums">
                3D TOURBILLON MONOLITH
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#141416]/85 uppercase tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-pulse" />
              <CipherTypewriter
                text="APERTURE: ALIGNED 46.2044° N"
                oneShot={true}
                charSpeed={15}
                showCursor={false}
              />
            </div>
          </motion.div>

          {/* Main Framing Grid */}
          <motion.div
            style={{
              opacity: framingTextOpacity,
              y: framingTextY,
              skewX: velocitySkew,
            }}
            className="relative flex flex-1 flex-col justify-between py-4 select-none"
          >
            {/* --------------------------------------------------------------------- */}
            {/* TOP-LEFT ARCHITECTURAL LOCKUP: PRESERVE + the unseen.                */}
            {/* --------------------------------------------------------------------- */}
            <div className="flex flex-col items-start max-w-xl">
              <CipherTypewriter
                text="00 // TEMPORAL DEPOSITORY"
                oneShot={true}
                charSpeed={15}
                showCursor={false}
                className="font-mono text-[11px] tracking-widest text-[#FF4F00] font-bold uppercase mb-2 tabular-nums"
              />
              <GlitchText
                as="h1"
                text="Preserve"
                cursorLabel="SCRAMBLE"
                className="font-display font-black text-[clamp(3.2rem,7.5vw,7.5rem)] tracking-[-0.04em] leading-none text-[#141416] uppercase"
              />
              <CipherTypewriter
                phrases={[
                  "the unseen.",
                  "unsent letters.",
                  "midnight vows.",
                  "first heartbeats.",
                  "future promises.",
                ]}
                cycleInterval={3600}
                charSpeed={45}
                cursorColor="#141416"
                className="font-editorial italic font-light text-[clamp(2.5rem,5vw,5rem)] text-[#FF4F00] leading-none mt-1 select-none"
              />
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* BOTTOM-RIGHT COUNTER LOCKUP: EPOCH BADGE + FOREVER                    */}
            {/* --------------------------------------------------------------------- */}
            <div className="flex flex-col items-end self-end">
              {/* Sleek Machined Digital Badge directly above FOREVER */}
              <div className="mb-2">
                <div className="bg-[#141416] text-[#F7F7F5] px-4 py-1.5 rounded-full font-mono text-xs tracking-widest inline-flex items-center gap-2 shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-pulse" />
                  <CipherTypewriter
                    text="EPOCH // 2026 — 2100"
                    oneShot={true}
                    charSpeed={15}
                    showCursor={false}
                  />
                </div>
              </div>

              <GlitchText
                as="div"
                text="Forever"
                cursorLabel="SCRAMBLE"
                className="font-display font-black text-[clamp(3.2rem,7.5vw,7.5rem)] tracking-[-0.04em] leading-none text-[#141416] uppercase text-right"
              />
            </div>
          </motion.div>

          {/* ----------------------------------------------------------------------- */}
          {/* BOTTOM-LEFT DESCRIPTION & MAGNETIC CTAs + SCROLL INDICATOR             */}
          {/* ----------------------------------------------------------------------- */}
          <motion.div
            style={{ opacity: framingTextOpacity }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pointer-events-auto border-t border-[#141416]/10 pt-5"
          >
            <div className="max-w-md">
              <p className="font-sans text-xs sm:text-sm text-[#141416]/75 leading-relaxed mb-4">
                A spatial depository where vows, confessions, and architectural memories are sealed into cryptographic monoliths until designated future epochs.
              </p>
              <div className="flex items-center gap-3">
                <MagneticButton
                  onClick={scrollToVault}
                  data-cursor-label="FORGE"
                  className="bg-[#141416] text-[#F7F7F5] px-6 py-2.5 rounded-full font-mono text-xs font-semibold tracking-wider hover:bg-[#FF4F00] hover:text-[#141416] transition-colors shadow-md flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00]" />
                  <span>FORGE LOCK +</span>
                </MagneticButton>
                <MagneticButton
                  onClick={scrollToMethod}
                  data-cursor-label="HOW IT WORKS"
                  className="border border-[#141416]/40 text-[#141416] px-6 py-2.5 rounded-full font-mono text-xs font-semibold tracking-wider hover:border-[#141416] hover:bg-[#141416]/5 transition-colors"
                >
                  HOW IT WORKS
                </MagneticButton>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="flex items-center gap-3 font-mono text-[10px] text-[#141416]/65 uppercase tracking-wider tabular-nums">
              <div className="flex flex-col items-end">
                <span className="font-semibold text-[#141416]">SCROLL TO DILATE</span>
                <span className="text-[9px] text-[#141416]/45">ACT 00 → ACT 01</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141416]/25 bg-[#E2E4E6]">
                <ArrowDown className="h-3.5 w-3.5 text-[#FF4F00] animate-bounce" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}