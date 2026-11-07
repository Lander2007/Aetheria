import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        titanium: {
          DEFAULT: "#E2E4E6",
          well: "#D4D7DA",
          deep: "#D4D7DA",
        },
        carbon: {
          DEFAULT: "#141416",
          border: "rgba(20, 20, 22, 0.14)",
        },
        graphite: {
          DEFAULT: "#1E1E22",
        },
        orange: {
          signal: "#FF4F00",
        },
        chalk: {
          DEFAULT: "#F7F7F5",
          muted: "rgba(247, 247, 245, 0.62)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        editorial: ["var(--font-editorial)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        // Compatibility Aliases
        syne: ["var(--font-display)", "sans-serif"],
        serif: ["var(--font-editorial)", "serif"],
      },
      letterSpacing: {
        monumental: "-0.04em",
        tightest: "-0.05em",
        architectural: "0.18em",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
        astrolabeSpin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        marqueeLeft: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        irisSpinClockwise: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        irisSpinCounter: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "astrolabe-slow": "astrolabeSpin 40s linear infinite",
        "marquee-left": "marqueeLeft 28s linear infinite",
        "marquee-right": "marqueeRight 28s linear infinite",
        "iris-cw": "irisSpinClockwise 30s linear infinite",
        "iris-ccw": "irisSpinCounter 24s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
