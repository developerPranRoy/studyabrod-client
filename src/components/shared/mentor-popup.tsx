"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { SearchWizard } from "@/components/shared/search-wizard";

/* ─── Stacked mentor photo cards (fan shape) ────────────────────────────────── */
const FAN_CARDS = [
  { rotate: -18, translateX: -70, translateY: 10,  zIndex: 1, bg: "#1a6b8a" },
  { rotate: -8,  translateX: -35, translateY: 0,   zIndex: 2, bg: "#7c3aed" },
  { rotate:  0,  translateX:   0, translateY: -8,  zIndex: 5, bg: "#C1113F" },
  { rotate:  8,  translateX:  35, translateY: 0,   zIndex: 2, bg: "#065f46" },
  { rotate:  18, translateX:  70, translateY: 10,  zIndex: 1, bg: "#b45309" },
];

function FanCard({
  rotate, translateX, translateY, zIndex, bg,
}: (typeof FAN_CARDS)[number]) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        width: 72,
        height: 90,
        borderRadius: 14,
        background: bg,
        transform: `rotate(${rotate}deg) translateX(${translateX}px) translateY(${translateY}px)`,
        zIndex,
        overflow: "hidden",
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      }}
    >
      {/* Person silhouette placeholder */}
      <svg
        viewBox="0 0 72 90"
        style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}
        fill="rgba(255,255,255,0.22)"
        preserveAspectRatio="xMidYMax meet"
      >
        <circle cx="36" cy="26" r="16" />
        <rect x="28" y="39" width="16" height="10" rx="4" />
        <path d="M0,90 L0,65 Q0,50 36,44 Q72,50 72,65 L72,90 Z" />
      </svg>
    </div>
  );
}

/* ─── Main popup ─────────────────────────────────────────────────────────────── */
export function MentorPopup() {
  const [visible,    setVisible]    = useState(false);
  const [dismissed,  setDismissed]  = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  /* Auto-open after 10 s, only once per session */
  useEffect(() => {
    const already = sessionStorage.getItem("mentor-popup-dismissed");
    if (already) return;

    const timer = setTimeout(() => setVisible(true), 10_000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    sessionStorage.setItem("mentor-popup-dismissed", "1");
    setDismissed(true);
    setVisible(false);
  }

  function getStarted() {
    dismiss();
    setShowWizard(true);
  }

  if (dismissed && !showWizard) return null;

  return (
    <>
      {/* SearchWizard opened from "Get Started" */}
      {showWizard && <SearchWizard onClose={() => setShowWizard(false)} />}

      {/* Popup */}
      {visible && (
        <>
          {/* Backdrop */}
          <div
            onClick={dismiss}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 200,
              backdropFilter: "blur(3px)",
            }}
          />

          {/* Modal card */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201,
              width: "min(420px, 92vw)",
              borderRadius: 24,
              background: "#C1113F",
              padding: "2rem 2rem 1.75rem",
              textAlign: "center",
              boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
            }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>

            {/* Fan of mentor photo cards */}
            <div
              style={{
                position: "relative",
                height: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              {FAN_CARDS.map((card, i) => (
                <FanCard key={i} {...card} />
              ))}
            </div>

            {/* Heading */}
            <h2
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Find Your Perfect Mentor
            </h2>

            {/* Subtext */}
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                margin: "0.75rem 0 0",
              }}
            >
              Answer a few quick questions to get personalized mentor recommendations
              for your study abroad journey.
            </p>

            {/* Get Started button — amber/yellow */}
            <button
              onClick={getStarted}
              style={{
                marginTop: "1.5rem",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "0.9rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(245,158,11,0.4)",
                transition: "background 0.15s",
              }}
            >
              Get Started
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>

            {/* Maybe later */}
            <button
              onClick={dismiss}
              style={{
                marginTop: "0.9rem",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.85)",
                fontSize: "0.9rem",
                cursor: "pointer",
                fontWeight: 500,
                padding: "0.25rem",
              }}
            >
              Maybe later
            </button>

            {/* Trust line */}
            <p
              style={{
                marginTop: "0.85rem",
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.78rem",
              }}
            >
              Trusted by 10,000+ students worldwide
            </p>
          </div>
        </>
      )}
    </>
  );
}
