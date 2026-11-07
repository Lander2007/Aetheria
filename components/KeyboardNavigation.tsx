"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, X, ArrowUp, Compass, Volume2 } from "lucide-react";

export function KeyboardNavigation() {
  const [hudOpen, setHudOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case "1": {
          const el = document.getElementById("act-hero");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          break;
        }
        case "2": {
          const el = document.getElementById("act-story");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          break;
        }
        case "3": {
          const el = document.getElementById("act-method");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          break;
        }
        case "4": {
          const el = document.getElementById("act-archive");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          break;
        }
        case "5": {
          const el = document.getElementById("seal-lock");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          break;
        }
        case "t":
        case "T": {
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
        }
        case "?": {
          setHudOpen((prev) => !prev);
          break;
        }
        case "Escape": {
          setHudOpen(false);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Bottom Left Quick Shortcut Pill */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:block">
        <button
          type="button"
          onClick={() => setHudOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-[#141416]/15 bg-[#E2E4E6]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#141416]/75 backdrop-blur-md transition-all hover:bg-[#141416] hover:text-[#FF4F00] shadow-sm cursor-pointer"
        >
          <Command className="h-3 w-3" />
          <span>NAV: [?]</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Architectural HUD Modal */}
      <AnimatePresence>
        {hudOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHudOpen(false)}
              className="absolute inset-0 bg-[#141416]/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-[#141416] p-8 text-[#F7F7F5] border border-[#FF4F00]/30 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#F7F7F5]/15 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Command className="h-4 w-4 text-[#FF4F00]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF4F00]">
                    HOROLOGICAL SHORTCUTS HUD
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHudOpen(false)}
                  className="rounded-full p-1 text-[#F7F7F5]/60 hover:text-[#F7F7F5] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#F7F7F5]/10 pb-2">
                  <span className="text-[#F7F7F5]/75">Chapter 01: Initiation & Monolith</span>
                  <kbd className="rounded bg-[#1E1E22] px-2 py-0.5 text-[#FF4F00] border border-[#141416]">1</kbd>
                </div>
                <div className="flex items-center justify-between border-b border-[#F7F7F5]/10 pb-2">
                  <span className="text-[#F7F7F5]/75">Chapter 02: Chamber Manifesto</span>
                  <kbd className="rounded bg-[#1E1E22] px-2 py-0.5 text-[#FF4F00] border border-[#141416]">2</kbd>
                </div>
                <div className="flex items-center justify-between border-b border-[#F7F7F5]/10 pb-2">
                  <span className="text-[#F7F7F5]/75">Chapter 03: Three Quiet Steps</span>
                  <kbd className="rounded bg-[#1E1E22] px-2 py-0.5 text-[#FF4F00] border border-[#141416]">3</kbd>
                </div>
                <div className="flex items-center justify-between border-b border-[#F7F7F5]/10 pb-2">
                  <span className="text-[#F7F7F5]/75">Chapter 04: Archival Gallery</span>
                  <kbd className="rounded bg-[#1E1E22] px-2 py-0.5 text-[#FF4F00] border border-[#141416]">4</kbd>
                </div>
                <div className="flex items-center justify-between border-b border-[#F7F7F5]/10 pb-2">
                  <span className="text-[#F7F7F5]/75">Chapter 05: Time-Lock Vault</span>
                  <kbd className="rounded bg-[#1E1E22] px-2 py-0.5 text-[#FF4F00] border border-[#141416]">5</kbd>
                </div>
                <div className="flex items-center justify-between border-b border-[#F7F7F5]/10 pb-2">
                  <span className="text-[#F7F7F5]/75">Toggle Horological Sound</span>
                  <kbd className="rounded bg-[#1E1E22] px-2 py-0.5 text-[#FF4F00] border border-[#141416]">M</kbd>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#F7F7F5]/75">Scroll Back to Top</span>
                  <kbd className="rounded bg-[#1E1E22] px-2 py-0.5 text-[#FF4F00] border border-[#141416]">T</kbd>
                </div>
              </div>

              <div className="mt-6 border-t border-[#F7F7F5]/15 pt-4 text-center font-mono text-[10px] text-[#F7F7F5]/50">
                SWISS TEMPORAL VAULT // PRESS [ESC] TO CLOSE
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
