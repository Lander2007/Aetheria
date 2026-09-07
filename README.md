<div align="center">

  <!-- Logo / Header Banner -->
  <br />
  <h1>🌌 AETHERIA</h1>
  <p><b>Cast your thoughts into the fabric of time.</b></p>

  <p>
    An interactive, cyberpunk-inspired digital time capsule platform where users lock memories, messages, and goals into encrypted capsules destined to open only in the future.
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Animation-Framer%20Motion-purple?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>

  <br />
</div>

---

<h2>🎨 Visual Identity & Theme</h2>

<p>Aetheria features a <b>Cyberpunk Neon-Space Fusion</b> aesthetics powered by heavy Glassmorphism and ambient glow dynamics.</p>

<table>
  <tr>
    <td width="25%"><b>Deep Void</b><br /><code>#05050a</code></td>
    <td width="25%"><b>Electric Lime</b><br /><code>#00ff87</code></td>
    <td width="25%"><b>Violet Flare</b><br /><code>#7b2cbf</code></td>
    <td width="25%"><b>Dark Glass</b><br /><code>rgba(15,15,26,0.6)</code></td>
  </tr>
</table>

---

<h2>✨ Key Features</h2>

<ul>
  <li><b>🔮 Interactive 3D / Canvas Hero:</b> Ambient particle fields responding directly to cursor movement and spatial interaction.</li>
  <li><b>⏳ Time-Locked Encryption:</b> Real-time countdown engine locking content until the exact specified timestamp.</li>
  <li><b>🌌 Public Constellations:</b> Explore public capsules submitted by users floating across a dynamic space grid.</li>
  <li><b>🔐 Passcode-Protected Storage:</b> Option to lock individual capsules with custom client-side encryption passcodes.</li>
  <li><b>✨ Micro-Interactions:</b> Responsive UI state changes, glowing borders, and smooth Framer Motion transitions.</li>
</ul>

---

<h2>🛠️ Tech Stack</h2>

<p align="left">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white" alt="Three.js" /></a>
  <a href="https://lucide.dev/"><img src="https://img.shields.io/badge/Lucide_Icons-F1502F?style=flat-square&logo=lucide&logoColor=white" alt="Lucide" /></a>
</p>

---

<h2>📂 Project Structure</h2>

<pre>
aetheria/
├── app/
│   ├── layout.tsx         # Root layout with fonts & providers
│   ├── page.tsx           # Home page with Hero & Public Feed
│   └── globals.css        # Glassmorphism tokens & custom properties
├── components/
│   ├── ui/                # Reusable UI components (Buttons, Inputs)
│   ├── Navbar.tsx         # Glassmorphism Navbar
│   ├── HeroCanvas.tsx     # Interactive 3D/Particles canvas
│   ├── CapsuleCard.tsx    # Card with live countdown logic
│   └── CapsuleModal.tsx   # Capsule creation form drawer
└── lib/
    └── utils.ts           # Helper functions & time calculations
</pre>

---

<h2>🚀 Getting Started</h2>

<p>1. Clone the repository:</p>

```bash
git clone [https://github.com/your-username/aetheria.git](https://github.com/your-username/aetheria.git)
cd aetheria
