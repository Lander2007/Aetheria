"use client";

import { useState, useEffect, useRef } from "react";

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  isUnlocked: boolean;
  formatted: string;
}

export function useCountdown(
  targetTimestamp: number,
  onUnlock?: () => void
): CountdownState {
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;

  const calculate = (): CountdownState => {
    const now = Date.now();
    const diff = targetTimestamp - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSecondsRemaining: 0,
        isUnlocked: true,
        formatted: "00d 00h 00m 00s",
      };
    }

    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / (3600 * 24));
    const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSecondsRemaining: totalSec,
      isUnlocked: false,
      formatted,
    };
  };

  const [state, setState] = useState<CountdownState>(calculate);
  const previouslyUnlocked = useRef(state.isUnlocked);

  useEffect(() => {
    const checkAndUpdate = () => {
      const next = calculate();
      setState(next);

      if (next.isUnlocked && !previouslyUnlocked.current) {
        previouslyUnlocked.current = true;
        if (onUnlockRef.current) {
          onUnlockRef.current();
        }
      } else if (!next.isUnlocked) {
        previouslyUnlocked.current = false;
      }
    };

    checkAndUpdate();
    const interval = setInterval(checkAndUpdate, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return state;
}

