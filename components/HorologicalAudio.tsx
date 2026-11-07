"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * Pure Web Audio API Swiss Horological Escapement Synthesizer.
 * Synthesizes mechanical ticking sounds (escapement impulse and pallet release)
 * with zero external audio assets required.
 */
export function HorologicalAudio({
  variant = "minimal",
}: {
  variant?: "minimal" | "pill";
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playTick = (isTick: boolean) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(isTick ? 2400 : 1850, now);
    osc.frequency.exponentialRampToValueAtTime(isTick ? 400 : 300, now + 0.025);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(isTick ? 2800 : 2200, now);
    filter.Q.setValueAtTime(8, now);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  };

  const toggleSound = () => {
    initAudio();
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      let isTick = true;
      intervalRef.current = setInterval(() => {
        playTick(isTick);
        isTick = !isTick;
      }, 500);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        toggleSound();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  return (
    <button
      type="button"
      onClick={toggleSound}
      title="Toggle Swiss Horological Escapement Audio (Shortcut: M)"
      className="group relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#F7F7F5]/50 hover:text-[#F7F7F5] transition-colors cursor-pointer select-none bg-transparent border-0 p-0"
    >
      {/* 4-Bar Minimal Waveform Icon */}
      <div className="flex items-center gap-[2px] h-3 w-3 justify-center">
        <span
          className={`w-[1.5px] rounded-full transition-all duration-300 ${
            isPlaying ? "bg-[#FF4F00] animate-wave-1" : "h-1.5 bg-[#F7F7F5]/40 group-hover:bg-[#F7F7F5]/80"
          }`}
        />
        <span
          className={`w-[1.5px] rounded-full transition-all duration-300 ${
            isPlaying ? "bg-[#FF4F00] animate-wave-2" : "h-2.5 bg-[#F7F7F5]/40 group-hover:bg-[#F7F7F5]/80"
          }`}
        />
        <span
          className={`w-[1.5px] rounded-full transition-all duration-300 ${
            isPlaying ? "bg-[#FF4F00] animate-wave-3" : "h-1 bg-[#F7F7F5]/40 group-hover:bg-[#F7F7F5]/80"
          }`}
        />
        <span
          className={`w-[1.5px] rounded-full transition-all duration-300 ${
            isPlaying ? "bg-[#FF4F00] animate-wave-4" : "h-2 bg-[#F7F7F5]/40 group-hover:bg-[#F7F7F5]/80"
          }`}
        />
      </div>

      {/* Audio Text Label */}
      <span className={`transition-colors font-medium ${isPlaying ? "text-[#FF4F00] font-bold" : ""}`}>
        {isPlaying ? "SOUND ON" : "SOUND OFF"}
      </span>

      {/* Subtle [M] Badge */}
      <kbd className="rounded px-1 py-0.5 font-mono text-[8px] bg-white/[0.08] text-[#F7F7F5]/50 group-hover:text-[#F7F7F5]/80 font-bold">
        M
      </kbd>

      {/* Embedded CSS Animations for Waveform Bars */}
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { height: 3px; }
          50% { height: 11px; }
        }
        @keyframes wave2 {
          0%, 100% { height: 10px; }
          50% { height: 4px; }
        }
        @keyframes wave3 {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        @keyframes wave4 {
          0%, 100% { height: 11px; }
          50% { height: 5px; }
        }
        .animate-wave-1 {
          animation: wave1 0.48s infinite ease-in-out;
        }
        .animate-wave-2 {
          animation: wave2 0.58s infinite ease-in-out;
        }
        .animate-wave-3 {
          animation: wave3 0.42s infinite ease-in-out;
        }
        .animate-wave-4 {
          animation: wave4 0.54s infinite ease-in-out;
        }
      `}</style>
    </button>
  );
}
