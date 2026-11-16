// Client-side image validation and canvas compression
// Resizes longest edge to max 1600px and exports as WebP/JPEG at ~0.8 quality

export interface CompressedImageResult {
  buffer: ArrayBuffer;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  previewUrl: string;
  width: number;
  height: number;
}

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_DIMENSION = 1600; // max longest side

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function validateAndCompressImage(
  file: File
): Promise<{ result?: CompressedImageResult; error?: string }> {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      error: "Unsupported format. Only JPG, PNG, and WEBP files are permitted.",
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      error: `File size (${sizeMb} MB) exceeds maximum limit of 8 MB.`,
    };
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return { error: "Image compression is only supported in browser environment." };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Scale to max 1600px along longest edge
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({ error: "Failed to initialize canvas graphics context." });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Attempt WebP export at 0.8 quality, fallback to JPEG
      const exportBlob = (type: string, quality: number): Promise<Blob | null> => {
        return new Promise((res) => {
          canvas.toBlob((b) => res(b), type, quality);
        });
      };

      let blob = await exportBlob("image/webp", 0.8);
      let mimeType = "image/webp";

      if (!blob || blob.size === 0) {
        blob = await exportBlob("image/jpeg", 0.8);
        mimeType = "image/jpeg";
      }

      if (!blob) {
        resolve({ error: "Canvas failed to export compressed image." });
        return;
      }

      const buffer = await blob.arrayBuffer();
      const previewUrl = URL.createObjectURL(blob);

      resolve({
        result: {
          buffer,
          mimeType,
          originalName: file.name,
          sizeBytes: buffer.byteLength,
          previewUrl,
          width,
          height,
        },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ error: "Failed to decode image file. File may be corrupted." });
    };

    img.src = objectUrl;
  });
}
