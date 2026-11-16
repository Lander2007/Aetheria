// IndexedDB storage layer for encrypted capsule media
// Never stores unencrypted images; supports robust error handling and SSR safety

export interface EncryptedImageRecord {
  capsuleId: string;
  ciphertext: string; // Base64 AES-GCM ciphertext
  iv: string; // Base64 12-byte IV
  mimeType: string;
  originalName: string;
  sizeBytes: number;
}

const DB_NAME = "aetheria_indexeddb_v1";
const STORE_NAME = "encrypted_images";
const DB_VERSION = 1;

function isIndexedDbAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

export function openImageDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!isIndexedDbAvailable()) {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "capsuleId" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (err) => {
        console.warn("[Aetheria] IndexedDB open error:", err);
        resolve(null);
      };
    } catch (err) {
      console.warn("[Aetheria] IndexedDB initialization failed:", err);
      resolve(null);
    }
  });
}

export async function saveEncryptedImageRecord(
  record: EncryptedImageRecord
): Promise<boolean> {
  try {
    const db = await openImageDb();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn("[Aetheria] Failed to store encrypted image record.");
        resolve(false);
      };
    });
  } catch (err) {
    console.warn("[Aetheria] Error saving encrypted image to IndexedDB:", err);
    return false;
  }
}

export async function getEncryptedImageRecord(
  capsuleId: string
): Promise<EncryptedImageRecord | null> {
  try {
    const db = await openImageDb();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(capsuleId);

      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => {
        console.warn("[Aetheria] Failed to retrieve encrypted image record.");
        resolve(null);
      };
    });
  } catch (err) {
    console.warn("[Aetheria] Error getting encrypted image from IndexedDB:", err);
    return null;
  }
}

export async function deleteEncryptedImageRecord(capsuleId: string): Promise<void> {
  try {
    const db = await openImageDb();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(capsuleId);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("[Aetheria] Error deleting encrypted image from IndexedDB:", err);
  }
}

export async function clearAllEncryptedImageRecords(): Promise<void> {
  try {
    const db = await openImageDb();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("[Aetheria] Error clearing IndexedDB encrypted images:", err);
  }
}

/**
 * Generates an in-memory abstract sample image (orange-on-gray) with HTML5 Canvas.
 * Used for demo data without requiring external assets.
 */
export async function generateSampleDemoImage(): Promise<{
  buffer: ArrayBuffer;
  mimeType: string;
}> {
  if (typeof document === "undefined") {
    return { buffer: new ArrayBuffer(0), mimeType: "image/webp" };
  }

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark Charcoal background
    ctx.fillStyle = "#141416";
    ctx.fillRect(0, 0, 600, 400);

    // Subtle architectural grid hairlines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 40; x < 600; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 400);
      ctx.stroke();
    }
    for (let y = 40; y < 400; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(600, y);
      ctx.stroke();
    }

    // Glowing Signal Orange Astrolabe Core
    const grad = ctx.createRadialGradient(300, 200, 10, 300, 200, 140);
    grad.addColorStop(0, "rgba(255, 79, 0, 0.9)");
    grad.addColorStop(0.4, "rgba(255, 79, 0, 0.35)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(300, 200, 140, 0, Math.PI * 2);
    ctx.fill();

    // Central Precision Ring
    ctx.strokeStyle = "#FF4F00";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(300, 200, 75, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Concentric Ring
    ctx.strokeStyle = "rgba(247, 247, 245, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(300, 200, 42, 0, Math.PI * 2);
    ctx.stroke();

    // Micro Swiss Crosshairs
    ctx.fillStyle = "#F7F7F5";
    ctx.font = "10px monospace";
    ctx.fillText("ARCHIVAL RELIC // 46.2044° N, 6.1432° E", 20, 380);
    ctx.fillStyle = "#FF4F00";
    ctx.fillText("● AETHERIA PROTOCOL", 450, 380);
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          resolve({ buffer: new ArrayBuffer(0), mimeType: "image/webp" });
          return;
        }
        const buffer = await blob.arrayBuffer();
        resolve({ buffer, mimeType: "image/webp" });
      },
      "image/webp",
      0.85
    );
  });
}
