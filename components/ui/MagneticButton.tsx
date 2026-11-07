"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glowColor?: string;
  magneticStrength?: number; // multiplier, default 1.0
  asAnchor?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  "data-cursor"?: string;
  "data-cursor-label"?: string;
}

export function MagneticButton({
  children,
  className = "",
  innerClassName = "",
  glowColor = "rgba(255, 79, 0, 0.35)",
  magneticStrength = 1.0,
  asAnchor = false,
  href,
  target,
  rel,
  onClick,
  disabled,
  "data-cursor": dataCursor,
  "data-cursor-label": dataCursorLabel,
  ...rest
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Spring return physics: stiffness 160, damping 15, mass 0.1
  const springConfig = { stiffness: 160, damping: 15, mass: 0.1 };

  // Outer shell motion values (0.35x distance)
  const outerX = useMotionValue(0);
  const outerY = useMotionValue(0);
  const springOuterX = useSpring(outerX, springConfig);
  const springOuterY = useSpring(outerY, springConfig);

  // Inner text/icon motion values (0.18x distance)
  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);
  const springInnerX = useSpring(innerX, springConfig);
  const springInnerY = useSpring(innerY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Outer shell moves at 0.35x
    outerX.set(deltaX * 0.35 * magneticStrength);
    outerY.set(deltaY * 0.35 * magneticStrength);

    // Inner text/icon moves at 0.18x
    innerX.set(deltaX * 0.18 * magneticStrength);
    innerY.set(deltaY * 0.18 * magneticStrength);

    // Direct DOM CSS property mutation — ZERO React re-renders on mousemove
    buttonRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    buttonRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    setIsHovered(true);
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    outerX.set(0);
    outerY.set(0);
    innerX.set(0);
    innerY.set(0);
  };

  const content = (
    <>
      {/* Subtle radial cursor-tracked spotlight glow inside button */}
      <span
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-[inherit] overflow-hidden"
        style={{
          opacity: isHovered && !disabled ? 1 : 0,
          background: `radial-gradient(circle 80px at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 70%)`,
        }}
      />
      {/* Dual-layer inner parallax content (0.18x) */}
      <motion.span
        style={{ x: springInnerX, y: springInnerY }}
        className={`relative z-10 flex items-center justify-center gap-2 transform-gpu will-change-transform ${innerClassName}`}
      >
        {children}
      </motion.span>
    </>
  );

  if (asAnchor && href) {
    return (
      <motion.a
        ref={buttonRef as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick as any}
        data-cursor={dataCursor}
        data-cursor-label={dataCursorLabel}
        style={{ x: springOuterX, y: springOuterY }}
        className={`relative inline-flex items-center justify-center overflow-hidden transform-gpu will-change-transform cursor-pointer select-none ${className}`}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef as React.Ref<HTMLButtonElement>}
      type={(rest.type as any) || "button"}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-cursor={dataCursor}
      data-cursor-label={dataCursorLabel}
      style={{ x: springOuterX, y: springOuterY }}
      className={`relative inline-flex items-center justify-center overflow-hidden transform-gpu will-change-transform cursor-pointer select-none ${className}`}
      {...(rest as any)}
    >
      {content}
    </motion.button>
  );
}
