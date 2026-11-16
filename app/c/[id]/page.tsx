"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldAlert } from "lucide-react";
import { TimeCapsule } from "@/lib/types";
import { getStoredCapsules } from "@/lib/storage";
import { INITIAL_CAPSULES } from "@/lib/data";
import { CapsuleModal } from "@/components/CapsuleModal";

export default function CapsuleSharePage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const stored = getStoredCapsules();
    const found =
      stored.find((c) => c.id === id) ||
      INITIAL_CAPSULES.find((c) => c.id === id);

    setCapsule(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141416] flex items-center justify-center text-[#F7F7F5] font-mono text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#FF4F00] animate-spin" />
          <span>QUERYING HOROLOGICAL SUBSTRATE...</span>
        </div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="min-h-screen bg-[#141416] flex flex-col items-center justify-center text-[#F7F7F5] p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-[#FF4F00] mb-4" />
        <h2 className="font-display text-2xl font-black mb-2">
          Capsule Not Found
        </h2>
        <p className="font-mono text-xs text-[#F7F7F5]/60 max-w-md mb-6">
          The requested temporal identifier [{id}] could not be resolved in the local vault or public constellation.
        </p>
        <Link
          href="/"
          className="rounded-full bg-[#FF4F00] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#141416] hover:bg-white transition-colors"
        >
          Return to Chamber
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141416] relative flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 z-40">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-white/20 bg-[#1E1E22] px-4 py-2 font-mono text-xs text-[#F7F7F5] hover:border-[#FF4F00] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#FF4F00]" />
          <span>Depository Home</span>
        </Link>
      </div>

      <CapsuleModal
        capsule={capsule}
        onClose={() => {
          router.push("/");
        }}
      />
    </div>
  );
}

