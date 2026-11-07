"use client";

import React, { useState, useRef } from "react";

interface GlitchTextProps {
  text: string;
  as?: "h1" | "h2" | "div" | "span";
  className?: string;
  glitchColor?: string;
  cursorLabel?: string;
  scrambleSteps?: string[];
}

export function GlitchText({
  text,
  as: Component = "div",
  className = "",
  glitchColor = "#FF4F00",
  cursorLabel = "GLITCH",
  scrambleSteps,
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  // Default cryptographic glyph scramble steps
  const steps = scrambleSteps || [
    text.toUpperCase(),
    text
      .toUpperCase()
      .replace(/E/g, "Ξ")
      .replace(/O/g, "Ø")
      .replace(/A/g, "4")
      .replace(/I/g, "1")
      .replace(/S/g, "5"),
    text
      .toUpperCase()
      .replace(/E/g, "3")
      .replace(/O/g, "0")
      .replace(/A/g, "∆")
      .replace(/T/g, "7")
      .replace(/R/g, "®"),
    text.split("").join(" "),
    text,
  ];

  const triggerGlitch = () => {
    setIsGlitching(true);
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    steps.forEach((step, idx) => {
      const timer = setTimeout(() => {
        setDisplayText(step);
        if (idx === steps.length - 1) {
          setIsGlitching(false);
        }
      }, (idx + 1) * 45);
      timerRef.current.push(timer);
    });
  };

  const handleMouseLeave = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setDisplayText(text);
    setIsGlitching(false);
  };

  return (
    <Component
      onMouseEnter={triggerGlitch}
      onMouseLeave={handleMouseLeave}
      onClick={triggerGlitch}
      data-cursor-label={cursorLabel}
      className={`group relative inline-block select-none cursor-pointer overflow-visible ${className}`}
    >
      {/* Base Layer (Primary Ink) */}
      <span className="relative z-10 block transition-transform duration-200 group-hover:scale-[1.01]">
        {displayText}
      </span>

      {/* Chromatic Aberration Glitch Layer 1 (Signal Orange / #FF4F00) */}
      <span
        aria-hidden="true"
        style={{ color: glitchColor }}
        className={`absolute inset-0 z-0 block pointer-events-none select-none opacity-90 ${
          isGlitching
            ? "animate-hero-glitch-active-1"
            : "animate-hero-glitch-ambient-1 group-hover:animate-hero-glitch-active-1"
        }`}
      >
        {displayText}
      </span>

      {/* Chromatic Aberration Glitch Layer 2 (High-Contrast White / Carbon Slice) */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 z-0 block pointer-events-none select-none mix-blend-difference text-white opacity-80 ${
          isGlitching
            ? "animate-hero-glitch-active-2"
            : "animate-hero-glitch-ambient-2 group-hover:animate-hero-glitch-active-2"
        }`}
      >
        {displayText}
      </span>

      {/* Keyframe Styles for Horizontal Clip-Path Slice Glitch */}
      <style jsx>{`
        @keyframes heroGlitch1 {
          0%, 86%, 100% {
            clip-path: inset(0 0 0 0);
            transform: translate(0, 0);
            opacity: 0;
          }
          88% {
            clip-path: inset(26% 0 46% 0);
            transform: translate(-5px, 1px);
            opacity: 0.95;
          }
          91% {
            clip-path: inset(64% 0 10% 0);
            transform: translate(5px, -1px);
            opacity: 0.9;
          }
          94% {
            clip-path: inset(10% 0 70% 0);
            transform: translate(-3px, 0.5px);
            opacity: 0.95;
          }
          97% {
            clip-path: inset(44% 0 34% 0);
            transform: translate(4px, -0.5px);
            opacity: 0.9;
          }
        }

        @keyframes heroGlitch2 {
          0%, 84%, 100% {
            clip-path: inset(0 0 0 0);
            transform: translate(0, 0);
            opacity: 0;
          }
          87% {
            clip-path: inset(50% 0 26% 0);
            transform: translate(4px, -1px);
            opacity: 0.85;
          }
          90% {
            clip-path: inset(16% 0 62% 0);
            transform: translate(-5px, 1px);
            opacity: 0.9;
          }
          93% {
            clip-path: inset(74% 0 12% 0);
            transform: translate(3px, -0.5px);
            opacity: 0.85;
          }
          96% {
            clip-path: inset(34% 0 44% 0);
            transform: translate(-3px, 0.5px);
            opacity: 0.85;
          }
        }

        .animate-hero-glitch-ambient-1 {
          animation: heroGlitch1 4.5s infinite linear alternate;
        }

        .animate-hero-glitch-ambient-2 {
          animation: heroGlitch2 4.5s infinite linear alternate;
        }

        .animate-hero-glitch-active-1 {
          animation: heroGlitch1 0.35s infinite linear alternate;
        }

        .animate-hero-glitch-active-2 {
          animation: heroGlitch2 0.35s infinite linear alternate;
        }
      `}</style>
    </Component>
  );
}

