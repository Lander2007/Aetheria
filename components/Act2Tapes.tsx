"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";

export function Act2Tapes() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  // Dynamic skew and offset based on scroll
  const tape1X = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const tape2X = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);

  const repeatedText1 =
    "TIME-LOCKED DEPOSITORY ✦ ZERO PREMATURE ACCESS ✦ ARCHIVAL FIDELITY ✦ VERIFIABLE DELAY FUNCTION ✦ HOROLOGICAL HERITAGE ✦ ";
  const repeatedText2 =
    "✦ CRYPTOGRAPHIC MONOLITHS ✦ IMMUTABLE WITNESS ✦ SOLSTICE RELEASE ✦ DISTRIBUTED TIMESTAMP ✦ PRESERVE THE UNSEEN ✦ ";

  return (
    <section
      ref={containerRef}
      className="relative h-[260px] w-full overflow-hidden bg-[#E2E4E6] py-10 flex items-center justify-center select-none"
    >
      {/* Background Architectural Markings */}
      <div className="absolute inset-0 flex items-center justify-between px-12 pointer-events-none opacity-25">
        <span className="font-mono text-xs uppercase tracking-widest text-[#141416] font-semibold tabular-nums">
          TRANSITION // TEMPORAL INTERLOCK
        </span>
        <span className="font-mono text-xs text-[#141416] font-semibold tabular-nums">
          46.2044° N, 6.1432° E
        </span>
      </div>

      {/* Ribbon 1: -3.5deg Signal Orange (#FF4F00) with Carbon Matte (#141416) text */}
      <motion.div
        style={{
          rotate: -3.5,
          x: tape1X,
        }}
        className="absolute w-[160vw] -left-[30vw] z-10 flex items-center bg-[#FF4F00] py-3.5 shadow-[0_15px_35px_rgba(255,79,0,0.35)] transform-gpu will-change-transform"
      >
        <div className="flex whitespace-nowrap animate-marquee-left">
          <span className="font-mono text-sm md:text-base font-bold tracking-[0.2em] text-[#141416] tabular-nums">
            {repeatedText1.repeat(4)}
          </span>
        </div>
      </motion.div>

      {/* Ribbon 2: +3.5deg Carbon Matte (#141416) with Chalk (#F7F7F5) text & Carbon border */}
      <motion.div
        style={{
          rotate: 3.5,
          x: tape2X,
        }}
        className="absolute w-[160vw] -left-[30vw] z-20 flex items-center border-y-2 border-[#141416] bg-[#141416] py-3.5 shadow-[0_15px_30px_rgba(20,20,22,0.3)] transform-gpu will-change-transform"
      >
        <div className="flex whitespace-nowrap animate-marquee-right">
          <span className="font-mono text-sm md:text-base font-bold tracking-[0.2em] text-[#F7F7F5] tabular-nums">
            {repeatedText2.repeat(4)}
          </span>
        </div>
      </motion.div>
    </section>
  );
}
