export type CapsuleType = "message" | "memory" | "goal";
export type CapsuleVisibility = "public" | "private";

export interface TimeCapsule {
  id: string;
  year: number;
  targetDate: string; // ISO or formatted date
  title: string;
  category: string;
  custodian: string;
  description: string; // Plaintext when decrypted or public preview
  shaKey: string;
  imageUrl: string;
  targetTimestamp: number; // For live countdown (epoch ms)

  // Web Crypto AES-GCM 256 & metadata
  createdAt?: string;
  type?: CapsuleType;
  visibility?: CapsuleVisibility;
  isEncrypted?: boolean;
  ciphertext?: string; // base64 encoded ciphertext
  iv?: string; // base64 encoded IV
  salt?: string; // base64 encoded salt for PBKDF2
  keyPackage?: string; // base64 encoded raw key for non-passcode unlock
  hasPasscode?: boolean;
}

export interface StepPhase {
  number: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  technicalTag: string;
  iconName: string;
}
