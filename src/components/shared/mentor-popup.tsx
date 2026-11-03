"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { SearchWizard } from "@/components/shared/search-wizard";
import { PersonBust, type HairStyle } from "@/components/shared/person-bust";
import { portrait } from "@/components/shared/portraits";

const FAN_CARDS = [
  { rotate: -26, tx: -104, ty: 16, w: 76, h: 96, zIndex: 1, bg: "#C1113F", hair: "long" as HairStyle, photo: 8 },
  { rotate: -13, tx: -54, ty: 4, w: 84, h: 106, zIndex: 2, bg: "#E9A33C", hair: "bun" as HairStyle, photo: 9 },
  { rotate: 0, tx: 0, ty: -10, w: 104, h: 130, zIndex: 5, bg: "#E9A33C", hair: "long" as HairStyle, photo: 10 },
  { rotate: 13, tx: 54, ty: 4, w: 84, h: 106, zIndex: 2, bg: "#E9A33C", hair: "short" as HairStyle, photo: 11 },
  { rotate: 26, tx: 104, ty: 16, w: 76, h: 96, zIndex: 1, bg: "#C1113F", hair: "cap" as HairStyle, photo: 12 },
];

function FanCard({
  rotate,
  tx,
  ty,
  w,
  h,
  zIndex,
  bg,
  hair,
  photo,
}: (typeof FAN_CARDS)[number]) {
  const dark = bg === "#C1113F";
  const [failed, setFailed] = useState(false);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: w,
        height: h,
        borderRadius: 16,
        background: bg,
        border: "2px solid rgba(255,255,255,0.85)",
        transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`,
        transformOrigin: "50% 135%",
        zIndex,
        overflow: "hidden",
        boxShadow: "0 8px 22px rgba(0,0,0,0.32)",
      }}
    >
      {failed ? (
        <PersonBust
          hair={hair}
          fill={dark ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.42)"}
          hairFill={dark ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.68)"}
        />
      ) : (
        <img
          src={portrait(photo)}
          alt=""
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 22%",
          }}
        />
      )}
    </div>
  );
}

export function MentorPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

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
      {showWizard && <SearchWizard onClose={() => setShowWizard(false)} />}

      {visible && (
        <>
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

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Find Your Perfect Mentor"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201,
              width: "min(440px, 92vw)",
              borderRadius: 24,
              background: "#E4002B",
              padding: "2.25rem 2rem 2rem",
              textAlign: "center",
              boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <X style={{ width: 22, height: 22 }} />
            </button>

            <div
              aria-hidden="true"
              style={{
                position: "relative",
                height: 168,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              {FAN_CARDS.map((card, i) => (
                <FanCard key={i} {...card} />
              ))}
            </div>

            <h2
              style={{
                color: "#fff",
                fontSize: "1.65rem",
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Find Your Perfect Mentor
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.92)",
                fontSize: "0.95rem",
                lineHeight: 1.55,
                margin: "0.8rem 0 0",
              }}
            >
              Answer a few quick questions to get personalized mentor
              recommendations for your study abroad journey.
            </p>

            <button
              onClick={getStarted}
              style={{
                marginTop: "1.6rem",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#E9A33C",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "1rem 1.5rem",
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
                transition: "background 0.15s",
              }}
            >
              Get Started
              <ArrowRight style={{ width: 20, height: 20 }} />
            </button>

            <button
              onClick={dismiss}
              style={{
                marginTop: "1rem",
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "0.98rem",
                cursor: "pointer",
                fontWeight: 700,
                padding: "0.25rem",
              }}
            >
              Maybe later
            </button>

            <p
              style={{
                marginTop: "0.9rem",
                color: "rgba(255,255,255,0.85)",
                fontSize: "0.8rem",
                fontWeight: 700,
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
