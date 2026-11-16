// LocalStorage Persistence Layer
// Schema: aetheria_vault_v1 with fallback and event synchronization

import { TimeCapsule } from "./types";
import { encryptCapsulePayload } from "./crypto";

export const VAULT_STORAGE_KEY = "aetheria_vault_v1";
export const LEGACY_STORAGE_KEY = "aetheria_custom_capsules";

export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Retrieves all user capsules stored locally.
 */
export function getStoredCapsules(): TimeCapsule[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback to legacy key
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("[Aetheria] Failed to read vault storage:", err);
  }
  return [];
}

/**
 * Saves or updates a capsule in the vault.
 */
export function saveStoredCapsule(capsule: TimeCapsule): void {
  if (!isClient()) return;
  try {
    const current = getStoredCapsules();
    const existingIdx = current.findIndex((c) => c.id === capsule.id);
    let updated: TimeCapsule[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = capsule;
    } else {
      updated = [capsule, ...current];
    }
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("aetheria_vault_updated", { detail: updated }));
  } catch (err) {
    console.error("[Aetheria] Failed to save to vault storage:", err);
  }
}

/**
 * Deletes a capsule from the vault by ID.
 */
export function deleteStoredCapsule(id: string): void {
  if (!isClient()) return;
  try {
    const current = getStoredCapsules();
    const updated = current.filter((c) => c.id !== id);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("aetheria_vault_updated", { detail: updated }));
  } catch (err) {
    console.error("[Aetheria] Failed to delete from vault storage:", err);
  }
}

/**
 * Clears all user-created vault capsules and resets storage.
 */
export function resetAllVaultData(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("aetheria_vault_updated", { detail: [] }));
  } catch (err) {
    console.error("[Aetheria] Failed to reset vault storage:", err);
  }
}

/**
 * Seeds the 3 required live demo capsules:
 * 1. Already unlocked heartfelt note
 * 2. Unlocks in 20 seconds live (demonstrates auto-unseal without refresh)
 * 3. Passcode-protected capsule (passcode: "1234")
 */
export async function seedDemoData(): Promise<TimeCapsule[]> {
  const now = Date.now();

  // 1. Already unlocked note
  const note1Content =
    "If you are reading this, the silence of the alpine morning held true. Everything we built with our hands has stood the test of wind and season. Remember to look up.";
  const enc1 = await encryptCapsulePayload(note1Content);
  const capsule1: TimeCapsule = {
    id: `demo-unlocked-${now}`,
    year: 2026,
    targetDate: new Date(now - 3600 * 1000).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    title: "A Letter Across Solstices",
    category: "PERSONAL TESTAMENT",
    custodian: "Julian to Elena",
    description: note1Content,
    shaKey: enc1.shaKey,
    imageUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: now - 3600 * 1000,
    targetDateIso: new Date(now - 3600 * 1000).toISOString(),
    createdAt: new Date(now - 7200 * 1000).toISOString(),
    type: "memory",
    visibility: "public",
    isEncrypted: true,
    ciphertext: enc1.ciphertext,
    iv: enc1.iv,
    keyPackage: enc1.keyPackage,
    hasPasscode: false,
  };

  // 2. Unlocks in 20 seconds live
  const note2Content =
    "The lock has dissolved! This memory was encrypted with AES-256-GCM and preserved untouched until this exact second. Welcome to the future.";
  const enc2 = await encryptCapsulePayload(note2Content);
  const targetTime2 = now + 20 * 1000;
  const capsule2: TimeCapsule = {
    id: `demo-live-20s-${now}`,
    year: 2026,
    targetDate: new Date(targetTime2).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    title: "Temporal Pulse (20s Live Unseal)",
    category: "LIVE DEMONSTRATION",
    custodian: "Aetheria Protocol",
    description: "AES-256 Encrypted Payload [Locked until live countdown completes]",
    shaKey: enc2.shaKey,
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: targetTime2,
    targetDateIso: new Date(targetTime2).toISOString(),
    createdAt: new Date(now).toISOString(),
    type: "message",
    visibility: "public",
    isEncrypted: true,
    ciphertext: enc2.ciphertext,
    iv: enc2.iv,
    keyPackage: enc2.keyPackage,
    hasPasscode: false,
  };

  // 3. Passcode-protected capsule (passcode: "1234")
  const note3Content =
    "Classified clearance verified. Passcode [1234] accepted. Subterranean archive coordinates: 46.2044° N, 6.1432° E. The eternal flame remains burning.";
  const enc3 = await encryptCapsulePayload(note3Content, "1234");
  const capsule3: TimeCapsule = {
    id: `demo-passcode-1234-${now}`,
    year: 2026,
    targetDate: "Unlocked · Requires Key [1234]",
    title: "The Custodian's Classified Archive",
    category: "CRYPTOGRAPHIC SANCTUARY",
    custodian: "Swiss Horological Archive",
    description: "Encrypted under SHA-256 derived PBKDF2 key (100k iterations). Passcode: 1234",
    shaKey: enc3.shaKey,
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    targetTimestamp: now - 1000, // Time passed, but guarded by passcode
    targetDateIso: new Date(now - 1000).toISOString(),
    createdAt: new Date(now - 10000).toISOString(),
    type: "goal",
    visibility: "private",
    isEncrypted: true,
    ciphertext: enc3.ciphertext,
    iv: enc3.iv,
    salt: enc3.salt,
    hasPasscode: true,
  };

  const demoList = [capsule2, capsule1, capsule3];
  if (isClient()) {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(demoList));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(demoList));
      window.dispatchEvent(new CustomEvent("aetheria_vault_updated", { detail: demoList }));
    } catch (err) {
      console.error("[Aetheria] Error saving demo data:", err);
    }
  }

  return demoList;
}

