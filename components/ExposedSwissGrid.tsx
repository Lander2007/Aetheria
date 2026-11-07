"use client";

import React from "react";

export function ExposedSwissGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 mx-auto w-full max-w-[1480px] px-8 md:px-16"
    >
      {/* Precision Corner Crosshair Registration Marks (+) - Never intersects content */}
      <div className="relative h-full w-full">
        {/* Top-Left Section Corner Crosshair */}
        <span className="absolute top-6 left-0 font-mono text-[10px] text-[#141416]/30 font-bold select-none leading-none">
          +
        </span>

        {/* Top-Right Section Corner Crosshair */}
        <span className="absolute top-6 right-0 font-mono text-[10px] text-[#141416]/30 font-bold select-none leading-none">
          +
        </span>

        {/* Bottom-Left Section Corner Crosshair + Coordinate */}
        <div className="absolute bottom-6 left-0 flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#141416]/30 font-bold select-none leading-none">
            +
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#141416]/35 font-semibold tabular-nums">
            LAT 46.2044° N
          </span>
        </div>

        {/* Bottom-Right Section Corner Crosshair + Coordinate */}
        <div className="absolute bottom-6 right-0 flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#141416]/35 font-semibold tabular-nums">
            LON 6.1432° E
          </span>
          <span className="font-mono text-[10px] text-[#141416]/30 font-bold select-none leading-none">
            +
          </span>
        </div>
      </div>
    </div>
  );
}
