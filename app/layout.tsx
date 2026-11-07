import type { Metadata } from "next";
import "./globals.css";
import { ExposedSwissGrid } from "@/components/ExposedSwissGrid";
import { GlobalHeader } from "@/components/GlobalHeader";
import { InfoCursor } from "@/components/ui/InfoCursor";
import { KeyboardNavigation } from "@/components/KeyboardNavigation";

export const metadata: Metadata = {
  title: "Aetheria® — Cryptographic Digital Time Capsule Monoliths",
  description:
    "An architectural digital time capsule platform where testaments, memories, and future promises are cryptographically sealed into monolithic vessels until designated epochs.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  keywords: [
    "Aetheria",
    "Digital Time Capsule",
    "Cryptographic Seal",
    "Verifiable Delay Function",
    "Architectural Archive",
    "Awwwards SOTD",
    "Industrial Horology",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#E2E4E6] text-[#141416] antialiased selection:bg-[#141416] selection:text-[#FF4F00]">
        {/* Contextual Information Cursor (Awwwards 60fps) */}
        <InfoCursor />

        {/* Keyboard Navigation Solstice HUD */}
        <KeyboardNavigation />

        {/* Fixed Exposed Swiss Grid Structure */}
        <ExposedSwissGrid />

        {/* Fixed Editorial Global Header */}
        <GlobalHeader />

        {/* Main Experience */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
