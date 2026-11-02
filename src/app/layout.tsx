import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const accent = Caveat({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AbroadMates — Talk to real students abroad", template: "%s · AbroadMates" },
  description:
    "Skip the agencies. Connect with verified mentors who already study where you want to go — book 1:1 calls, join group sessions, and plan your study-abroad journey.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${accent.variable}`}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
