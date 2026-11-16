// Web Crypto API (AES-GCM 256 & PBKDF2)
// Strictly follows zero-plaintext client-side encryption

export interface EncryptionResult {
  ciphertext: string; // Base64
  iv: string; // Base64
  salt?: string; // Base64 (for PBKDF2)
  keyPackage?: string; // Base64 (raw AES key for non-passcode auto-unlock)
  shaKey: string;
  hasPasscode: boolean;
  encryptedImage?: {
    ciphertext: string; // Base64
    iv: string; // Base64
  };
}

export interface DecryptionParams {
  ciphertext: string;
  iv: string;
  salt?: string;
  keyPackage?: string;
  passcode?: string;
}

function getSubtleCrypto(): SubtleCrypto {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error("Web Crypto API is not supported in this runtime environment.");
}

export function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

export function base64ToUint8Array(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export async function computeSha512(data: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  const digestBuffer = await subtle.digest("SHA-512", enc.encode(data));
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `SHA512:${hashHex}`;
}

/**
 * Encrypts a message (and optional image buffer) using AES-GCM (256-bit).
 * If passcode is provided: derives key via PBKDF2 (100,000 iterations, SHA-256).
 * If no passcode: generates a random 256-bit AES key and exports it as keyPackage for client auto-unlock.
 */
export async function encryptCapsulePayload(
  content: string,
  passcode?: string,
  imageBuffer?: ArrayBuffer
): Promise<EncryptionResult> {
  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const shaKey = await computeSha512(content);

  if (passcode && passcode.trim().length > 0) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const baseKey = await subtle.importKey(
      "raw",
      enc.encode(passcode),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const encryptedBuffer = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as unknown as BufferSource,
      },
      derivedKey,
      enc.encode(content)
    );

    let encryptedImage: { ciphertext: string; iv: string } | undefined;
    if (imageBuffer && imageBuffer.byteLength > 0) {
      const imgIv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedImgBuffer = await subtle.encrypt(
        {
          name: "AES-GCM",
          iv: imgIv as unknown as BufferSource,
        },
        derivedKey,
        imageBuffer
      );
      encryptedImage = {
        ciphertext: bufferToBase64(encryptedImgBuffer),
        iv: bufferToBase64(imgIv),
      };
    }

    return {
      ciphertext: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv),
      salt: bufferToBase64(salt),
      shaKey,
      hasPasscode: true,
      encryptedImage,
    };
  } else {
    const aesKey = await subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );

    const exportedRawKey = await subtle.exportKey("raw", aesKey);
    const keyPackage = bufferToBase64(exportedRawKey);

    const encryptedBuffer = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as unknown as BufferSource,
      },
      aesKey,
      enc.encode(content)
    );

    let encryptedImage: { ciphertext: string; iv: string } | undefined;
    if (imageBuffer && imageBuffer.byteLength > 0) {
      const imgIv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedImgBuffer = await subtle.encrypt(
        {
          name: "AES-GCM",
          iv: imgIv as unknown as BufferSource,
        },
        aesKey,
        imageBuffer
      );
      encryptedImage = {
        ciphertext: bufferToBase64(encryptedImgBuffer),
        iv: bufferToBase64(imgIv),
      };
    }

    return {
      ciphertext: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv),
      keyPackage,
      shaKey,
      hasPasscode: false,
      encryptedImage,
    };
  }
}

/**
 * Decrypts an encrypted capsule text payload.
 * Throws an error if the passcode is incorrect or payload is corrupted.
 */
export async function decryptCapsulePayload(
  params: DecryptionParams
): Promise<string> {
  const decryptedBuffer = await decryptBinaryPayload(params);
  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Decrypts an encrypted binary payload (such as image bytes).
 */
export async function decryptBinaryPayload(
  params: DecryptionParams
): Promise<ArrayBuffer> {
  const subtle = getSubtleCrypto();
  const ivBytes = base64ToUint8Array(params.iv);
  const ciphertextBytes = base64ToUint8Array(params.ciphertext);

  if (params.salt && params.passcode) {
    const saltBytes = base64ToUint8Array(params.salt);
    const enc = new TextEncoder();
    const baseKey = await subtle.importKey(
      "raw",
      enc.encode(params.passcode),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes as unknown as BufferSource,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    try {
      const decryptedBuffer = await subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBytes as unknown as BufferSource,
        },
        derivedKey,
        ciphertextBytes as unknown as BufferSource
      );
      return decryptedBuffer;
    } catch {
      throw new Error("Invalid passcode. The cryptographic seal rejected your key.");
    }
  } else if (params.keyPackage) {
    const rawKeyBytes = base64ToUint8Array(params.keyPackage);
    const aesKey = await subtle.importKey(
      "raw",
      rawKeyBytes as unknown as BufferSource,
      "AES-GCM",
      false,
      ["decrypt"]
    );

    try {
      const decryptedBuffer = await subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBytes as unknown as BufferSource,
        },
        aesKey,
        ciphertextBytes as unknown as BufferSource
      );
      return decryptedBuffer;
    } catch {
      throw new Error("Decryption failed. Substrate or key corrupted.");
    }
  } else {
    throw new Error("Missing decryption key or passcode.");
  }
}
