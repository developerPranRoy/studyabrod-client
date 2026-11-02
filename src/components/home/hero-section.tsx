"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CYCLING = [
  "ECA developments",
  "where to study",
  "scholarships",
  "visa applications",
  "MBA programs",
  "SOP writing",
  "university choices",
];

function CyclingText() {
  const [idx, setIdx] = useState(0);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setEntering(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % CYCLING.length);
        setEntering(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`block font-accent font-bold text-brand-600 ${
        entering ? "hero-text-enter" : "hero-text-exit"
      }`}
      style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)", lineHeight: 1.05 }}
    >
      {CYCLING[idx]}
    </span>
  );
}

const LEFT_CARDS = [
  {
    fromEdge: "-80px",
    w: 150,
    h: 420,
    rotate: -10,
    bg: "#222222",
    isRed: false,
  },
  { fromEdge: "90px", w: 170, h: 450, rotate: -5, bg: "#d0d0d0", isRed: false },
  { fromEdge: "270px", w: 185, h: 460, rotate: -1, bg: "#C1113F", isRed: true },
  { fromEdge: "460px", w: 160, h: 430, rotate: 2, bg: "#e0e0e0", isRed: false },
];

const RIGHT_CARDS = [
  {
    fromEdge: "-80px",
    w: 150,
    h: 420,
    rotate: 10,
    bg: "#222222",
    isRed: false,
  },
  { fromEdge: "90px", w: 170, h: 450, rotate: 5, bg: "#d0d0d0", isRed: false },
  { fromEdge: "270px", w: 185, h: 460, rotate: 1, bg: "#C1113F", isRed: true },
  {
    fromEdge: "460px",
    w: 160,
    h: 430,
    rotate: -2,
    bg: "#e0e0e0",
    isRed: false,
  },
];

function HeroCard({
  side,
  fromEdge,
  w,
  h,
  rotate,
  bg,
  isRed,
}: {
  side: "left" | "right";
  fromEdge: string;
  w: number;
  h: number;
  rotate: number;
  bg: string;
  isRed: boolean;
}) {
  const silFill = isRed ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.15)";
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        [side]: fromEdge,
        width: w,
        height: h,
        transform: `translateY(-50%) rotate(${rotate}deg)`,
        transformOrigin: "center bottom",
        borderRadius: 20,
        background: bg,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 200 340"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        fill={silFill}
        preserveAspectRatio="xMidYMax meet"
      >
        <circle cx="100" cy="85" r="52" />
        <rect x="82" y="133" width="36" height="30" rx="10" />
        <path d="M0,340 L0,230 Q0,175 100,158 Q200,175 200,230 L200,340 Z" />
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        maxHeight: 900,
        background: "#fdf2f4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Faint building watermark */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <svg
          viewBox="0 0 600 400"
          style={{ width: "70%", maxWidth: 700, opacity: 0.07 }}
          fill="#C1113F"
        >
          <ellipse cx="300" cy="160" rx="55" ry="55" />
          <rect x="245" y="155" width="110" height="20" rx="4" />
          <rect x="230" y="175" width="140" height="180" rx="6" />
          <rect x="155" y="210" width="55" height="145" rx="4" />
          <ellipse cx="182" cy="205" rx="22" ry="28" />
          <rect x="390" y="210" width="55" height="145" rx="4" />
          <ellipse cx="418" cy="205" rx="22" ry="28" />
          <rect x="70" y="255" width="45" height="100" rx="3" />
          <ellipse cx="92" cy="250" rx="18" ry="22" />
          <rect x="485" y="255" width="45" height="100" rx="3" />
          <ellipse cx="508" cy="250" rx="18" ry="22" />
          <rect x="30" y="352" width="540" height="8" rx="4" />
        </svg>
      </div>

      {/* Photo cards — desktop only */}
      <div
        className="hidden lg:block"
        style={{ position: "absolute", inset: 0, zIndex: 2 }}
      >
        {LEFT_CARDS.map((card, i) => (
          <HeroCard key={`l${i}`} side="left" {...card} />
        ))}
        {RIGHT_CARDS.map((card, i) => (
          <HeroCard key={`r${i}`} side="right" {...card} />
        ))}
      </div>

      {/* Center content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1rem",
          maxWidth: 560,
          width: "100%",
        }}
      >
        <h1 style={{ margin: 0, lineHeight: 1.1 }}>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-accent)",
              fontWeight: 500,
              fontStyle: "italic",
              color: "#111",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
            }}
          >
            Ask About
          </span>
          <CyclingText />
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              color: "#333",
              fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
              marginTop: 4,
            }}
          >
            to a current student.
          </span>
        </h1>

        {/* CTA buttons */}
        <div
          style={{
            marginTop: "1.75rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link
            href="/mentors"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#C1113F",
              color: "#fff",
              borderRadius: 999,
              padding: "0.7rem 1.5rem",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(193,17,63,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            Talk to your AbroadMate
          </Link>
          <Link
            href="/mentors"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#fff",
              color: "#333",
              border: "1.5px solid #d1d5db",
              borderRadius: 999,
              padding: "0.65rem 1.2rem",
              fontWeight: 500,
              fontSize: "0.85rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            or, book a FREE planning call
          </Link>
        </div>

        {/* Descriptor */}
        <p style={{ marginTop: "0.85rem", fontSize: "0.82rem", color: "#888" }}>
          for : undergrad, master&apos;s, MBA, PhD,{" "}
          <span style={{ color: "#C1113F", fontWeight: 700 }}>ECA</span>, work
          abroad &amp; test prep
        </p>

        {/* Info badges */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          {[
            "Founded by A\u207B students. Applied to 100+ schools across North America, Europe, and Asia.",
            "20 or 40 min call. No bullsh*t advice. Leave with a 3\u2011step action plan.",
          ].map((text) => (
            <span
              key={text}
              style={{
                display: "inline-block",
                background: "#fef3c7",
                border: "1px solid #fbbf24",
                borderRadius: 8,
                padding: "0.5rem 0.9rem",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "#78350f",
                maxWidth: 260,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
