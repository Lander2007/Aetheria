"use client";

import React, { useState, useEffect, useRef } from "react";

interface CipherTypewriterProps {
  phrases?: string[];
  text?: string;
  cycleInterval?: number;
  charSpeed?: number;
  cursorColor?: string;
  showCursor?: boolean;
  className?: string;
  cursorClassName?: string;
  oneShot?: boolean;
}

const SCRAMBLE_SYMBOLS = ["0", "1", "—", "/", "✦", "·", "X", "8"];

export function CipherTypewriter({
  phrases = ["the unseen."],
  text,
  cycleInterval = 3600,
  charSpeed = 45,
  cursorColor,
  showCursor = true,
  className = "",
  cursorClassName = "",
  oneShot = false,
}: CipherTypewriterProps) {
  const stableTarget = text || phrases[0] || "";
  const phrasesKey = text ? text : phrases.join("|");

  const [displayText, setDisplayText] = useState(stableTarget);
  const [isTyping, setIsTyping] = useState(false);
  const phraseIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const phraseList = text ? [text] : phrases;

    // One-shot mode: fast decode scramble effect on mount
    if (oneShot) {
      let frame = 0;
      const totalFrames = 3;

      const decodeStep = () => {
        if (isCancelled) return;
        if (frame < totalFrames) {
          const scrambled = stableTarget
            .split("")
            .map((c) =>
              c === " "
                ? " "
                : SCRAMBLE_SYMBOLS[
                    Math.floor(Math.random() * SCRAMBLE_SYMBOLS.length)
                  ]
            )
            .join("");
          setDisplayText(scrambled);
          frame++;
          timeoutRef.current = setTimeout(decodeStep, 25);
        } else {
          setDisplayText(stableTarget);
          setIsTyping(false);
        }
      };

      timeoutRef.current = setTimeout(decodeStep, 60);

      return () => {
        isCancelled = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    // Cycling phrases mode
    const scheduleNextCycle = () => {
      if (isCancelled) return;
      timeoutRef.current = setTimeout(() => {
        if (isCancelled) return;
        triggerScramble();
      }, cycleInterval);
    };

    const triggerScramble = () => {
      let frame = 0;
      const totalScrambleFrames = 3;
      const currentTarget = phraseList[phraseIndexRef.current % phraseList.length];

      const scrambleTick = () => {
        if (isCancelled) return;
        if (frame < totalScrambleFrames) {
          const scrambled = currentTarget
            .split("")
            .map((c) =>
              c === " "
                ? " "
                : SCRAMBLE_SYMBOLS[
                    Math.floor(Math.random() * SCRAMBLE_SYMBOLS.length)
                  ]
            )
            .join("");
          setDisplayText(scrambled);
          frame++;
          timeoutRef.current = setTimeout(scrambleTick, 50);
        } else {
          // Switch to next phrase and type in
          phraseIndexRef.current = (phraseIndexRef.current + 1) % phraseList.length;
          typeInPhrase(phraseList[phraseIndexRef.current]);
        }
      };

      scrambleTick();
    };

    const typeInPhrase = (targetPhrase: string) => {
      let charIdx = 0;
      setIsTyping(true);
      setDisplayText("");

      const charTick = () => {
        if (isCancelled) return;
        if (charIdx <= targetPhrase.length) {
          setDisplayText(targetPhrase.slice(0, charIdx));
          charIdx++;
          timeoutRef.current = setTimeout(charTick, charSpeed);
        } else {
          setIsTyping(false);
          scheduleNextCycle();
        }
      };

      charTick();
    };

    scheduleNextCycle();

    return () => {
      isCancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phrasesKey, cycleInterval, charSpeed, oneShot]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      {showCursor && (
        <span
          aria-hidden="true"
          style={cursorColor ? { backgroundColor: cursorColor } : undefined}
          className={`inline-block w-[2px] h-[0.8em] ml-1.5 align-middle bg-current transition-opacity duration-150 ${
            isTyping ? "opacity-100" : "animate-pulse"
          } ${cursorClassName}`}
        />
      )}
    </span>
  );
}
