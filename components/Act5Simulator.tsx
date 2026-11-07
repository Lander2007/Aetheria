"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  PenTool,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AVAILABLE_YEARS } from "@/lib/data";
import { TimeCapsule } from "@/lib/types";
import { MagneticButton } from "./ui/MagneticButton";

interface Act5SimulatorProps {
  onCapsuleCreated?: (capsule: TimeCapsule) => void;
}

const TESTAMENT_PRESETS = [
  {
    label: "To my future self",
    recipient: "Myself in 2045",
    text: "Remember the silence of the alpine morning when you wrote this. Do not abandon the architectural tenets you vowed to protect.",
  },
  {
    label: "To the next generation",
    recipient: "The Geneva Custodians",
    text: "We leave you these seeds and handwritten blueprints in the belief that beauty and structural restraint will outlive all noise.",
  },
  {
    label: "An unspoken promise",
    recipient: "To the one who remembers",
    text: "A testament sealed across the solstices. Until the designated hour strikes, this promise remains cryptographically intact.",
  },
];

export function Act5Simulator({ onCapsuleCreated }: Act5SimulatorProps) {
  const currentYear = 2026;
  const [selectedYear, setSelectedYear] = useState(2045);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambleText, setScrambleText] = useState("");
  const [sealedReceipt, setSealedReceipt] = useState<TimeCapsule | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Hold-to-Forge state (1200ms)
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);

  const deltaYears = selectedYear - currentYear;
  const awakeningDateStr = `06 November ${selectedYear}`;

  // Live Hexadecimal / Cipher Stream computed from message
  const liveCipherHex = React.useMemo(() => {
    if (!message) {
      return "0x7F4A9E21...[AWAITING INSCRIBED TESTAMENT]";
    }
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    const preview = Array.from(message)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);
    return `0x${hex}::${preview}...[AES-256-LIVE-CIPHER]`;
  }, [message]);

  const executeSeal = () => {
    if (!message.trim()) return;

    setIsScrambling(true);

    const hexChars = "0123456789ABCDEFabcdef";
    let iteration = 0;
    const interval = setInterval(() => {
      let result = "";
      for (let i = 0; i < 48; i++) {
        result += hexChars[Math.floor(Math.random() * hexChars.length)];
      }
      setScrambleText(`VDF::HASH[${result.slice(0, 16)}...${result.slice(32)}]`);
      iteration++;

      if (iteration > 24) {
        clearInterval(interval);
        setIsScrambling(false);

        const randomHex = Array.from({ length: 48 }, () =>
          hexChars[Math.floor(Math.random() * hexChars.length)]
        ).join("");

        const newCapsule: TimeCapsule = {
          id: `capsule-${Date.now()}`,
          year: selectedYear,
          targetDate: awakeningDateStr,
          title: recipient.trim() ? `To ${recipient.trim()}` : `Letter to ${selectedYear}`,
          category: "PERSONAL TESTAMENT",
          custodian: recipient.trim() ? recipient.trim() : "Future Self",
          description: message.trim(),
          shaKey: `SHA512:${randomHex.toLowerCase()}`,
          imageUrl:
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
          targetTimestamp: new Date(`${selectedYear}-11-06T00:00:00Z`).getTime(),
        };

        setSealedReceipt(newCapsule);
        if (onCapsuleCreated) {
          onCapsuleCreated(newCapsule);
        }

        try {
          confetti({
            particleCount: 85,
            spread: 70,
            origin: { y: 0.65 },
            colors: ["#FF4F00", "#141416", "#F7F7F5", "#E2E4E6"],
          });
        } catch (e) {
          // ignore
        }
      }
    }, 60);
  };

  // Hold-to-Forge Event Handlers (1.2s = 1200ms)
  const startHolding = () => {
    if (!message.trim()) return;
    setIsHolding(true);
    holdStartRef.current = Date.now();

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, (elapsed / 1200) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        executeSeal();
      }
    }, 20);
  };

  const cancelHolding = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const copyKeyToClipboard = () => {
    if (sealedReceipt) {
      navigator.clipboard.writeText(sealedReceipt.shaKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const resetSimulator = () => {
    setSealedReceipt(null);
    setMessage("");
    setRecipient("");
    setHoldProgress(0);
  };

  const applyPreset = (preset: (typeof TESTAMENT_PRESETS)[0]) => {
    setRecipient(preset.recipient);
    setMessage(preset.text);
  };

  return (
    <section
      id="seal-lock"
      data-nav-theme="light"
      className="relative w-full bg-[#E2E4E6] pt-28 pb-16 md:pt-36 md:pb-24 px-4 md:px-8 text-[#141416] overflow-hidden"
    >
      {/* Elevated Recessed Floating Architectural Island */}
      <div className="max-w-[1440px] mx-auto rounded-[40px] bg-[#D8DBDE]/60 backdrop-blur-md p-8 sm:p-12 md:p-16 border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_30px_80px_rgba(20,20,22,0.06)]">
        <div className="mx-auto max-w-4xl">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#141416]/75 font-semibold tabular-nums">
              ACT 04 // TACTILE VAULT CONSOLE
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#141416]">
            Forge the <span className="font-editorial italic font-light text-[#FF4F00]">lock.</span>
          </h2>
          <p className="mt-4 max-w-xl font-sans text-sm md:text-base text-[#141416]/85 leading-relaxed">
            Select a target epoch. Inscribe your testament, inspect the real-time cipher stream, and press-and-hold to forge your cryptographic time-lock.
          </p>
        </div>

        {/* Interactive Year Selector Strip & Range Slider */}
        <div className="mb-12 flex flex-col items-center w-full max-w-xl mx-auto">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#141416]/70 mb-4 font-semibold tabular-nums">
            SELECT AWAKENING EPOCH (YEAR)
          </span>

          {/* Quick Year Pills with Magnetic Parallax */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 rounded-full bg-[#141416]/10 p-2 border border-[#141416]/15 mb-4">
            {AVAILABLE_YEARS.map((yr) => {
              const isSelected = yr === selectedYear;
              return (
                <MagneticButton
                  key={yr}
                  magneticStrength={0.4}
                  onClick={() => setSelectedYear(yr)}
                  className={`rounded-full px-4 sm:px-5 py-2 font-mono text-xs font-bold transition-all duration-300 cursor-pointer tabular-nums ${
                    isSelected
                      ? "bg-[#FF4F00] text-[#141416] shadow-[0_4px_14px_rgba(255,79,0,0.35)] scale-105"
                      : "text-[#141416]/80 hover:bg-[#141416]/10 hover:text-[#141416]"
                  }`}
                >
                  {yr}
                </MagneticButton>
              );
            })}
          </div>

          {/* Continuous Year Range Slider */}
          <div className="w-full flex items-center gap-4 px-4 font-mono text-xs text-[#141416]/70 font-semibold tabular-nums">
            <span>2027</span>
            <input
              type="range"
              min="2027"
              max="2100"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#141416]/20 rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
            />
            <span>2100</span>
          </div>
        </div>

        {/* Dynamic Readout Box */}
        <motion.div
          key={selectedYear}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12 text-center"
        >
          <div className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#141416] tracking-tight tabular-nums">
            In {deltaYears} {deltaYears === 1 ? "year" : "years"}.
          </div>
          <div className="mt-2 font-editorial italic text-lg sm:text-xl text-[#141416]/85">
            Your message will open on {awakeningDateStr}.
          </div>
        </motion.div>

        {/* Vault Console Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#141416] p-8 sm:p-12 text-[#F7F7F5] shadow-[0_30px_90px_rgba(20,20,22,0.4)] border border-[#F7F7F5]/15">
          
          <AnimatePresence mode="wait">
            {!sealedReceipt ? (
              /* Input Console Form */
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  executeSeal();
                }}
                className="flex flex-col gap-6"
              >
                {/* Console Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#F7F7F5]/15 pb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#FF4F00] font-semibold tabular-nums">
                      VAULT TERMINAL // CONSOLE_01
                    </span>
                    <span className="text-[#F7F7F5]/30">•</span>
                    <span className="font-mono text-xs text-[#F7F7F5]/60 tabular-nums">
                      EPOCH {selectedYear}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-[#FF4F00] flex items-center gap-1.5 font-semibold tabular-nums">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#FF4F00]" />
                    AES-256 ISOLATION ACTIVE
                  </span>
                </div>

                {/* Poetic Testament Presets */}
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#F7F7F5]/60 font-semibold tabular-nums">
                    QUICK ARCHIVAL PROMPTS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TESTAMENT_PRESETS.map((p, i) => (
                      <MagneticButton
                        key={i}
                        type="button"
                        magneticStrength={0.3}
                        onClick={() => applyPreset(p)}
                        className="rounded-full border border-[#F7F7F5]/20 bg-[#1E1E22] px-3.5 py-1.5 font-mono text-[11px] text-[#F7F7F5]/85 hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors cursor-pointer"
                      >
                        + {p.label}
                      </MagneticButton>
                    ))}
                  </div>
                </div>

                {/* Recipient Input */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="recipient-input"
                    className="font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/75 flex justify-between font-semibold"
                  >
                    <span>Recipient or Designated Heir</span>
                    <span className="text-[#F7F7F5]/45 font-sans">(Optional)</span>
                  </label>
                  <input
                    id="recipient-input"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. My future daughter, or To myself at 50"
                    className="rounded-xl bg-[#1E1E22] px-4 py-3.5 font-sans text-sm text-[#F7F7F5] placeholder-[#F7F7F5]/35 border border-[#141416] focus:border-[#FF4F00] focus:outline-none transition-colors"
                  />
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/75 font-semibold">
                    <label htmlFor="message-input">The Inscription</label>
                    <span className="text-[10px] text-[#FF4F00] tabular-nums">
                      {message.length} CHARACTERS
                    </span>
                  </div>
                  <textarea
                    id="message-input"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write the promise, confession, or architectural forecast you wish to preserve untouched across time..."
                    required
                    className="w-full rounded-xl bg-[#1E1E22] p-4 font-sans text-sm text-[#F7F7F5] placeholder-[#F7F7F5]/35 border border-[#141416] focus:border-[#FF4F00] focus:outline-none transition-colors leading-relaxed resize-none"
                  />
                </div>

                {/* Live Hexadecimal / Cipher Preview Bar */}
                <div className="rounded-xl bg-[#1E1E22] p-3.5 border border-[#141416]">
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-[#F7F7F5]/50 mb-1 tabular-nums">
                    <span>LIVE CIPHER / VDF HEX STREAM</span>
                    <span className="text-[#FF4F00]">REAL-TIME ENCRYPTION</span>
                  </div>
                  <div className="font-mono text-xs text-[#FF4F00] tracking-wide break-all select-none tabular-nums">
                    {liveCipherHex}
                  </div>
                </div>

                {/* Scrambling Indicator or Tactile Hold-to-Forge Button */}
                {isScrambling ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1E1E22] p-6 text-center border border-[#FF4F00]/35">
                    <RefreshCw className="h-6 w-6 text-[#FF4F00] animate-spin mb-3" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#FF4F00] mb-1 font-semibold tabular-nums">
                      COMPUTING VERIFIABLE DELAY FUNCTION
                    </span>
                    <span className="font-mono text-[11px] text-[#F7F7F5]/75 tabular-nums">
                      {scrambleText}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <span className="font-mono text-[11px] text-[#F7F7F5]/55 text-center sm:text-left tabular-nums">
                      {isHolding
                        ? "ENGRAVING IN PROGRESS... MAINTAIN PRESSURE"
                        : "Press & hold 1.2s to forge cryptographic time-lock."}
                    </span>

                    {/* Tactile Hold-to-Forge Button with Dual-Layer Magnetic Parallax */}
                    <MagneticButton
                      type="submit"
                      magneticStrength={0.5}
                      data-cursor-label="HOLD 1.2S"
                      onMouseDown={startHolding}
                      onMouseUp={cancelHolding}
                      onMouseLeave={cancelHolding}
                      onTouchStart={startHolding}
                      onTouchEnd={cancelHolding}
                      disabled={!message.trim()}
                      className="relative group overflow-hidden flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-[#1E1E22] border border-[#FF4F00] px-8 py-4 font-mono text-xs font-extrabold uppercase tracking-wider text-[#F7F7F5] shadow-[0_8px_25px_rgba(255,79,0,0.25)] transition-all select-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {/* Active Fill Bar on Hold */}
                      <motion.div
                        className="absolute inset-0 bg-[#FF4F00] pointer-events-none"
                        style={{
                          width: `${holdProgress}%`,
                        }}
                        transition={{ ease: "linear", duration: 0.05 }}
                      />

                      <div className="relative z-10 flex items-center gap-2">
                        <Lock className={`h-4 w-4 ${holdProgress > 50 ? "text-[#141416]" : "text-[#FF4F00]"}`} />
                        <span className={holdProgress > 50 ? "text-[#141416]" : "text-[#F7F7F5]"}>
                          {isHolding
                            ? `ENGRAVING... ${Math.round(holdProgress)}%`
                            : `HOLD 1.2s TO ENGRAVE & SEAL`}
                        </span>
                      </div>
                    </MagneticButton>
                  </div>
                )}
              </motion.form>
            ) : (
              /* Sealed Confirmation Receipt */
              <motion.div
                key="receipt"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Receipt Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#F7F7F5]/15 pb-4 gap-2">
                  <div className="flex items-center gap-2 text-[#FF4F00]">
                    <CheckCircle2 className="h-5 w-5 text-[#FF4F00]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest tabular-nums">
                      CAPSULE CRYPTOGRAPHICALLY SEALED
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-[#FF4F00] font-bold tabular-nums">
                    ● IMMUTABLE STATUS: LOCKED
                  </span>
                </div>

                {/* Receipt Certificate Body */}
                <div className="rounded-2xl bg-[#1E1E22] p-6 border border-[#FF4F00]/25">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs tabular-nums">
                    <div>
                      <span className="text-[#F7F7F5]/55 uppercase tracking-wider text-[10px] block mb-1">
                        DESIGNATED AWAKENING
                      </span>
                      <span className="font-bold text-base text-[#FF4F00]">
                        {sealedReceipt.targetDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#F7F7F5]/55 uppercase tracking-wider text-[10px] block mb-1">
                        RECIPIENT / CUSTODIAN
                      </span>
                      <span className="font-bold text-base text-[#F7F7F5]">
                        {sealedReceipt.custodian}
                      </span>
                    </div>

                    <div className="sm:col-span-2 mt-2">
                      <span className="text-[#F7F7F5]/55 uppercase tracking-wider text-[10px] block mb-1">
                        INSCRIBED MESSAGE (PREVIEW)
                      </span>
                      <p className="font-sans text-sm italic text-[#F7F7F5]/90 bg-[#141416] p-3 rounded-xl border border-[#141416]">
                        &quot;{sealedReceipt.description}&quot;
                      </p>
                    </div>

                    <div className="sm:col-span-2 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#F7F7F5]/55 uppercase tracking-wider text-[10px]">
                          TEMPORAL SHA-512 AUDIT KEY
                        </span>
                        <button
                          type="button"
                          onClick={copyKeyToClipboard}
                          className="flex items-center gap-1 text-[10px] text-[#FF4F00] hover:underline cursor-pointer"
                        >
                          {copiedKey ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Key
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-[#FF4F00] bg-[#141416] p-2.5 rounded-lg break-all select-all border border-[#141416]">
                        {sealedReceipt.shaKey}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <span className="font-mono text-[11px] text-[#F7F7F5]/65 tabular-nums">
                    Deposit registered into the active 3D spatial timeline.
                  </span>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <MagneticButton
                      type="button"
                      magneticStrength={0.4}
                      onClick={() => {
                        const el = document.getElementById("act-archive");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full border border-[#FF4F00] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#FF4F00] hover:bg-[#FF4F00]/15 cursor-pointer tabular-nums"
                    >
                      <span>View in Timeline</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </MagneticButton>

                    <MagneticButton
                      type="button"
                      magneticStrength={0.4}
                      onClick={resetSimulator}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full bg-[#F7F7F5] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#141416] hover:bg-white cursor-pointer tabular-nums"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Forge Another</span>
                    </MagneticButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </section>
  );
}
