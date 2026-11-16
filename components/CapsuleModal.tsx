"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  Unlock,
  ShieldCheck,
  Copy,
  Check,
  Download,
  KeyRound,
  AlertCircle,
  Sparkles,
  Share2,
  ImageIcon,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TimeCapsule } from "@/lib/types";
import { decryptCapsulePayload, decryptBinaryPayload } from "@/lib/crypto";
import { getEncryptedImageRecord } from "@/lib/imageStore";
import { useCountdown } from "@/hooks/useCountdown";

interface CapsuleModalProps {
  capsule: TimeCapsule | null;
  onClose: () => void;
}

export function CapsuleModal({ capsule, onClose }: CapsuleModalProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [justAutoUnlocked, setJustAutoUnlocked] = useState(false);

  // Keep track of active object URL for cleanup
  const activeBlobUrlRef = useRef<string | null>(null);

  const cleanupBlobUrl = useCallback(() => {
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
  }, []);

  const handleUnlockEvent = useCallback(() => {
    setJustAutoUnlocked(true);
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FF4F00", "#141416", "#F7F7F5"],
      });
    } catch {
      // ignore
    }
  }, []);

  const countdown = useCountdown(
    capsule ? capsule.targetTimestamp : 0,
    handleUnlockEvent
  );

  // Helper to decrypt and load image for non-passcode capsules
  const loadNonPasscodeImage = useCallback(async (cap: TimeCapsule) => {
    if (cap.hasImage) {
      setIsLoadingImage(true);
      try {
        const record = await getEncryptedImageRecord(cap.id);
        if (record && cap.keyPackage) {
          const buf = await decryptBinaryPayload({
            ciphertext: record.ciphertext,
            iv: record.iv,
            keyPackage: cap.keyPackage,
          });
          const blob = new Blob([buf], { type: record.mimeType });
          cleanupBlobUrl();
          const url = URL.createObjectURL(blob);
          activeBlobUrlRef.current = url;
          setDecryptedImageUrl(url);
        }
      } catch (err) {
        console.warn("[Aetheria] Image auto-decrypt failed:", err);
      } finally {
        setIsLoadingImage(false);
      }
    } else if (cap.imageUrl) {
      setDecryptedImageUrl(cap.imageUrl);
    }
  }, [cleanupBlobUrl]);

  // Reset local state when opened capsule changes
  useEffect(() => {
    cleanupBlobUrl();
    setDecryptedImageUrl(null);
    setDecryptedText(null);
    setPasscode("");
    setPasscodeError("");
    setJustAutoUnlocked(false);

    if (!capsule) return;

    // If already unlocked and not protected by passcode, auto-decrypt immediately
    if (capsule.targetTimestamp <= Date.now()) {
      if (capsule.isEncrypted && capsule.ciphertext && capsule.iv && capsule.keyPackage && !capsule.hasPasscode) {
        decryptCapsulePayload({
          ciphertext: capsule.ciphertext,
          iv: capsule.iv,
          keyPackage: capsule.keyPackage,
        })
          .then((text) => setDecryptedText(text))
          .catch(() => setDecryptedText(capsule.description));

        loadNonPasscodeImage(capsule);
      } else if (!capsule.isEncrypted || !capsule.hasPasscode) {
        setDecryptedText(capsule.description);
        loadNonPasscodeImage(capsule);
      }
    }
  }, [capsule, cleanupBlobUrl, loadNonPasscodeImage]);

  // When live countdown hits 0, auto-decrypt non-passcode capsules and images
  useEffect(() => {
    if (countdown.isUnlocked && capsule && !decryptedText && !capsule.hasPasscode) {
      if (capsule.isEncrypted && capsule.ciphertext && capsule.iv && capsule.keyPackage) {
        decryptCapsulePayload({
          ciphertext: capsule.ciphertext,
          iv: capsule.iv,
          keyPackage: capsule.keyPackage,
        })
          .then((text) => setDecryptedText(text))
          .catch(() => setDecryptedText(capsule.description));

        loadNonPasscodeImage(capsule);
      } else {
        setDecryptedText(capsule.description);
        loadNonPasscodeImage(capsule);
      }
    }
  }, [countdown.isUnlocked, capsule, decryptedText, loadNonPasscodeImage]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrl();
    };
  }, [cleanupBlobUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!capsule) return null;

  const displayTargetDate = capsule.targetDateIso
    ? new Date(capsule.targetDateIso).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      })
    : capsule.targetDate;

  const copyHash = () => {
    navigator.clipboard.writeText(capsule.shaKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/c/${capsule.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePasscodeDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setIsDecrypting(true);
    setPasscodeError("");

    try {
      if (!capsule.ciphertext || !capsule.iv || !capsule.salt) {
        throw new Error("Missing cryptographic substrate parameters.");
      }
      const plain = await decryptCapsulePayload({
        ciphertext: capsule.ciphertext,
        iv: capsule.iv,
        salt: capsule.salt,
        passcode: passcode.trim(),
      });
      setDecryptedText(plain);

      // Now decrypt image if attached
      if (capsule.hasImage) {
        setIsLoadingImage(true);
        try {
          const record = await getEncryptedImageRecord(capsule.id);
          if (record) {
            const buf = await decryptBinaryPayload({
              ciphertext: record.ciphertext,
              iv: record.iv,
              salt: capsule.salt,
              passcode: passcode.trim(),
            });
            const blob = new Blob([buf], { type: record.mimeType });
            cleanupBlobUrl();
            const url = URL.createObjectURL(blob);
            activeBlobUrlRef.current = url;
            setDecryptedImageUrl(url);
          }
        } catch (imgErr) {
          console.warn("[Aetheria] Image passcode decrypt failed:", imgErr);
        } finally {
          setIsLoadingImage(false);
        }
      } else if (capsule.imageUrl) {
        setDecryptedImageUrl(capsule.imageUrl);
      }

      setPasscode("");
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF4F00", "#141416", "#F7F7F5"],
        });
      } catch {
        // ignore
      }
    } catch {
      setPasscodeError("Invalid passcode. The cryptographic seal rejected your key.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const downloadCertificate = () => {
    const certText = `------------------------------------------------------------
AETHERIA ARCHIVAL DEPOSITORY // PROVENANCE CERTIFICATE
------------------------------------------------------------
CAPSULE ID:     ${capsule.id}
TITLE:          ${capsule.title}
CATEGORY:       ${capsule.category}
CUSTODIAN:      ${capsule.custodian}
AWAKENING DATE: ${displayTargetDate} (EPOCH ${capsule.year})
TIMEZONE SPEC:  UTC ISO: ${capsule.targetDateIso || "ARCHIVAL HOROLOGY"}
CIPHER SUITE:   AES-256-GCM / VDF WESOLOWSKI PROTOCOL
STORAGE MEDIUM: 5D OPTICAL QUARTZ SUBSTRATE (1,000+ YR HALF-LIFE)
GEO-COORDINATE: 46.2044° N, 6.1432° E (SWISS HOROLOGICAL OBSERVATORY)
MEDIA ATTACHED: ${capsule.hasImage ? `YES (${capsule.imageName || "Encrypted Image"})` : "NONE"}

TEMPORAL AUDIT KEY (SHA-512):
${capsule.shaKey}

INSCRIBED CONTENT TESTAMENT:
"${decryptedText || "[CONTENT ENCRYPTED UNDER TIME-LOCK]"}"

STATUS: ${countdown.isUnlocked ? "UNLOCKED & DECRYPTED" : "CRYPTOGRAPHICALLY TIME-LOCKED"}
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

  // Determine if the capsule is strictly locked or waiting for passcode
  const isLockedOrWaitingPasscode = !countdown.isUnlocked || (capsule.hasPasscode && !decryptedText);

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
              {countdown.isUnlocked ? (
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Unlock className="h-3 w-3" /> UNLOCKED
                </span>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FF4F00]/20 text-[#FF4F00] border border-[#FF4F00]/30 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> TIME-LOCKED
                </span>
              )}
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
            {/* Visual Substrate Container: ZERO DOM <img> when locked */}
            <div className="md:col-span-5 relative h-60 md:h-full rounded-2xl overflow-hidden bg-[#1E1E22] min-h-[220px] flex items-center justify-center border border-white/5">
              {isLockedOrWaitingPasscode ? (
                /* LOCKED STATE: Strictly NO <img> in DOM, NO network, NO blurred preview */
                <div className="flex flex-col items-center justify-center p-6 text-center select-none w-full h-full bg-[#141416]/70">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E1E22] border border-[#FF4F00]/30 mb-3 shadow-inner">
                    <Lock className="h-5 w-5 text-[#FF4F00]" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#FF4F00] font-bold mb-1">
                    {capsule.hasImage ? "IMAGE SEALED" : "MEDIA SEALED"}
                  </span>
                  <span className="font-mono text-[10px] text-[#F7F7F5]/50 uppercase tracking-wider tabular-nums">
                    {capsule.hasImage && capsule.imageName ? capsule.imageName : `EPOCH ${capsule.year} · AES-256`}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141416] border border-white/10 font-mono text-[9px] text-[#F7F7F5]/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F00] animate-pulse" />
                    SUBSTRATE TIME-LOCKED
                  </span>
                </div>
              ) : (
                /* UNLOCKED STATE: Decrypted image revealed with animation */
                <div className="relative w-full h-full min-h-[220px]">
                  {decryptedImageUrl ? (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      src={decryptedImageUrl}
                      alt={capsule.title}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  ) : isLoadingImage ? (
                    <div className="h-full w-full flex items-center justify-center font-mono text-xs text-[#FF4F00] p-4 text-center">
                      <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-ping mr-2" />
                      DECRYPTING RELIC SUBSTRATE...
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-mono text-xs text-[#F7F7F5]/40 p-4 text-center">
                      NO IMAGE ATTACHED
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141416]/80 via-transparent to-transparent pointer-events-none rounded-2xl" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 tabular-nums">
                    <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                    <span>UNSEALED · EPOCH {capsule.year}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-[#F7F7F5] leading-tight mb-1">
                  {capsule.title}
                </h3>
                <p className="font-mono text-xs text-[#FF4F00] mb-4 tabular-nums">
                  Custodian: {capsule.custodian}
                </p>

                {/* Content Box: Decrypted vs Locked */}
                {countdown.isUnlocked ? (
                  capsule.hasPasscode && !decryptedText ? (
                    /* Passcode Entry Form */
                    <form
                      onSubmit={handlePasscodeDecrypt}
                      className="rounded-xl bg-[#1E1E22] p-4 border border-[#FF4F00]/30 mb-4"
                    >
                      <div className="flex items-center gap-2 mb-2 text-[#FF4F00]">
                        <KeyRound className="h-4 w-4" />
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                          PASSCODE REQUIRED TO UNSEAL
                        </span>
                      </div>
                      <p className="text-xs text-[#F7F7F5]/70 mb-3 font-sans">
                        This capsule was sealed with a client-side PBKDF2 passphrase.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="Enter passcode (e.g. 1234)"
                          className="flex-1 rounded-lg bg-[#141416] px-3 py-2 font-mono text-xs text-[#F7F7F5] border border-white/10 focus:border-[#FF4F00] focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!passcode.trim() || isDecrypting}
                          className="rounded-lg bg-[#FF4F00] px-4 py-2 font-mono text-xs font-bold text-[#141416] hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          {isDecrypting ? "DECRYPTING..." : "UNLOCK"}
                        </button>
                      </div>
                      {passcodeError && (
                        <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 font-mono">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{passcodeError}</span>
                        </div>
                      )}
                    </form>
                  ) : (
                    /* Decrypted Plaintext Content */
                    <div className="rounded-xl bg-[#1E1E22] p-4 border border-emerald-500/30 mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 flex items-center gap-1 font-semibold tabular-nums">
                          <Sparkles className="h-3 w-3" /> UNSEALED TESTAMENT (DECRYPTED)
                        </span>
                        {justAutoUnlocked && (
                          <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 animate-pulse">
                            JUST UNLOCKED LIVE
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-sm text-[#F7F7F5] leading-relaxed whitespace-pre-wrap">
                        {decryptedText || capsule.description}
                      </p>
                    </div>
                  )
                ) : (
                  /* Locked State - Zero Plaintext Preview */
                  <div className="rounded-xl bg-[#1E1E22] p-4 border border-[#FF4F00]/20 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF4F00] block mb-1 tabular-nums font-semibold flex items-center gap-1.5">
                      <Lock className="h-3 w-3" /> ENCRYPTED UNDER TIME-LOCK
                    </span>
                    <p className="font-mono text-xs text-[#F7F7F5]/50 leading-relaxed break-all select-none">
                      CIPHERTEXT::
                      {capsule.ciphertext
                        ? `${capsule.ciphertext.slice(0, 48)}...[AES-256-PROTECTED]`
                        : "[IMMUTABLE CRYPTOGRAPHIC SUBSTRATE · ZERO PREMATURE ACCESS]"}
                    </p>
                    <p className="font-sans text-[11px] text-[#F7F7F5]/40 mt-2 italic">
                      Zero plaintext is readable before the designated awakening hour.
                    </p>
                  </div>
                )}
              </div>

              {/* Countdown Ticker */}
              <div className="rounded-xl bg-[#1E1E22] p-3 border border-[#FF4F00]/25">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#F7F7F5]/50 block tabular-nums">
                    {countdown.isUnlocked
                      ? "AWAKENING STATUS"
                      : "TEMPORAL COUNTDOWN UNTIL OPENING"}
                  </span>
                  <span className="font-mono text-[9px] text-[#FF4F00] tabular-nums">
                    TARGET: {displayTargetDate}
                  </span>
                </div>
                {countdown.isUnlocked ? (
                  <div className="bg-[#141416] p-2.5 rounded-lg text-center font-mono">
                    <span className="text-sm font-bold text-emerald-400">
                      EPOCH REACHED · TIME-LOCK DISSOLVED
                    </span>
                  </div>
                ) : (
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
                        {String(countdown.minutes).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-[#FF4F00]/80 block uppercase font-semibold">MIN</span>
                    </div>
                    <div className="bg-[#141416] p-1.5 rounded-lg">
                      <span className="text-base font-bold text-[#FF4F00]">
                        {String(countdown.seconds).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-[#FF4F00]/80 block uppercase font-semibold">SEC</span>
                    </div>
                  </div>
                )}
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
              Swiss Horological Observatory // AES-256-GCM
            </span>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={copyShareLink}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#F7F7F5] hover:bg-white/10 transition-colors cursor-pointer tabular-nums"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied Link</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-[#F7F7F5]" />
                    <span>Share Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={downloadCertificate}
                className="flex items-center justify-center gap-2 rounded-full bg-[#FF4F00] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#141416] hover:bg-[#F7F7F5] transition-colors cursor-pointer tabular-nums"
              >
                <Download className="h-3.5 w-3.5 text-[#141416]" />
                <span>Export Certificate</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-full border border-[#F7F7F5]/30 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#F7F7F5] hover:bg-[#F7F7F5]/10 transition-colors cursor-pointer tabular-nums"
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
