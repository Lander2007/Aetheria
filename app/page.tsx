"use client";

import React, { useState, useEffect } from "react";
import { Act0Hero } from "@/components/Act0Hero";
import { Act1Manifesto } from "@/components/Act1Manifesto";
import { Act2Tapes } from "@/components/Act2Tapes";
import { Act3Steps } from "@/components/Act3Steps";
import { Act4Gallery } from "@/components/Act4Gallery";
import { Act5Simulator } from "@/components/Act5Simulator";
import { CurtainFooter } from "@/components/CurtainFooter";
import { TimeCapsule } from "@/lib/types";
import { getStoredCapsules, saveStoredCapsule } from "@/lib/storage";

export default function Home() {
  const [userCapsules, setUserCapsules] = useState<TimeCapsule[]>([]);

  // Load persisted user capsules from localStorage on mount and on storage events
  useEffect(() => {
    const loadVault = () => {
      const stored = getStoredCapsules();
      const publicOnly = stored.filter((c) => c.visibility !== "private");
      setUserCapsules(publicOnly);
    };

    loadVault();
    window.addEventListener("aetheria_vault_updated", loadVault);
    return () => window.removeEventListener("aetheria_vault_updated", loadVault);
  }, []);

  const handleCapsuleCreated = (newCapsule: TimeCapsule) => {
    saveStoredCapsule(newCapsule);
  };

  return (
    <div className="relative w-full bg-[#E2E4E6]">
      {/* ACT 0: The Expanding Portal Hero (250vh Sticky Track) */}
      <Act0Hero />

      {/* ACT 1: The Interior Chamber Manifesto (240vh Sticky Track) */}
      <Act1Manifesto />

      {/* ACT 2: Criss-Cross Temporal Seal Tapes (Kinetic Marquee Transition) */}
      <Act2Tapes />

      {/* ACT 3: Three Quiet Steps — 3D Perspective Card Stack (320vh Sticky Track) */}
      <Act3Steps />

      {/* ACT 4: Horizontal Archive Gallery (350vh Sticky Track with Reverse-Parallax Year) */}
      <Act4Gallery customCapsules={userCapsules} />

      {/* ACT 5: Interactive Time-Lock Simulator & Confirmation Receipt */}
      <Act5Simulator onCapsuleCreated={handleCapsuleCreated} />

      {/* ACT 6: Monumental Curtain Footer */}
      <CurtainFooter />
    </div>
  );
}
