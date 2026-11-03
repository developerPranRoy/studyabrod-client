"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PersonBust, type HairStyle } from "@/components/shared/person-bust";
import { portrait } from "@/components/shared/portraits";

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

type HeroCardSpec = {
  side: "left" | "right";
  offset: string;
  w: string;
  h: string;
  top: string;
  rz: number;
  ry: number;
  bg: string;
  hair: HairStyle;
  z: number;
  photo: number;
  photoH: string;
};

const LEFT_CARDS: Omit<HeroCardSpec, "side">[] = [
  { offset: "-6.51vw", w: "16.88vw", h: "118%", top: "47%", rz: 4, ry: 20, bg: "#2b2b2b", hair: "short", z: 4, photo: 0, photoH: "58%" },
  { offset: "9.375vw", w: "16.51vw", h: "72%", top: "45%", rz: 3, ry: 16, bg: "#C1113F", hair: "long", z: 3, photo: 1, photoH: "90%" },
  { offset: "25.26vw", w: "12.81vw", h: "54%", top: "43.5%", rz: 2, ry: 13, bg: "#C1113F", hair: "bun", z: 2, photo: 2, photoH: "94%" },
  { offset: "37.76vw", w: "11.41vw", h: "46%", top: "42%", rz: 1.5, ry: 10, bg: "#C1113F", hair: "curly", z: 1, photo: 3, photoH: "94%" },
];

const RIGHT_CARDS: HeroCardSpec[] = LEFT_CARDS.map((card) => ({
  ...card,
  side: "right",
  rz: -card.rz,
  ry: -card.ry,
  photo: card.photo + 4,
}));

const PHOTO_FADE =
  "linear-gradient(180deg, #000 0%, #000 74%, rgba(0,0,0,0) 100%)";

function HeroCard({
  side,
  offset,
  w,
  h,
  top,
  rz,
  ry,
  bg,
  hair,
  z,
  photo,
  photoH,
}: HeroCardSpec) {
  const dark = bg === "#2b2b2b";
  const [failed, setFailed] = useState(false);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top,
        [side]: offset,
        width: w,
        height: h,
        transform: `translateY(-50%) perspective(1300px) rotateY(${ry}deg) rotateZ(${rz}deg)`,
        transformOrigin: "center center",
        borderRadius: "clamp(24px, 2.4vw, 46px)",
        background: bg,
        overflow: "hidden",
        zIndex: z,
        flexShrink: 0,
        boxShadow: "0 26px 60px rgba(0,0,0,0.3)",
      }}
    >
      {failed ? (
        <PersonBust
          hair={hair}
          fill={dark ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.26)"}
          hairFill={dark ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.44)"}
        />
      ) : (
        <img
          src={portrait(photo)}
          alt=""
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: photoH,
            objectFit: "cover",
            objectPosition: "center top",
            filter: "grayscale(1) contrast(1.06)",
            WebkitMaskImage: PHOTO_FADE,
            maskImage: PHOTO_FADE,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dark ? "rgba(18,18,18,0.2)" : "rgba(193,17,63,0.22)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.14), rgba(0,0,0,0) 42%, rgba(0,0,0,0.2))",
        }}
      />
    </div>
  );
}

const SKYLINE_FILL = "#C1113F";

function Skyline() {
  return (
    <svg
      viewBox="0 0 1600 420"
      preserveAspectRatio="xMidYMax meet"
      fill={SKYLINE_FILL}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    >
      <rect x="0" y="412" width="1600" height="8" />

      <rect x="70" y="330" width="200" height="84" />
      <ellipse cx="170" cy="332" rx="72" ry="62" />
      <rect x="60" y="248" width="16" height="176" />
      <ellipse cx="68" cy="250" rx="14" ry="18" />
      <rect x="264" y="248" width="16" height="176" />
      <ellipse cx="272" cy="250" rx="14" ry="18" />

      <rect x="390" y="344" width="240" height="70" />
      <path d="M420 344c-30 0-34-34-16-54-12-28 6-58 16-72 10 14 28 44 16 72 18 20 14 54-16 54z" />
      <path d="M486 344c-34 0-38-40-18-64-14-32 6-68 18-84 12 16 32 52 18 84 20 24 16 64-18 64z" />
      <path d="M556 344c-28 0-32-32-15-51-11-26 6-54 15-67 9 13 26 41 15 67 17 19 13 51-15 51z" />
      <path d="M612 344c-24 0-27-27-13-43-9-22 5-45 13-56 8 11 22 34 13 56 14 16 11 43-13 43z" />
      <rect x="474" y="252" width="56" height="92" />
      <path d="M502 176l22 78h-44z" />

      <rect x="796" y="132" width="40" height="282" />
      <path d="M796 132h40l-10-72h-20z" />
      <circle cx="816" cy="46" r="14" />
      <rect x="762" y="368" width="108" height="46" />

      <rect x="1010" y="344" width="200" height="70" />
      <ellipse cx="1110" cy="346" rx="76" ry="64" />
      <rect x="1104" y="238" width="12" height="48" />
      <path d="M1110 216l10 30h-20z" />

      <rect x="1310" y="326" width="210" height="88" />
      <rect x="1320" y="240" width="48" height="184" />
      <path d="M1344 190l30 54h-60z" />
      <rect x="1462" y="240" width="48" height="184" />
      <path d="M1486 190l30 54h-60z" />
      <path d="M1382 326l43-58 43 58z" />
    </svg>
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
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "72%",
          zIndex: 1,
          opacity: 0.07,
          pointerEvents: "none",
        }}
      >
        <Skyline />
      </div>

      <div
        className="hidden xl:block"
        style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}
      >
        {LEFT_CARDS.map((card, i) => (
          <HeroCard key={`l${i}`} side="left" {...card} />
        ))}
        {RIGHT_CARDS.map((card, i) => (
          <HeroCard key={`r${i}`} {...card} />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1rem",
          maxWidth: 660,
          width: "100%",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-40px -70px",
            zIndex: -1,
            pointerEvents: "none",
            background:
              "radial-gradient(closest-side, rgba(253,242,244,0.95), rgba(253,242,244,0.86) 55%, rgba(253,242,244,0) 100%)",
          }}
        />
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

        <p style={{ marginTop: "0.85rem", fontSize: "0.82rem", color: "#888" }}>
          for : undergrad, master&apos;s, MBA, PhD,{" "}
          <span style={{ color: "#C1113F", fontWeight: 700 }}>ECA</span>, work
          abroad &amp; test prep
        </p>

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
                maxWidth: 300,
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
