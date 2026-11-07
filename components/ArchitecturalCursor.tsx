"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ArchitecturalCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const updateMouse = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("button, a, input, textarea, [role='button'], .cursor-pointer");
      if (interactive) {
        setIsHovered(true);
        if (target.closest("#act-archive .cursor-pointer")) {
          setCursorText("INSPECT");
        } else {
          setCursorText("");
        }
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Precision Center Dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#141416]"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{
          type: "spring",
          damping: 35,
          stiffness: 450,
          mass: 0.1,
        }}
      />

      {/* Outer Follower Ring / Label */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#141416]/40"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          width: isHovered ? (cursorText ? 72 : 44) : 26,
          height: isHovered ? (cursorText ? 72 : 44) : 26,
          backgroundColor: isHovered
            ? cursorText
              ? "rgba(20, 20, 22, 0.9)"
              : "rgba(20, 20, 22, 0.08)"
            : "transparent",
        }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 280,
          mass: 0.2,
        }}
      >
        {cursorText && (
          <span className="font-mono text-[9px] font-bold tracking-widest text-[#FF4F00]">
            {cursorText}
          </span>
        )}
      </motion.div>
    </>
  );
}
