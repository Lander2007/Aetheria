"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldCheck, Copy, Check, Download, Calendar, ExternalLink } from "lucide-react";
import { TimeCapsule } from "@/lib/types";

interface CapsuleModalProps {
  capsule: TimeCapsule | null;
  onClose: () => void;
}

export function CapsuleModal({ capsule, onClose }: CapsuleModalProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    min: 0,
    sec: 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!capsule) return;
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
  }, [capsule]);

  if (!capsule) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(capsule.shaKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const downloadCertificate = () => {
    const certText = `------------------------------------------------------------
AETHERIA ARCHIVAL DEPOSITORY // PROVENANCE CERTIFICATE
------------------------------------------------------------
CAPSULE ID:     ${capsule.id}
TITLE:          ${capsule.title}
CATEGORY:       ${capsule.category}
CUSTODIAN:      ${capsule.custodian}
AWAKENING DATE: ${capsule.targetDate} (EPOCH ${capsule.year})
CIPHER SUITE:   AES-256-GCM / VDF WESOLOWSKI PROTOCOL
STORAGE MEDIUM: 5D OPTICAL QUARTZ SUBSTRATE (1,000+ YR HALF-LIFE)
GEO-COORDINATE: 46.2044° N, 6.1432° E (SWISS HOROLOGICAL OBSERVATORY)

TEMPORAL AUDIT KEY (SHA-512):
${capsule.shaKey}

INSCRIBED CONTENT TESTAMENT:
"${capsule.description}"

STATUS: CRYPTOGRAPHICALLY TIME-LOCKED UNTIL SOLSTICE RELEASE
------------------------------------------------------------`;

    const blob = new Blob([certText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aetheria-${capsule.id}-certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#141416]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#141416] p-6 sm:p-10 text-[#F7F7F5] border border-[#FF4F00]/30 shadow-[0_40px_120px_rgba(20,20,22,0.8)]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-[#F7F7F5]/15 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#FF4F00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#141416] tabular-nums">
                {capsule.category}
              </span>
              <span className="font-mono text-xs text-[#F7F7F5]/55 hidden sm:inline tabular-nums">
                ID: {capsule.id}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F7F7F5]/20 text-[#F7F7F5] hover:bg-[#F7F7F5]/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Photo & Main Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-5 relative h-56 md:h-full rounded-2xl overflow-hidden bg-[#1E1E22]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capsule.imageUrl}
                alt={capsule.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E22] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[10px] text-[#FF4F00] tabular-nums">
                <Lock className="h-3.5 w-3.5 text-[#FF4F00]" />
                <span>SEALED UNTIL {capsule.year}</span>
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-[#F7F7F5] leading-tight mb-2">
                  {capsule.title}
                </h3>
                <p className="font-mono text-xs text-[#FF4F00] mb-4 tabular-nums">
                  Custodian: {capsule.custodian}
                </p>
                <div className="rounded-xl bg-[#1E1E22] p-4 border border-[#141416] mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#F7F7F5]/45 block mb-1 tabular-nums">
                    INSCRIBED STATEMENT
                  </span>
                  <p className="font-sans text-sm text-[#F7F7F5]/90 leading-relaxed italic">
                    &quot;{capsule.description}&quot;
                  </p>
                </div>
              </div>

              {/* Countdown Ticker */}
              <div className="rounded-xl bg-[#1E1E22] p-3 border border-[#FF4F00]/25">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#F7F7F5]/50 block mb-1 tabular-nums">
                  TEMPORAL COUNTDOWN UNTIL OPENING
                </span>
                <div className="grid grid-cols-4 gap-2 font-mono text-center tabular-nums">
                  <div className="bg-[#141416] p-1.5 rounded-lg">
                    <span className="text-base font-bold text-[#F7F7F5]">{countdown.days}</span>
                    <span className="text-[8px] text-[#F7F7F5]/45 block uppercase">DAYS</span>
                  </div>
                  <div className="bg-[#141416] p-1.5 rounded-lg">
                    <span className="text-base font-bold text-[#F7F7F5]">
                      {String(countdown.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] text-[#F7F7F5]/45 block uppercase">HOURS</span>
                  </div>
                  <div className="bg-[#141416] p-1.5 rounded-lg">
                    <span className="text-base font-bold text-[#FF4F00]">
                      {String(countdown.min).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] text-[#FF4F00]/80 block uppercase font-semibold">MIN</span>
                  </div>
                  <div className="bg-[#141416] p-1.5 rounded-lg">
                    <span className="text-base font-bold text-[#FF4F00]">
                      {String(countdown.sec).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] text-[#FF4F00]/80 block uppercase font-semibold">SEC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Key Box */}
          <div className="rounded-2xl bg-[#1E1E22] p-5 border border-[#141416] mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#F7F7F5]/55 flex items-center gap-1.5 tabular-nums">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FF4F00]" />
                SHA-512 TEMPORAL VERIFICATION KEY
              </span>
              <button
                type="button"
                onClick={copyHash}
                className="flex items-center gap-1 font-mono text-[10px] text-[#FF4F00] hover:underline cursor-pointer tabular-nums"
              >
                {copiedKey ? (
                  <>
                    <Check className="h-3 w-3" /> COPIED KEY
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> COPY KEY
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-[#FF4F00] bg-[#141416] p-3 rounded-xl break-all select-all border border-[#141416] tabular-nums">
              {capsule.shaKey}
            </div>
          </div>

          {/* Modal Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F7F7F5]/15 pt-4">
            <span className="font-mono text-[11px] text-[#F7F7F5]/55 tabular-nums">
              Swiss Horological Observatory // Ref: ISO-27001
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={downloadCertificate}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full bg-[#FF4F00] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#141416] hover:bg-[#F7F7F5] transition-colors cursor-pointer tabular-nums"
              >
                <Download className="h-3.5 w-3.5 text-[#141416]" />
                <span>Export Certificate</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none flex items-center justify-center rounded-full border border-[#F7F7F5]/30 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#F7F7F5] hover:bg-[#F7F7F5]/10 transition-colors cursor-pointer tabular-nums"
              >
                Close [ESC]
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
