"use client";

import React, { useEffect, useRef } from "react";

interface InteractiveWordwallProps {
  variant?: "hero" | "dark";
  className?: string;
}

const HERO_TOKENS = [
  { word: "SOLSTICE", x: 62, y: 12 },
  { word: "TESTAMENT", x: 78, y: 15 },
  { word: "2036", x: 92, y: 22 },
  { word: "HERITAGE", x: 68, y: 26 },
  { word: "CONFESSION", x: 6, y: 42 },
  { word: "2045", x: 18, y: 46 },
  { word: "COVENANT", x: 84, y: 42 },
  { word: "VOICE NOTE", x: 94, y: 52 },
  { word: "2060", x: 8, y: 62 },
  { word: "FIRST SNOW", x: 22, y: 66 },
  { word: "IMMUTABLE", x: 12, y: 78 },
  { word: "2085", x: 28, y: 74 },
  { word: "LINEAGE", x: 66, y: 78 },
  { word: "ANALOG MEMORY", x: 50, y: 90 },
  { word: "2100", x: 48, y: 8 },
  { word: "EPHEMERIS", x: 82, y: 64 },
];

const DARK_ROWS = [
  {
    direction: "left",
    duration: "42s",
    words: [
      { text: "UNSENT LETTERS", italic: false },
      { text: "first heartbeat", italic: true },
      { text: "✦ 2040 // FOR MY DAUGHTER", pill: true },
      { text: "2045", italic: false },
      { text: "MIDNIGHT PROMISES", italic: false },
      { text: "the unseen", italic: true },
      { text: "VOICE NOTES", italic: false },
      { text: "2080", italic: false },
    ],
  },
  {
    direction: "right",
    duration: "36s",
    words: [
      { text: "TO MY FUTURE SELF", italic: false },
      { text: "summer 2026", italic: true },
      { text: "✦ 2051 // THE PROMISE AT 19", pill: true },
      { text: "FAMILY LEGACY", italic: false },
      { text: "SECRET CONFESSIONS", italic: false },
      { text: "analog memories", italic: true },
      { text: "2100", italic: false },
    ],
  },
  {
    direction: "left",
    duration: "48s",
    words: [
      { text: "FORGOTTEN MELODIES", italic: false },
      { text: "2045", italic: false },
      { text: "✦ 2036 // COASTAL CABIN", pill: true },
      { text: "generational covenant", italic: true },
      { text: "THE UNSEEN", italic: false },
      { text: "UNSENT LETTERS", italic: false },
      { text: "first heartbeat", italic: true },
    ],
  },
  {
    direction: "right",
    duration: "40s",
    words: [
      { text: "MIDNIGHT PROMISES", italic: false },
      { text: "voice notes", italic: true },
      { text: "✦ 2040 // FOR MY DAUGHTER", pill: true },
      { text: "2080", italic: false },
      { text: "TO MY FUTURE SELF", italic: false },
      { text: "summer 2026", italic: true },
      { text: "FAMILY LEGACY", italic: false },
    ],
  },
  {
    direction: "left",
    duration: "44s",
    words: [
      { text: "SECRET CONFESSIONS", italic: false },
      { text: "2100", italic: false },
      { text: "✦ 2051 // THE PROMISE AT 19", pill: true },
      { text: "analog memories", italic: true },
      { text: "FORGOTTEN MELODIES", italic: false },
      { text: "GENERATIONAL COVENANT", italic: false },
      { text: "the unseen", italic: true },
    ],
  },
];

export function InteractiveWordwall({
  variant = "hero",
  className = "",
}: InteractiveWordwallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // -------------------------------------------------------------
  // HERO VARIANT: Cursor-Proximity Reactive Wordfield (< 150px)
  // Zero React Re-Renders: Directly mutates transforms in RAF
  // -------------------------------------------------------------
  useEffect(() => {
    if (variant !== "hero") return;

    let animFrame: number;
    let mouseX = -1000;
    let mouseY = -1000;

    const handlePointerMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updatePhysics = () => {
      tokenRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
        const radius = 150;

        if (dist < radius) {
          const factor = 1 - dist / radius; // 0 to 1
          const angle = Math.atan2(centerY - mouseY, centerX - mouseX);
          const push = factor * 12; // 0px to 12px shift away
          const dx = Math.cos(angle) * push;
          const dy = Math.sin(angle) * push;
          const scale = 1 + factor * 0.08;

          el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
          if (factor > 0.45) {
            el.style.color = "#FF4F00";
            el.style.opacity = "0.95";
          } else {
            el.style.color = "#141416";
            el.style.opacity = (0.055 + factor * 0.7).toFixed(3);
          }
        } else {
          // Smooth return to resting state
          el.style.transform = "translate3d(0, 0, 0) scale(1)";
          el.style.color = "";
          el.style.opacity = "";
        }
      });

      animFrame = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    animFrame = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animFrame);
    };
  }, [variant]);

  // -------------------------------------------------------------
  // FOOTER DARK VARIANT: Spotlight Mask Revealed Under Cursor
  // -------------------------------------------------------------
  if (variant === "dark") {
    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      >
        {/* Base Layer: 5% Subtle Embossed Silhouette */}
        <div className="absolute inset-0 flex flex-col justify-around py-6 text-[#F7F7F5]/[0.05]">
          {DARK_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="w-full overflow-hidden flex items-center">
              <div
                className={`flex whitespace-nowrap min-w-full ${
                  row.direction === "left"
                    ? "animate-marquee-left"
                    : "animate-marquee-right"
                }`}
                style={{ animationDuration: row.duration }}
              >
                <DarkRowContent items={row.words} illuminated={false} />
                <DarkRowContent items={row.words} illuminated={false} />
              </div>
            </div>
          ))}
        </div>

        {/* Illuminated Layer: Masked under cursor via --spot-x & --spot-y */}
        <div
          className="absolute inset-0 flex flex-col justify-around py-6 text-[#F7F7F5]"
          style={{
            maskImage:
              "radial-gradient(350px circle at var(--spot-x, 50%) var(--spot-y, 40%), black 0%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(350px circle at var(--spot-x, 50%) var(--spot-y, 40%), black 0%, transparent 100%)",
          }}
        >
          {DARK_ROWS.map((row, rIdx) => (
            <div key={`spot-${rIdx}`} className="w-full overflow-hidden flex items-center">
              <div
                className={`flex whitespace-nowrap min-w-full ${
                  row.direction === "left"
                    ? "animate-marquee-left"
                    : "animate-marquee-right"
                }`}
                style={{ animationDuration: row.duration }}
              >
                <DarkRowContent items={row.words} illuminated={true} />
                <DarkRowContent items={row.words} illuminated={true} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HERO LIGHT VARIANT: Architectural Grid of Titanium Memory Tokens
  // -------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      {HERO_TOKENS.map((token, i) => (
        <span
          key={token.word}
          ref={(el) => {
            tokenRefs.current[i] = el;
          }}
          style={{
            left: `${token.x}%`,
            top: `${token.y}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-xs md:text-sm tracking-[0.22em] uppercase text-[#141416]/[0.055] transition-[color,opacity] duration-300 transform-gpu will-change-transform pointer-events-auto cursor-default"
        >
          {token.word}
        </span>
      ))}
    </div>
  );
}

function DarkRowContent({
  items,
  illuminated,
}: {
  items: { text: string; italic?: boolean; pill?: boolean }[];
  illuminated: boolean;
}) {
  return (
    <div className="flex items-center shrink-0">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.pill ? (
            <span
              className={`inline-flex items-center gap-1.5 font-mono text-xs md:text-sm px-4 py-1.5 rounded-full mx-4 align-middle shrink-0 border transition-colors ${
                illuminated
                  ? "border-[#FF4F00] bg-[#FF4F00]/20 text-[#FF4F00] shadow-[0_0_14px_rgba(255,79,0,0.5)]"
                  : "border-white/10 bg-white/5 text-[#F7F7F5]/40"
              }`}
            >
              {item.text}
            </span>
          ) : item.italic ? (
            <span
              className={`font-editorial italic font-light text-4xl sm:text-5xl md:text-6xl mx-4 shrink-0 transition-colors ${
                illuminated ? "text-[#FF4F00]" : ""
              }`}
            >
              {item.text}
            </span>
          ) : (
            <span className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mx-4 shrink-0">
              {item.text}
            </span>
          )}

          <span className="opacity-30 mx-3 shrink-0">✦</span>
        </React.Fragment>
      ))}
    </div>
  );
}

