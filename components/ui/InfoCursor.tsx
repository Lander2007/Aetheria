"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type CursorMode = "default" | "button-default" | "button-labeled" | "card" | "stage";

interface CursorState {
  mode: CursorMode;
  label: string;
}

export function InfoCursor() {
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: "default",
    label: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const stateRef = useRef<CursorState>({ mode: "default", label: "" });

  // Mouse position tracked purely via useMotionValue (ZERO React re-renders on move)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Hardware-accelerated smooth spring tracking: stiffness 450, damping 28
  const springConfig = { stiffness: 450, damping: 28, mass: 0.1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const setMode = (mode: CursorMode, label: string = "") => {
      if (stateRef.current.mode !== mode || stateRef.current.label !== label) {
        stateRef.current = { mode, label };
        setCursorState({ mode, label });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Relic Card / Image Inspection State
      const cardEl = target.closest<HTMLElement>(
        "[data-capsule-card], .capsule-card, [data-cursor-image], img"
      );
      if (cardEl) {
        const customLabel =
          cardEl.getAttribute("data-cursor-label") ||
          cardEl.getAttribute("data-cursor") ||
          "INSPECT // RELIC ↗";
        setMode("card", customLabel);
        return;
      }

      // 2. Custom Stage / Artifact State (Hero 3D, Rotary Escapement, Split Stage)
      const stageEl = target.closest<HTMLElement>("[data-cursor-stage]");
      if (stageEl) {
        const stageLabel =
          stageEl.getAttribute("data-cursor-label") ||
          stageEl.getAttribute("data-cursor") ||
          "EXPLORE";
        setMode("stage", stageLabel);
        return;
      }

      // 3. Explicit data-cursor-label or data-cursor element
      const labeledEl = target.closest<HTMLElement>("[data-cursor-label], [data-cursor]");
      if (labeledEl) {
        const label =
          labeledEl.getAttribute("data-cursor-label") ||
          labeledEl.getAttribute("data-cursor") ||
          "";
        const isButton = labeledEl.closest("button, a, [role='button'], input, textarea");
        setMode(isButton ? "button-labeled" : "stage", label);
        return;
      }

      // 4. Standard Link / Button / Interactive State
      const interactiveEl = target.closest<HTMLElement>(
        "button, a, [role='button'], input, textarea, .cursor-pointer"
      );
      if (interactiveEl) {
        setMode("button-default");
        return;
      }

      // Default State
      setMode("default");
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setMode("default");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mouseover", handlePointerOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mouseover", handlePointerOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  const { mode, label } = cursorState;

  // Render sizing and variants
  const isDefault = mode === "default";
  const isButtonDefault = mode === "button-default";
  const isButtonLabeled = mode === "button-labeled";
  const isCard = mode === "card";
  const isStage = mode === "stage";

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x: smoothX,
        y: smoothY,
        translate: "-50% -50%",
      }}
      className="pointer-events-none fixed top-0 left-0 z-[9999] select-none flex items-center justify-center transform-gpu will-change-transform"
    >
      {/* 1. Default State: 12px x 12px solid #FF4F00 circle */}
      {isDefault && (
        <motion.div
          key="cursor-default"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-3 w-3 rounded-full bg-[#FF4F00] shadow-[0_0_10px_rgba(255,79,0,0.5)]"
        />
      )}

      {/* 2. Standard Button/Link: 56px #FF4F00 ring with mix-blend-difference */}
      {isButtonDefault && (
        <motion.div
          key="cursor-btn-default"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 25 }}
          className="h-14 w-14 rounded-full border-2 border-[#FF4F00] bg-[#FF4F00]/15 mix-blend-difference flex items-center justify-center shadow-[0_0_16px_rgba(255,79,0,0.3)]"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-[#FF4F00]" />
        </motion.div>
      )}

      {/* 3. Labeled Button: 64px x 64px solid #FF4F00 ball with 9px bold Azeret Mono text */}
      {isButtonLabeled && (
        <motion.div
          key="cursor-btn-labeled"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="h-16 w-16 rounded-full bg-[#FF4F00] text-[#141416] p-2 flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(255,79,0,0.45)]"
        >
          <span className="font-mono text-[9px] font-bold tracking-wider uppercase leading-tight line-clamp-2">
            {label}
          </span>
          {!label.includes("↗") && (
            <ArrowUpRight className="h-3 w-3 text-[#141416] stroke-[2.5] mt-0.5" />
          )}
        </motion.div>
      )}

      {/* 4. Relic Card Hover: 88px x 88px Carbon Glass with Horology Telemetry */}
      {isCard && (
        <motion.div
          key="cursor-card"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="h-[88px] w-[88px] rounded-full bg-[#141416]/95 backdrop-blur-md border border-[#FF4F00] text-[#F7F7F5] shadow-2xl p-2.5 flex flex-col items-center justify-center text-center"
        >
          <span className="font-mono text-[8px] font-bold tracking-widest text-[#FF4F00] uppercase leading-tight">
            {label.includes("//") ? label : `INSPECT // ${label}`}
          </span>
          <span className="font-mono text-[7px] text-[#F7F7F5]/60 tracking-wider uppercase mt-1">
            HOROLOGY
          </span>
        </motion.div>
      )}

      {/* 5. Custom Stage Hover: 80px x 80px Carbon Glass with Orange Accent */}
      {isStage && (
        <motion.div
          key="cursor-stage"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="h-20 w-20 rounded-full bg-[#141416]/90 backdrop-blur-md border border-[#FF4F00]/80 text-[#FF4F00] shadow-xl p-2 flex flex-col items-center justify-center text-center"
        >
          <span className="font-mono text-[8.5px] font-bold tracking-widest uppercase leading-tight">
            {label}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#FF4F00] mt-1 animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );
}

