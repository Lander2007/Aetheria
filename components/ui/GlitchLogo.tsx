"use client";

import React, { useState, useRef } from "react";

const SCRAMBLE_STEPS = [
  "AETHERIA",
  "Æ7HΞR1A",
  "A3TH3R!A",
  "Aeth3r1a",
  "Aetheria",
];

export function GlitchLogo() {
  const [displayText, setDisplayText] = useState("Aetheria");
  const [isGlitching, setIsGlitching] = useState(false);
  const scrambleTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Rapid 180ms character scramble on hover (AETHERIA -> Æ7HΞR1A -> Aetheria®)
  const handleMouseEnter = () => {
    setIsGlitching(true);
    // Clear any pending timers
    scrambleTimerRef.current.forEach(clearTimeout);
    scrambleTimerRef.current = [];

    SCRAMBLE_STEPS.forEach((step, idx) => {
      const timer = setTimeout(() => {
        setDisplayText(step);
        if (idx === SCRAMBLE_STEPS.length - 1) {
          setIsGlitching(false);
        }
      }, (idx + 1) * 36);
      scrambleTimerRef.current.push(timer);
    });
  };

  const handleMouseLeave = () => {
    scrambleTimerRef.current.forEach(clearTimeout);
    scrambleTimerRef.current = [];
    setDisplayText("Aetheria");
    setIsGlitching(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex items-center select-none cursor-pointer"
    >
      {/* Clean Single-Line Footprint: Crisp Glitch Wordmark */}
      <div className="relative inline-block overflow-visible leading-none">
        {/* Base Layer in Crisp Paper Chalk (#F7F7F5) */}
        <span className="relative z-10 font-display text-lg font-black tracking-[-0.04em] text-[#F7F7F5] transition-colors group-hover:text-white">
          {displayText}
          <span className="text-xs align-super font-mono text-[#FF4F00] opacity-80 ml-0.5">
            ®
          </span>
        </span>

        {/* Chromatic Aberration Glitch Layer 1 (#FF4F00 Signal Orange) */}
        <span
          aria-hidden="true"
          className={`absolute top-0 left-0 z-0 font-display text-lg font-black tracking-[-0.04em] text-[#FF4F00] pointer-events-none select-none ${
            isGlitching
              ? "animate-glitch-active-1"
              : "animate-glitch-ambient-1 group-hover:animate-glitch-active-1"
          }`}
        >
          {displayText}
          <span className="text-xs align-super font-mono ml-0.5 opacity-90 text-[#FF4F00]">
            ®
          </span>
        </span>

        {/* Chromatic Aberration Glitch Layer 2 (#F7F7F5 White Slice) */}
        <span
          aria-hidden="true"
          className={`absolute top-0 left-0 z-0 font-display text-lg font-black tracking-[-0.04em] text-[#F7F7F5] pointer-events-none select-none opacity-80 ${
            isGlitching
              ? "animate-glitch-active-2"
              : "animate-glitch-ambient-2 group-hover:animate-glitch-active-2"
          }`}
        >
          {displayText}
          <span className="text-xs align-super font-mono ml-0.5 opacity-90 text-[#FF4F00]">
            ®
          </span>
        </span>
      </div>

      {/* Keyframe Styles for Horizontal Clip-Path Slice Glitch */}
      <style jsx>{`
        @keyframes glitchSlice1 {
          0%, 86%, 100% {
            clip-path: inset(0 0 0 0);
            transform: translate(0, 0);
            opacity: 0;
          }
          88% {
            clip-path: inset(22% 0 52% 0);
            transform: translate(-3px, 0.5px);
            opacity: 0.95;
          }
          91% {
            clip-path: inset(62% 0 12% 0);
            transform: translate(3px, -0.5px);
            opacity: 0.9;
          }
          94% {
            clip-path: inset(8% 0 74% 0);
            transform: translate(-2px, 0);
            opacity: 0.95;
          }
          97% {
            clip-path: inset(42% 0 38% 0);
            transform: translate(2.5px, 0.5px);
            opacity: 0.9;
          }
        }

        @keyframes glitchSlice2 {
          0%, 84%, 100% {
            clip-path: inset(0 0 0 0);
            transform: translate(0, 0);
            opacity: 0;
          }
          87% {
            clip-path: inset(48% 0 28% 0);
            transform: translate(3px, -0.5px);
            opacity: 0.85;
          }
          90% {
            clip-path: inset(14% 0 64% 0);
            transform: translate(-3px, 0.5px);
            opacity: 0.9;
          }
          93% {
            clip-path: inset(72% 0 14% 0);
            transform: translate(2px, -0.5px);
            opacity: 0.85;
          }
          96% {
            clip-path: inset(32% 0 46% 0);
            transform: translate(-2.5px, 0);
            opacity: 0.85;
          }
        }

        .animate-glitch-ambient-1 {
          animation: glitchSlice1 4.5s infinite linear alternate;
        }

        .animate-glitch-ambient-2 {
          animation: glitchSlice2 4.5s infinite linear alternate;
        }

        .animate-glitch-active-1 {
          animation: glitchSlice1 0.4s infinite linear alternate;
        }

        .animate-glitch-active-2 {
          animation: glitchSlice2 0.4s infinite linear alternate;
        }
      `}</style>
    </div>
  );
}
