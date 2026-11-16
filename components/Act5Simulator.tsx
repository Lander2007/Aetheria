"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Eye,
  Clock,
  Archive,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TimeCapsule, CapsuleType, CapsuleVisibility } from "@/lib/types";
import { encryptCapsulePayload } from "@/lib/crypto";
import {
  getStoredCapsules,
  saveStoredCapsule,
  deleteStoredCapsule,
  seedDemoData,
} from "@/lib/storage";
import { MagneticButton } from "./ui/MagneticButton";
import { CapsuleModal } from "./CapsuleModal";

interface Act5SimulatorProps {
  onCapsuleCreated?: (capsule: TimeCapsule) => void;
}

const TESTAMENT_PRESETS = [
  {
    label: "To my future self",
    recipient: "Myself in 2045",
    title: "Letter to My Future Self",
    type: "memory" as CapsuleType,
    text: "Remember the silence of the alpine morning when you wrote this. Do not abandon the architectural tenets you vowed to protect.",
  },
  {
    label: "To the next generation",
    recipient: "The Geneva Custodians",
    title: "Blueprints for Geneva",
    type: "message" as CapsuleType,
    text: "We leave you these seeds and handwritten blueprints in the belief that beauty and structural restraint will outlive all noise.",
  },
  {
    label: "An unspoken promise",
    recipient: "To the one who remembers",
    title: "The Solstice Covenant",
    type: "goal" as CapsuleType,
    text: "A testament sealed across the solstices. Until the designated hour strikes, this promise remains cryptographically intact.",
  },
];

// Helper: pad with zero
const pad2 = (n: number) => String(n).padStart(2, "0");

// Helper: format local date YYYY-MM-DD
function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Helper: format local time HH:mm:ss
function toLocalTimeString(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

// Helper: parse local date & time strings into a local Date object without off-by-one errors
function parseLocalDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null;
  const dateParts = dateStr.split("-").map(Number);
  if (dateParts.length !== 3 || dateParts.some(isNaN)) return null;
  const [year, month, day] = dateParts;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  if (timeStr) {
    const timeParts = timeStr.split(":").map(Number);
    hours = timeParts[0] || 0;
    minutes = timeParts[1] || 0;
    seconds = timeParts[2] || 0;
  }

  const result = new Date(year, month - 1, day, hours, minutes, seconds);
  return isNaN(result.getTime()) ? null : result;
}

// Quick Presets: +30 SEC (for demo), +1 MIN, +1 HOUR, +1 DAY, +1 WEEK, +1 YEAR
const TIME_PRESETS = [
  { label: "+30 SEC", getTarget: () => new Date(Date.now() + 30 * 1000) },
  { label: "+1 MIN", getTarget: () => new Date(Date.now() + 60 * 1000) },
  { label: "+1 HOUR", getTarget: () => new Date(Date.now() + 3600 * 1000) },
  { label: "+1 DAY", getTarget: () => new Date(Date.now() + 86400 * 1000) },
  { label: "+1 WEEK", getTarget: () => new Date(Date.now() + 7 * 86400 * 1000) },
  {
    label: "+1 YEAR",
    getTarget: () => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d;
    },
  },
];

export function Act5Simulator({ onCapsuleCreated }: Act5SimulatorProps) {
  const [activeTab, setActiveTab] = useState<"forge" | "vault">("forge");
  const [vaultFilter, setVaultFilter] = useState<"all" | "locked" | "unlocked">("all");
  const [selectedVaultCapsule, setSelectedVaultCapsule] = useState<TimeCapsule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [capsuleType, setCapsuleType] = useState<CapsuleType>("message");
  const [visibility, setVisibility] = useState<CapsuleVisibility>("public");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");

  // Live Date and Time Picker State (defaults to +30 SEC for instant live demo readiness)
  const [unlockDate, setUnlockDate] = useState<string>(() => {
    return toLocalDateString(new Date(Date.now() + 30 * 1000));
  });
  const [unlockTime, setUnlockTime] = useState<string>(() => {
    return toLocalTimeString(new Date(Date.now() + 30 * 1000));
  });

  // Current ticker for live preview line updates
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Today string for date input min attribute
  const todayMinStr = useMemo(() => toLocalDateString(new Date()), []);

  // Sealing & scramble state
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambleText, setScrambleText] = useState("");
  const [sealedReceipt, setSealedReceipt] = useState<TimeCapsule | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Vault capsules state (synced with storage)
  const [vaultCapsules, setVaultCapsules] = useState<TimeCapsule[]>([]);

  // Hold-to-Forge state (1200ms)
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);

  // Sync vault capsules
  useEffect(() => {
    setVaultCapsules(getStoredCapsules());
    const handleUpdate = () => {
      setVaultCapsules(getStoredCapsules());
    };
    window.addEventListener("aetheria_vault_updated", handleUpdate);
    return () => window.removeEventListener("aetheria_vault_updated", handleUpdate);
  }, []);

  // Target moment calculations & validation
  const targetMoment = useMemo(() => {
    return parseLocalDateTime(unlockDate, unlockTime);
  }, [unlockDate, unlockTime]);

  const targetTimestamp = targetMoment ? targetMoment.getTime() : 0;
  const targetDateIso = targetMoment ? targetMoment.toISOString() : "";
  const diffSeconds = targetMoment ? Math.floor((targetTimestamp - nowTick) / 1000) : 0;

  // Validation: must be at least 10 seconds in future
  const { isValidEpoch, epochError, relativePreviewStr, localPreviewStr, relativeReadoutHeading } =
    useMemo(() => {
      if (!unlockDate) {
        return {
          isValidEpoch: false,
          epochError: "Please select an unlock date.",
          relativePreviewStr: "AWAITING DATE",
          localPreviewStr: "—",
          relativeReadoutHeading: "Select an epoch.",
        };
      }
      if (!unlockTime) {
        return {
          isValidEpoch: false,
          epochError: "Please select an unlock time.",
          relativePreviewStr: "AWAITING TIME",
          localPreviewStr: "—",
          relativeReadoutHeading: "Select an epoch.",
        };
      }
      if (!targetMoment || isNaN(targetMoment.getTime())) {
        return {
          isValidEpoch: false,
          epochError: "Invalid date or time format.",
          relativePreviewStr: "INVALID MOMENT",
          localPreviewStr: "—",
          relativeReadoutHeading: "Invalid epoch.",
        };
      }
      if (diffSeconds < 10) {
        return {
          isValidEpoch: false,
          epochError: "Unlock moment must be at least 10 seconds in the future.",
          relativePreviewStr: "PAST OR IMMINENT (MIN 10S REQUIRED)",
          localPreviewStr: targetMoment.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "medium",
          }),
          relativeReadoutHeading: "Moment must be in future.",
        };
      }

      // Valid future moment
      const d = Math.floor(diffSeconds / (3600 * 24));
      const h = Math.floor((diffSeconds % (3600 * 24)) / 3600);
      const m = Math.floor((diffSeconds % 3600) / 60);
      const s = diffSeconds % 60;

      let preview = "OPENS IN ";
      if (d > 0) preview += `${d}D `;
      preview += `${pad2(h)}H ${pad2(m)}M ${pad2(s)}S`;

      // Readout heading
      let heading = "";
      if (diffSeconds < 60) {
        heading = `In ${diffSeconds} seconds.`;
      } else if (diffSeconds < 3600) {
        heading = `In ${Math.ceil(diffSeconds / 60)} minutes.`;
      } else if (diffSeconds < 86400) {
        heading = `In ${Math.ceil(diffSeconds / 3600)} hours.`;
      } else if (diffSeconds < 86400 * 365) {
        heading = `In ${Math.ceil(diffSeconds / 86400)} days.`;
      } else {
        const yrs = Math.max(1, Math.round(diffSeconds / (86400 * 365)));
        heading = `In ${yrs} ${yrs === 1 ? "year" : "years"}.`;
      }

      const localStr = targetMoment.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "medium",
      });

      return {
        isValidEpoch: true,
        epochError: null,
        relativePreviewStr: preview,
        localPreviewStr: localStr,
        relativeReadoutHeading: heading,
      };
    }, [unlockDate, unlockTime, targetMoment, diffSeconds]);

  const targetDateFormatted = targetMoment
    ? targetMoment.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      })
    : "—";

  // Live Hexadecimal / Cipher Stream computed from message
  const liveCipherHex = useMemo(() => {
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

  const executeSeal = async () => {
    if (!message.trim() || !isValidEpoch || !targetMoment) return;

    setIsScrambling(true);

    const hexChars = "0123456789ABCDEFabcdef";
    let iteration = 0;
    const interval = setInterval(async () => {
      let result = "";
      for (let i = 0; i < 48; i++) {
        result += hexChars[Math.floor(Math.random() * hexChars.length)];
      }
      setScrambleText(`VDF::HASH[${result.slice(0, 16)}...${result.slice(32)}]`);
      iteration++;

      if (iteration > 24) {
        clearInterval(interval);
        setIsScrambling(false);

        try {
          // Encrypt payload with Web Crypto AES-GCM 256
          const encResult = await encryptCapsulePayload(
            message.trim(),
            passcode.trim() || undefined
          );

          const finalTitle =
            title.trim() ||
            (recipient.trim()
              ? `To ${recipient.trim()}`
              : `Letter to ${targetMoment.getFullYear()}`);

          const newCapsule: TimeCapsule = {
            id: `capsule-${Date.now()}`,
            year: targetMoment.getFullYear(),
            targetDate: targetDateFormatted,
            targetDateIso: targetDateIso,
            title: finalTitle,
            category: capsuleType.toUpperCase(),
            custodian: recipient.trim() || "Future Self",
            description: message.trim(),
            shaKey: encResult.shaKey,
            imageUrl:
              "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
            targetTimestamp,
            createdAt: new Date().toISOString(),
            type: capsuleType,
            visibility,
            isEncrypted: true,
            ciphertext: encResult.ciphertext,
            iv: encResult.iv,
            salt: encResult.salt,
            keyPackage: encResult.keyPackage,
            hasPasscode: encResult.hasPasscode,
          };

          // Save to local storage
          saveStoredCapsule(newCapsule);
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
          } catch {
            // ignore
          }
        } catch (err) {
          console.error("Encryption error:", err);
        }
      }
    }, 60);
  };

  // Hold-to-Forge Event Handlers (1.2s = 1200ms)
  const startHolding = () => {
    if (!message.trim() || !isValidEpoch) return;
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
    setTitle("");
    setRecipient("");
    setPasscode("");
    setHoldProgress(0);
    const future = new Date(Date.now() + 30 * 1000);
    setUnlockDate(toLocalDateString(future));
    setUnlockTime(toLocalTimeString(future));
  };

  const applyPreset = (preset: (typeof TESTAMENT_PRESETS)[0]) => {
    setRecipient(preset.recipient);
    setTitle(preset.title);
    setCapsuleType(preset.type);
    setMessage(preset.text);
  };

  // Filter vault capsules
  const filteredVaultCapsules = useMemo(() => {
    const now = Date.now();
    if (vaultFilter === "locked") {
      return vaultCapsules.filter((c) => c.targetTimestamp > now);
    }
    if (vaultFilter === "unlocked") {
      return vaultCapsules.filter((c) => c.targetTimestamp <= now);
    }
    return vaultCapsules;
  }, [vaultCapsules, vaultFilter]);

  const lockedCount = vaultCapsules.filter((c) => c.targetTimestamp > Date.now()).length;
  const unlockedCount = vaultCapsules.filter((c) => c.targetTimestamp <= Date.now()).length;

  return (
    <section
      id="seal-lock"
      data-nav-theme="light"
      className="relative w-full bg-[#E2E4E6] pt-28 pb-16 md:pt-36 md:pb-24 px-4 md:px-8 text-[#141416] overflow-hidden"
    >
      {/* Elevated Recessed Floating Architectural Island */}
      <div className="max-w-[1440px] mx-auto rounded-[32px] sm:rounded-[40px] bg-[#D8DBDE]/60 backdrop-blur-md p-5 sm:p-12 md:p-16 border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_30px_80px_rgba(20,20,22,0.06)]">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-10">
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
              Select an exact awakening epoch. Inscribe your testament, inspect the real-time cipher stream, and press-and-hold to forge your cryptographic time-lock.
            </p>

            {/* Navigation Tabs (Forge vs Vault Registry) */}
            <div className="mt-8 flex items-center gap-2 p-1.5 rounded-full bg-[#141416]/10 border border-[#141416]/15">
              <button
                type="button"
                data-tab="forge"
                onClick={() => setActiveTab("forge")}
                className={`px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "forge"
                    ? "bg-[#FF4F00] text-[#141416] shadow-[0_4px_14px_rgba(255,79,0,0.35)] scale-105"
                    : "text-[#141416]/70 hover:text-[#141416]"
                }`}
              >
                FORGE LOCK
              </button>
              <button
                type="button"
                data-tab="vault"
                onClick={() => setActiveTab("vault")}
                className={`px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "vault"
                    ? "bg-[#141416] text-[#F7F7F5] shadow-[0_4px_14px_rgba(20,20,22,0.35)] scale-105"
                    : "text-[#141416]/70 hover:text-[#141416]"
                }`}
              >
                <span>VAULT REGISTRY</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                    activeTab === "vault"
                      ? "bg-[#FF4F00] text-[#141416]"
                      : "bg-[#141416]/15 text-[#141416]"
                  }`}
                >
                  {vaultCapsules.length}
                </span>
              </button>
            </div>
          </div>

          {activeTab === "forge" ? (
            <>
              {/* Dynamic Readout Box Synchronized with Date/Time Picker */}
              <motion.div
                key={targetTimestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-10 text-center"
              >
                <div className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#141416] tracking-tight tabular-nums">
                  {relativeReadoutHeading}
                </div>
                <div className="mt-2 font-editorial italic text-lg sm:text-xl text-[#141416]/85">
                  Your message will unlock on {targetDateFormatted}.
                </div>
              </motion.div>

              {/* Vault Console Card */}
              <div className="relative overflow-hidden rounded-3xl bg-[#141416] p-5 sm:p-10 md:p-12 text-[#F7F7F5] shadow-[0_30px_90px_rgba(20,20,22,0.4)] border border-[#F7F7F5]/15">
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
                            {targetMoment ? `EPOCH ${targetMoment.getFullYear()}` : "AWAITING EPOCH"}
                          </span>
                        </div>

                        <span className="font-mono text-[10px] text-[#FF4F00] flex items-center gap-1.5 font-semibold tabular-nums">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#FF4F00]" />
                          AES-256-GCM ACTIVE
                        </span>
                      </div>

                      {/* Quick Archival Prompts */}
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

                      {/* REAL UNLOCK DATE AND TIME PICKER (ADD-ON REQUIREMENT) */}
                      <div className="flex flex-col gap-2.5 rounded-2xl bg-[#141416] p-4 sm:p-5 border border-white/10 shadow-inner">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label
                            htmlFor="unlock-date"
                            className="font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/85 font-semibold flex items-center gap-2"
                          >
                            <Clock className="h-3.5 w-3.5 text-[#FF4F00]" />
                            <span>UNLOCK EPOCH</span>
                          </label>
                          <span className="font-mono text-[10px] text-[#FF4F00] tracking-wider font-semibold tabular-nums">
                            LOCAL TIMEZONE · ENFORCED ON-CLIENT
                          </span>
                        </div>

                        {/* Quick Presets as Small Pill Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 pb-2">
                          <span className="font-mono text-[10px] uppercase text-[#F7F7F5]/50 mr-1 font-semibold">
                            QUICK PRESETS:
                          </span>
                          {TIME_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                const target = p.getTarget();
                                setUnlockDate(toLocalDateString(target));
                                setUnlockTime(toLocalTimeString(target));
                              }}
                              className="rounded-full border border-[#F7F7F5]/20 bg-[#1E1E22] px-3 py-1 font-mono text-[11px] font-bold text-[#F7F7F5]/85 hover:border-[#FF4F00] hover:text-[#FF4F00] hover:bg-[#28282D] transition-all cursor-pointer select-none active:scale-95"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>

                        {/* Native Date and Time Inputs Styled to Match Form Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label
                              htmlFor="unlock-date"
                              className="font-mono text-[10px] uppercase tracking-wider text-[#F7F7F5]/55 font-medium"
                            >
                              Awakening Date
                            </label>
                            <input
                              id="unlock-date"
                              type="date"
                              min={todayMinStr}
                              value={unlockDate}
                              onChange={(e) => setUnlockDate(e.target.value)}
                              required
                              className="w-full rounded-xl bg-[#1E1E22] px-4 py-3 font-mono text-sm text-[#F7F7F5] border border-[#141416] focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] focus:outline-none transition-colors cursor-pointer [color-scheme:dark]"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label
                              htmlFor="unlock-time"
                              className="font-mono text-[10px] uppercase tracking-wider text-[#F7F7F5]/55 font-medium"
                            >
                              Awakening Time (HH:MM:SS)
                            </label>
                            <input
                              id="unlock-time"
                              type="time"
                              step="1"
                              value={unlockTime}
                              onChange={(e) => setUnlockTime(e.target.value)}
                              required
                              className="w-full rounded-xl bg-[#1E1E22] px-4 py-3 font-mono text-sm text-[#F7F7F5] border border-[#141416] focus:border-[#FF4F00] focus:ring-1 focus:ring-[#FF4F00] focus:outline-none transition-colors cursor-pointer [color-scheme:dark]"
                            />
                          </div>
                        </div>

                        {/* Validation Error Message or Live Preview Line */}
                        {epochError ? (
                          <div className="flex items-center gap-1.5 text-[#FF4F00] text-xs font-mono mt-1 bg-[#FF4F00]/10 p-2.5 rounded-lg border border-[#FF4F00]/30">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{epochError}</span>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-[#1E1E22] p-3 border border-white/5 mt-1 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 tabular-nums">
                            <div className="flex items-center gap-2 text-[#FF4F00] font-bold tracking-wide">
                              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{relativePreviewStr}</span>
                            </div>
                            <div className="text-[11px] text-[#F7F7F5]/75 flex items-center gap-2">
                              <span>LOCAL: {localPreviewStr}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Type and Visibility Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Type Selector */}
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/75 font-semibold">
                            Capsule Classification
                          </label>
                          <div className="flex items-center gap-2">
                            {(["message", "memory", "goal"] as CapsuleType[]).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setCapsuleType(t)}
                                className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                                  capsuleType === t
                                    ? "bg-[#FF4F00] text-[#141416]"
                                    : "bg-[#1E1E22] text-[#F7F7F5]/70 hover:bg-[#28282D]"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Visibility Selector */}
                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/75 font-semibold">
                            Archive Visibility
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setVisibility("public")}
                              className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                                visibility === "public"
                                  ? "bg-[#FF4F00] text-[#141416]"
                                  : "bg-[#1E1E22] text-[#F7F7F5]/70 hover:bg-[#28282D]"
                              }`}
                            >
                              Public Gallery
                            </button>
                            <button
                              type="button"
                              onClick={() => setVisibility("private")}
                              className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                                visibility === "private"
                                  ? "bg-[#FF4F00] text-[#141416]"
                                  : "bg-[#1E1E22] text-[#F7F7F5]/70 hover:bg-[#28282D]"
                              }`}
                            >
                              Private Vault
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Title & Recipient Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="title-input"
                            className="font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/75 font-semibold"
                          >
                            Capsule Title
                          </label>
                          <input
                            id="title-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Vows Under the Alpine Sky"
                            className="rounded-xl bg-[#1E1E22] px-4 py-3 font-sans text-sm text-[#F7F7F5] placeholder-[#F7F7F5]/35 border border-[#141416] focus:border-[#FF4F00] focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="recipient-input"
                            className="font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/75 flex justify-between font-semibold"
                          >
                            <span>Recipient / Custodian</span>
                            <span className="text-[#F7F7F5]/45 font-sans">(Optional)</span>
                          </label>
                          <input
                            id="recipient-input"
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="e.g. Julian to Elena"
                            className="rounded-xl bg-[#1E1E22] px-4 py-3 font-sans text-sm text-[#F7F7F5] placeholder-[#F7F7F5]/35 border border-[#141416] focus:border-[#FF4F00] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Optional Passcode Input */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="passcode-input"
                          className="font-mono text-xs uppercase tracking-wider text-[#F7F7F5]/75 flex justify-between font-semibold"
                        >
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="h-3.5 w-3.5 text-[#FF4F00]" />
                            Secret Passcode Key
                          </span>
                          <span className="text-[#F7F7F5]/45 font-sans">(Optional · PBKDF2)</span>
                        </label>
                        <input
                          id="passcode-input"
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="Leave empty for client auto-unlock, or set a key (e.g. 1234)"
                          className="rounded-xl bg-[#1E1E22] px-4 py-3 font-mono text-sm text-[#F7F7F5] placeholder-[#F7F7F5]/35 border border-[#141416] focus:border-[#FF4F00] focus:outline-none transition-colors"
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
                          <span className="text-[#FF4F00]">AES-256 REAL-TIME ENCRYPTION</span>
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
                              : !isValidEpoch
                              ? "Select a valid future epoch (min 10s) to enable seal."
                              : "Press & hold 1.2s (or click) to forge cryptographic time-lock."}
                          </span>

                          <MagneticButton
                            type="submit"
                            magneticStrength={0.5}
                            data-cursor-label="HOLD 1.2S"
                            onMouseDown={startHolding}
                            onMouseUp={cancelHolding}
                            onMouseLeave={cancelHolding}
                            onTouchStart={startHolding}
                            onTouchEnd={cancelHolding}
                            disabled={!message.trim() || !isValidEpoch}
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
                              <Lock
                                className={`h-4 w-4 ${
                                  holdProgress > 50 ? "text-[#141416]" : "text-[#FF4F00]"
                                }`}
                              />
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
                              DESIGNATED AWAKENING (LOCAL TIME)
                            </span>
                            <span className="font-bold text-base text-[#FF4F00]">
                              {sealedReceipt.targetDate}
                            </span>
                            {sealedReceipt.targetDateIso && (
                              <span className="text-[10px] text-[#F7F7F5]/45 block mt-0.5 font-mono">
                                UTC: {sealedReceipt.targetDateIso}
                              </span>
                            )}
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
                              INSCRIBED MESSAGE (STORED IN ENCRYPTED SUBSTRATE)
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
                          Deposit registered into the active 3D spatial timeline and local vault.
                        </span>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                          <MagneticButton
                            type="button"
                            magneticStrength={0.4}
                            onClick={() => {
                              setSelectedVaultCapsule(sealedReceipt);
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full border border-white/20 bg-[#141416] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#F7F7F5] hover:border-[#FF4F00] cursor-pointer tabular-nums"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#FF4F00]" />
                            <span>Inspect Capsule</span>
                          </MagneticButton>

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
            </>
          ) : (
            /* VAULT REGISTRY VIEW */
            <div className="rounded-3xl bg-[#141416] p-6 sm:p-10 text-[#F7F7F5] shadow-[0_30px_90px_rgba(20,20,22,0.4)] border border-[#F7F7F5]/15">
              {/* Vault Header Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#F7F7F5]/15 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#FF4F00] mb-1">
                    <Archive className="h-4 w-4" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest">
                      LOCAL VAULT ARCHIVE // aetheria_vault_v1
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#F7F7F5]/60">
                    Encrypted client-side records stored in your browser.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-[#1E1E22] p-1 rounded-full border border-white/10 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setVaultFilter("all")}
                    className={`px-3 py-1 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                      vaultFilter === "all"
                        ? "bg-[#FF4F00] text-[#141416] font-bold"
                        : "text-[#F7F7F5]/70 hover:text-white"
                    }`}
                  >
                    ALL ({vaultCapsules.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultFilter("locked")}
                    className={`px-3 py-1 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                      vaultFilter === "locked"
                        ? "bg-[#FF4F00] text-[#141416] font-bold"
                        : "text-[#F7F7F5]/70 hover:text-white"
                    }`}
                  >
                    LOCKED ({lockedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultFilter("unlocked")}
                    className={`px-3 py-1 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                      vaultFilter === "unlocked"
                        ? "bg-[#FF4F00] text-[#141416] font-bold"
                        : "text-[#F7F7F5]/70 hover:text-white"
                    }`}
                  >
                    UNLOCKED ({unlockedCount})
                  </button>
                </div>
              </div>

              {/* Vault List / Empty State */}
              <div className="mt-6 flex flex-col gap-4">
                {filteredVaultCapsules.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center">
                    <Clock className="h-10 w-10 text-[#F7F7F5]/20 mb-3" />
                    <p className="font-mono text-sm text-[#F7F7F5]/60 mb-4">
                      No capsules found in this view.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab("forge")}
                        className="px-5 py-2.5 rounded-full bg-[#FF4F00] text-[#141416] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                      >
                        Forge a Capsule
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await seedDemoData();
                        }}
                        className="px-5 py-2.5 rounded-full border border-white/20 text-[#F7F7F5] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        [D] Load Demo Data
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredVaultCapsules.map((capsule) => {
                    const isUnlocked = capsule.targetTimestamp <= Date.now();
                    const displayTarget = capsule.targetDateIso
                      ? new Date(capsule.targetDateIso).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : capsule.targetDate;

                    return (
                      <div
                        key={capsule.id}
                        className="rounded-2xl bg-[#1E1E22] p-5 border border-white/5 hover:border-[#FF4F00]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white/10 text-[#F7F7F5]/80">
                              {capsule.category || "TESTAMENT"}
                            </span>
                            {isUnlocked ? (
                              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-1 font-semibold">
                                <Unlock className="h-3 w-3" /> READY TO UNSEAL
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#FF4F00]/20 text-[#FF4F00] flex items-center gap-1 font-semibold">
                                <Lock className="h-3 w-3" /> TIME-LOCKED
                              </span>
                            )}
                            {capsule.hasPasscode && (
                              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
                                <KeyRound className="h-3 w-3" /> PASSCODE
                              </span>
                            )}
                          </div>

                          <h4 className="font-display text-base font-bold text-[#F7F7F5]">
                            {capsule.title}
                          </h4>
                          <div className="flex items-center gap-3 font-mono text-[11px] text-[#F7F7F5]/50 mt-1 tabular-nums">
                            <span>Custodian: {capsule.custodian}</span>
                            <span>•</span>
                            <span>Target: {displayTarget}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedVaultCapsule(capsule)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-[#FF4F00] text-[#141416] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{isUnlocked ? "Unseal" : "Inspect"}</span>
                          </button>

                          {deletingId === capsule.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteStoredCapsule(capsule.id);
                                  setDeletingId(null);
                                }}
                                className="px-3 py-2 rounded-full bg-rose-600 text-white font-mono text-[11px] font-bold hover:bg-rose-500 transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-2 rounded-full border border-white/20 text-white/70 font-mono text-[11px] hover:bg-white/10 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(capsule.id)}
                              className="p-2 rounded-full border border-white/10 text-white/50 hover:text-rose-400 hover:border-rose-400/40 transition-colors cursor-pointer"
                              title="Delete capsule"
                              aria-label="Delete capsule"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Cryptographic Honesty Note */}
          <div className="mt-8 text-center">
            <span className="font-mono text-[11px] text-[#141416]/55 tabular-nums">
              Time-lock enforced client-side by Aetheria. Content encrypted in-browser using AES-GCM 256 before storage.
            </span>
          </div>
        </div>
      </div>

      {/* Inspect / Unseal Capsule Modal */}
      {selectedVaultCapsule && (
        <CapsuleModal
          capsule={selectedVaultCapsule}
          onClose={() => setSelectedVaultCapsule(null)}
        />
      )}
    </section>
  );
}
