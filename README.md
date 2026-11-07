# 🌌 Aetheria® — Architectural Time Depository

> **"Preserve the unseen."**  
> An award-winning, editorial scroll-driven time-capsule platform where users seal letters, photographs, and promises into cryptographic relics destined to awaken only in appointed future horizons.

[![Next.js 14](https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer%20Motion-purple?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🎨 Visual Identity & Color System

Aetheria features an architectural, editorial aesthetic driven by Swiss typography, exposed structural grid hairlines, and the **Yellow-Green & Creole Brown** master palette:

| Token | Hex / Value | Architectural Role |
| :--- | :--- | :--- |
| **`--bg-primary`** | `#C6E385` | Dominant 70%+ canvas background (Yellow Green Shade) |
| **`--bg-lime-soft`** | `#D3EC9A` | Subtle highlight glow & atmospheric illumination |
| **`--ink-creole`** | `#1F0E06` | Primary display typography, solid cards, & central monolith |
| **`--surface-umber`** | `#2B150B` | Elevated card surfaces, bento wells, and chamber vaults |
| **`--border-creole`** | `rgba(31, 14, 6, 0.16)` | Exposed 1px Swiss architectural grid lines |
| **`--ink-muted`** | `rgba(31, 14, 6, 0.62)` | Secondary metadata, coordinates, and technical timestamps |

---

## 🏛️ Scroll-Driven Storytelling Chapters

1. **Act 0: Expanding Monolith Portal (Hero)**
   - Centered Creole Brown (`#1F0E06`) 3D monolith on `#C6E385` canvas with rotating astrolabe rings.
   - Smooth live year ticker counting from `2026` to `2100`.
   - Monumental split headline (*"Preserve the"* splits left, *"unseen."* splits right) as the portal expands to swallow the viewport.
2. **Act 1: The Manifesto Chamber**
   - Immersive dark vault interior (`#1F0E06`) with word-by-word scroll-linked illumination and vertical progress gauge.
3. **Act 2: Three Quiet Steps (Method)**
   - 3D perspective stacked card deck on `#C6E385` canvas.
   - Rolling mechanical phase counter (`01`, `02`, `03`) synchronized directly with scroll progress.
4. **Act 3: Public Constellation Archive**
   - Parallax horizontal timeline slider with live watermark year odometer (`2026` $\to$ `2051`).
   - Archival cards with countdowns, metadata tags, and cryptographic status.
5. **Act 4: Interactive Time-Lock Simulator**
   - Interactive console allowing users to test time-locking to future years (`2028` $\to$ `2080`), input recipients and messages, and trigger cryptographic seal animations.
6. **Act 5: Monumental Footer**
   - Deep Creole Brown curtain with generous padding, display headline (*"What will you leave behind?"*), and quick navigation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Lander2007/Aetheria.git
cd Aetheria

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
Aetheria/
├── app/
│   ├── globals.css        # CSS variables & Tailwind directives
│   ├── icon.svg           # Brand favicon vector
│   ├── layout.tsx         # Root layout with fonts & theme metadata
│   └── page.tsx           # Full scroll-driven experience (Acts 0–5)
├── components/            # Reusable UI primitives & layout modules
├── lib/                   # Utility helpers
├── public/                # Static assets & vector marks
├── tailwind.config.ts     # Architectural design tokens & themes
└── tsconfig.json          # TypeScript compiler options
```

---

## 📜 License

Distributed under the MIT License.
