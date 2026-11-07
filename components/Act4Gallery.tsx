"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useVelocity,
  useSpring,
} from "framer-motion";
import { Lock, Clock, ArrowRight, Shield, Sparkles, ExternalLink } from "lucide-react";
import { INITIAL_CAPSULES } from "@/lib/data";
import { TimeCapsule } from "@/lib/types";
import { CapsuleModal } from "./CapsuleModal";
import { MagneticButton } from "./ui/MagneticButton";

interface Act4GalleryProps {
  customCapsules?: TimeCapsule[];
}

export function Act4Gallery({ customCapsules = [] }: Act4GalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);

  const allCapsules = [...customCapsules, ...INITIAL_CAPSULES];
  const totalCount = allCapsules.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Scroll velocity physics
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 300,
  });
  const spineTilt = useTransform(smoothVelocity, [-1, 1], [-3, 3]);

  // Year odometer background progression
  const yearOdometerVal = useTransform(
    scrollYProgress,
    [0, 1],
    [2031, 2051]
  );
  const [displayYear, setDisplayYear] = useState(2031);
  const prevDisplayYearRef = useRef(2031);
  const prevCardIndexRef = useRef(0);

  useMotionValueEvent(yearOdometerVal, "change", (latest) => {
    const rounded = Math.round(latest);
    if (rounded !== prevDisplayYearRef.current) {
      prevDisplayYearRef.current = rounded;
      setDisplayYear(rounded);
    }
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const calculatedIndex = Math.min(
      totalCount - 1,
      Math.max(0, Math.floor(latest * totalCount))
    );
    if (calculatedIndex !== prevCardIndexRef.current) {
      prevCardIndexRef.current = calculatedIndex;
      setActiveCardIndex(calculatedIndex);
    }
  });

  return (
    <>
      <section
        ref={containerRef}
        id="act-archive"
        data-nav-theme="light"
        className="relative w-full h-[380vh] bg-[#E2E4E6] text-[#141416] overflow-x-clip"
      >
        {/* Sticky Viewport with 3D Spatial Perspective */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between px-6 pt-28 pb-8 md:px-16 lg:px-24 md:pt-32 perspective-1400">
          
          {/* Giant 24vw Background Year Odometer with Metallic Outline Stroke */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 select-none">
            <span
              className="font-display font-black text-[24vw] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#141416]/[0.07] to-transparent tracking-tighter tabular-nums"
              style={{
                WebkitTextStroke: "1.5px rgba(20, 20, 22, 0.08)",
              }}
            >
              {displayYear}
            </span>
          </div>

          {/* Central Vertical Timeline Laser Spine */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-5">
            <motion.div
              style={{ rotate: spineTilt }}
              className="relative h-full w-[2px] bg-gradient-to-b from-transparent via-[#FF4F00]/50 to-transparent flex flex-col items-center justify-around"
            >
              {allCapsules.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full border border-[#141416] transition-colors duration-300 ${
                    i === activeCardIndex ? "bg-[#FF4F00] scale-150 animate-ping" : "bg-[#141416]/40"
                  }`}
                />
              ))}
            </motion.div>
          </div>

          {/* Section Header - Borderless & Clean */}
          <div className="relative z-20 flex flex-col md:flex-row md:items-end justify-between pb-2 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="font-mono text-xs uppercase tracking-widest text-[#141416] font-semibold tabular-nums">
                  ACT 03 // SPATIAL ARCHIVE
                </span>
                <span className="text-[#141416]/30">•</span>
                <span className="font-mono text-xs text-[#141416]/75 tabular-nums">
                  Z-AXIS PERSPECTIVE TUNNEL
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#141416]">
                Capsules from the <span className="font-editorial italic font-light text-[#FF4F00]">future.</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Year Filter Pills with Magnetic Interaction */}
              <div className="hidden lg:flex items-center gap-1.5 bg-[#141416]/5 p-1 rounded-full border border-[#141416]/10">
                {allCapsules.slice(0, 4).map((c, i) => (
                  <MagneticButton
                    key={c.id}
                    magneticStrength={0.4}
                    onClick={() => setActiveCardIndex(i)}
                    className={`px-3 py-1 rounded-full font-mono text-[10px] font-semibold transition-colors ${
                      i === activeCardIndex
                        ? "bg-[#141416] text-[#FF4F00]"
                        : "text-[#141416]/70 hover:text-[#141416]"
                    }`}
                  >
                    {c.year}
                  </MagneticButton>
                ))}
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-[#141416]/75 tabular-nums">
                <span className="rounded-full bg-[#141416] px-3 py-1 text-[11px] font-bold text-[#F7F7F5]">
                  {totalCount} DEPOSITS SEALED
                </span>
              </div>
            </div>
          </div>

          {/* Center 3D Tunnel Area */}
          <div className="relative z-20 flex-1 flex items-center justify-center w-full transform-style-3d">
            {allCapsules.map((capsule, index) => {
              const isActive = index === activeCardIndex;
              const isPast = index < activeCardIndex;
              const isUpcoming = index > activeCardIndex;
              const isLeft = index % 2 === 0;

              let cardY = 0;
              let cardScale = 1;
              let cardOpacity = 1;
              let cardZIndex = 30;

              if (isActive) {
                cardY = 0;
                cardScale = 1;
                cardOpacity = 1;
                cardZIndex = 30;
              } else if (isPast) {
                cardY = -140;
                cardScale = 1.08;
                cardOpacity = 0;
                cardZIndex = 10;
              } else if (isUpcoming) {
                const diff = index - activeCardIndex;
                cardY = diff * 50;
                cardScale = Math.max(0.5, 1 - diff * 0.15);
                cardOpacity = diff === 1 ? 0.45 : 0;
                cardZIndex = 30 - diff * 5;
              }

              return (
                <motion.div
                  key={capsule.id}
                  data-capsule-card="true"
                  data-cursor-label={`OPEN ${capsule.year} ↗`}
                  onClick={() => setSelectedCapsule(capsule)}
                  animate={{
                    y: cardY,
                    scale: cardScale,
                    opacity: cardOpacity,
                    zIndex: cardZIndex,
                  }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute group flex h-[490px] w-[340px] sm:w-[410px] md:w-[450px] cursor-pointer flex-col rounded-3xl p-[1px] bg-gradient-to-b from-white/25 via-white/5 to-[#FF4F00]/40 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-colors duration-300 select-none transform-gpu will-change-transform ${
                    isLeft ? "-translate-x-12 sm:-translate-x-32 md:-translate-x-48" : "translate-x-12 sm:translate-x-32 md:translate-x-48"
                  }`}
                  style={{
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <CardInnerContent capsule={capsule} />
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Navigation & Horological Progress Bar - Borderless & Clean */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between pt-3 text-xs font-mono text-[#141416]/80 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#141416] tabular-nums">
                CAPSULE 0{activeCardIndex + 1} / 0{totalCount}
              </span>
              <span className="text-[#141416]/30">—</span>
              <span className="uppercase tracking-wider font-semibold tabular-nums hidden md:inline">
                SCROLL TO TRAVERSE 3D Z-AXIS DEPTH
              </span>
            </div>

            <div className="flex items-center gap-4">
              <MagneticButton
                onClick={() => setSelectedCapsule(allCapsules[activeCardIndex])}
                data-cursor-label="INSPECT"
                className="bg-[#141416] text-[#F7F7F5] px-4 py-1.5 rounded-full font-mono text-xs font-semibold tracking-wider hover:bg-[#FF4F00] hover:text-[#141416] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>INSPECT RELIC</span>
                <ArrowRight className="h-3 w-3 text-[#FF4F00]" />
              </MagneticButton>

              {/* Live Progress Bar */}
              <div className="flex items-center gap-3 w-32 sm:w-48">
                <div className="h-1.5 w-full bg-[#141416]/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF4F00] transition-all duration-300 rounded-full"
                    style={{
                      width: `${((activeCardIndex + 1) / totalCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Inspection Modal Drawer */}
      <CapsuleModal
        capsule={selectedCapsule}
        onClose={() => setSelectedCapsule(null)}
      />
    </>
  );
}

function CardInnerContent({ capsule }: { capsule: TimeCapsule }) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    min: 0,
    sec: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, capsule.targetTimestamp - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const min = Math.floor((diff / (1000 * 60)) % 60);
      const sec = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, min, sec });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [capsule.targetTimestamp]);

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[23px] bg-[#121214] p-6 sm:p-7 shadow-inner">
      {/* 1. Metallic Serial Plate at top of card */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-1.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#FF4F00]" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#F7F7F5]/70 tabular-nums font-semibold">
            ARCHIVE REF // #AE-{capsule.year}
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#FF4F00] font-bold tabular-nums">
          VDF-SEALED
        </span>
      </div>

      {/* 2. Card Header: Category Pill & Target Year */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#FF4F00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#141416] tabular-nums">
          {capsule.category}
        </span>
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#FF4F00] tabular-nums">
          <Lock className="h-3.5 w-3.5 text-[#FF4F00]" />
          <span>{capsule.year}</span>
        </div>
      </div>

      {/* 3. Archival Photography with B&W to Color curtain transition on hover */}
      <div className="relative my-2.5 h-36 w-full overflow-hidden rounded-xl bg-[#1E1E22] border border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={capsule.imageUrl}
          alt={capsule.title}
          data-cursor-image="true"
          data-cursor-label={`OPEN ${capsule.year} ↗`}
          className="h-full w-full object-cover grayscale contrast-125 transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E22] via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-widest text-[#F7F7F5]/70 tabular-nums">
          AWAKENING: {capsule.targetDate}
        </div>
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E1E22]/90 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 font-mono text-[9px] text-[#FF4F00] tabular-nums">
          <span>INSPECT</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </div>
      </div>

      {/* 4. Content Area */}
      <div className="flex flex-col">
        <h3 className="font-display text-lg font-bold text-[#F7F7F5] leading-tight group-hover:text-[#FF4F00] transition-colors">
          {capsule.title}
        </h3>
        <p className="mt-1 font-mono text-[11px] text-[#FF4F00]/85 tabular-nums">
          Custodian: {capsule.custodian}
        </p>
        <p className="mt-1 line-clamp-2 font-sans text-xs text-[#F7F7F5]/75 leading-relaxed">
          {capsule.description}
        </p>
      </div>

      {/* 5. Recessed Digital Odometer Boxes */}
      <div className="mt-2.5 flex flex-col">
        <div className="flex items-center justify-between font-mono text-[9px] text-[#F7F7F5]/50 uppercase tracking-widest mb-1.5 tabular-nums">
          <span>TIME UNTIL AWAKENING</span>
          <span className="text-[#FF4F00] flex items-center gap-1 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-ping" />
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center font-mono tabular-nums">
          <div className="bg-[#09090B] border border-white/10 rounded-xl px-2 py-2 shadow-inner">
            <span className="text-sm sm:text-base font-bold text-[#F7F7F5]">
              {countdown.days}
            </span>
            <span className="text-[8px] text-[#F7F7F5]/45 uppercase block mt-0.5">DAYS</span>
          </div>
          <div className="bg-[#09090B] border border-white/10 rounded-xl px-2 py-2 shadow-inner">
            <span className="text-sm sm:text-base font-bold text-[#F7F7F5]">
              {String(countdown.hours).padStart(2, "0")}
            </span>
            <span className="text-[8px] text-[#F7F7F5]/45 uppercase block mt-0.5">HRS</span>
          </div>
          <div className="bg-[#09090B] border border-white/10 rounded-xl px-2 py-2 shadow-inner">
            <span className="text-sm sm:text-base font-bold text-[#FF4F00]">
              {String(countdown.min).padStart(2, "0")}
            </span>
            <span className="text-[8px] text-[#FF4F00]/80 uppercase block mt-0.5 font-semibold">MIN</span>
          </div>
          <div className="bg-[#09090B] border border-white/10 rounded-xl px-2 py-2 shadow-inner">
            <span className="text-sm sm:text-base font-bold text-[#FF4F00]">
              {String(countdown.sec).padStart(2, "0")}
            </span>
            <span className="text-[8px] text-[#FF4F00]/80 uppercase block mt-0.5 font-semibold">SEC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
