"use client";

import Link from "next/link";
import { GraduationCap, Globe, Wallet, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

const INFO_TILES = [
  {
    icon: GraduationCap,
    label: "Degree & Field",
  },
  {
    icon: Globe,
    label: "Where to study",
  },
  {
    icon: Wallet,
    label: "Budget & Funding",
  },
  {
    icon: HeartHandshake,
    label: "Help you need",
  },
] as const;

export default function GetStartedPage() {
  return (
    <section className="min-h-screen bg-[#FFFAF3] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-10 text-center">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3">
          <h1
            className="font-accent font-bold text-brand-600 leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
          >
            Skip agencies. Talk to real students abroad.
          </h1>
          <p className="text-gray-500 text-base font-medium">
            About 2 minutes to get started
          </p>
        </div>

        {/* Info tiles */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {INFO_TILES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 shadow-sm"
            >
              <Icon
                className="text-brand-600"
                size={32}
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-gray-700 leading-snug">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 w-full">
          <Button
            asChild
            size="lg"
            className="w-full max-w-xs rounded-full bg-brand-600 text-white hover:bg-brand-700 text-base font-bold shadow-md shadow-brand-600/30"
          >
            <Link href="/register">Let&apos;s go!</Link>
          </Button>

          <p className="text-sm text-gray-500">
            Already a member?{" "}
            <Link
              href="/login"
              className="text-brand-600 font-semibold underline-offset-2 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
