"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Act5Simulator } from "@/components/Act5Simulator";

export default function VaultRegistryPage() {
  return (
    <div className="min-h-screen bg-[#E2E4E6] text-[#141416] pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#141416]/20 bg-[#141416]/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#141416] hover:bg-[#141416] hover:text-[#F7F7F5] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#FF4F00]" />
          <span>Return to Chamber</span>
        </Link>
        <span className="font-mono text-xs text-[#141416]/60 uppercase tracking-widest hidden sm:inline">
          ACT 04 // VAULT REGISTRY
        </span>
      </div>

      <Act5Simulator initialTab="vault" />
    </div>
  );
}

