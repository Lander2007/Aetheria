# 🌌 Aetheria® — Interactive Digital Time-Capsule Depository

> **"Preserve the unseen."**  
> An interactive digital time-capsule web application built with Next.js 15, Tailwind CSS, Framer Motion, React Three Fiber, and the Web Crypto API. Sealed capsules are encrypted client-side using AES-GCM 256 and unlock only when appointed future horizons arrive.

---

## 🏛️ Architecture & Security

- **Client-Side Cryptographic Isolation:**
  - Content encryption uses the **Web Crypto API (`window.crypto.subtle`)** with **AES-GCM (256-bit)**.
  - **Passcode Protection:** Derives keys via **PBKDF2** (100,000 iterations, SHA-256, random 16-byte cryptographic salt).
  - **Non-Passcode Time-Locks:** Generates a random 256-bit AES key. The client refuses decryption during the locked state, displaying zero plaintext. Upon target epoch arrival, the client automatically unseals and decrypts the payload.
  - **Temporal Integrity:** SHA-512 audit verification keys.
- **Persistence (`localStorage`):**
  - Stored under schema `aetheria_vault_v1` with event-driven cross-component synchronization (`aetheria_vault_updated`).
  - Survives browser reloads and sessions.
- **Live Horological Countdown (`useCountdown`):**
  - Accurate to the second with UTC timestamps.
  - Automatic live transition from **TIME-LOCKED** $\to$ **UNLOCKED** without requiring a page refresh.
- **Dedicated Capsule Route:**
  - Shareable route `/c/[id]` allows direct viewing and unsealing of individual capsules.

---

## ⚡ Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🚀 Deployment to Vercel

Aetheria is 100% standard Next.js (App Router) and is ready for 1-click deployment on Vercel:

1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Framework Preset: **Next.js**
4. Root Directory: `./`
5. Click **Deploy**. Zero environment variables required for core functionality.

---

## ⌨️ Shortcuts & Demo Mode

| Key | Action |
| :--- | :--- |
| **`D`** | **Seed Live Demo Data** (Loads 3 demo capsules: Unlocked note, 20s live unseal, Passcode capsule `1234`) |
| **`?`** | Open Horological Shortcuts HUD |
| **`1` - `5`** | Navigate between Chapters (Initiation, Chamber, Steps, Archive, Vault) |
| **`M`** | Toggle Horological ticking audio synthesis |
| **`T`** | Smooth scroll back to top |

---

## 📜 Cryptographic Honesty Note

*Time-lock enforced client-side by Aetheria. Content encrypted in-browser using AES-GCM 256 before storage.*
