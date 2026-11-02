"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, ArrowRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCountries, usePrograms } from "@/hooks/use-lookups";
import { useMentors } from "@/hooks/use-mentors";
import type { Mentor } from "@/lib/api/types";
import { initials, formatPrice } from "@/lib/utils";

/* ─── Static data (matches exact labels from screenshots) ─────────────────── */

const CONTINENTS = ["Europe", "North America", "Asia", "Oceania", "I'm flexible!"];

const ALL_COUNTRIES = [
  "Australia","Austria","Belgium","Canada","China","Czech Republic","Denmark",
  "Estonia","Finland","France","Germany","Greece","Hong Kong SAR, China",
  "Hungary","India","Ireland","Italy","Japan","Latvia","Malaysia","Netherlands",
  "New Zealand","Norway","Poland","Portugal","Singapore","South Korea","Spain",
  "Sweden","Switzerland","Taiwan","UK","USA",
];

const PREFERRED_PROGRAMS = ["Bachelor's", "Master's", "PhD"];

const INTERESTED_COURSES = [
  "Engineering & Tech",
  "Business & Management",
  "Natural Sciences",
  "Arts & Humanities",
  "Social Sciences",
  "Medicine & Health",
];

const BUDGET_OPTIONS = [
  "Need full scholarship",
  "Need partial funding",
  "Self-funded",
  "Flexible / Not sure",
];

const HELP_SERVICES = [
  "Essay Review",
  "Test Prep",
  "Roadmap",
  "University Application",
  "Scholarships",
  "Life Abroad",
  "Visa Application",
  "Abroad Career",
  "ECA Guidance",
  "Mock Interviews",
  "Personal Statement",
  "Resume Review",
  "Recommendation Letters",
];

/* Country flag emoji map */
const FLAG_MAP: Record<string, string> = {
  Italy: "🇮🇹", Germany: "🇩🇪", France: "🇫🇷", UK: "🇬🇧", USA: "🇺🇸",
  Canada: "🇨🇦", Australia: "🇦🇺", Netherlands: "🇳🇱", Sweden: "🇸🇪",
  Norway: "🇳🇴", Denmark: "🇩🇰", Finland: "🇫🇮", Switzerland: "🇨🇭",
  Japan: "🇯🇵", "South Korea": "🇰🇷", Ireland: "🇮🇪", Singapore: "🇸🇬",
  Hungary: "🇭🇺", Poland: "🇵🇱", Spain: "🇪🇸", Portugal: "🇵🇹",
  Belgium: "🇧🇪", Austria: "🇦🇹", "New Zealand": "🇳🇿", India: "🇮🇳",
  China: "🇨🇳", Malaysia: "🇲🇾", Taiwan: "🇹🇼", Estonia: "🇪🇪",
  Latvia: "🇱🇻", Greece: "🇬🇷", "Czech Republic": "🇨🇿",
};

/* ─── Wizard state type ────────────────────────────────────────────────────── */
interface WizardState {
  continents:  string[];
  countries:   string[];
  programs:    string[];
  courses:     string[];
  budget:      string;
  services:    string[];
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

/* ─── Progress bar ─────────────────────────────────────────────────────────── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ height: 5, background: "#f3f4f6" }}>
      <div
        style={{
          height: "100%",
          width: `${(step / total) * 100}%`,
          background: "#C1113F",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

/* ─── Small rounded chip (compact, no full-width) ──────────────────────────── */
function Chip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.4rem 1rem",
        borderRadius: 8,
        border: selected ? "2px solid #C1113F" : "1.5px solid #d1d5db",
        background: selected ? "#C1113F" : "#fff",
        color: selected ? "#fff" : "#374151",
        fontWeight: selected ? 700 : 500,
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </button>
  );
}

/* ─── Full-width list item (Step 2 budget + Step 3 services) ───────────────── */
function ListItem({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "0.85rem 1.1rem",
        borderRadius: 8,
        border: "1.5px solid #e5e7eb",
        background: selected ? "#C1113F" : "#f9fafb",
        color: selected ? "#fff" : "#111827",
        fontWeight: selected ? 700 : 500,
        fontSize: "0.9rem",
        cursor: "pointer",
        textAlign: "left" as const,
        transition: "all 0.15s",
        marginBottom: 6,
        display: "block",
      }}
    >
      {label}
    </button>
  );
}

/* ─── Close button ─────────────────────────────────────────────────────────── */
function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      style={{
        width: 34, height: 34, borderRadius: 8,
        border: "1.5px solid #e5e7eb", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
      }}
    >
      <X style={{ width: 16, height: 16, color: "#374151" }} />
    </button>
  );
}

/* ─── Section label ────────────────────────────────────────────────────────── */
function SectionLabel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>{sub}</p>}
    </div>
  );
}

/* ─── Mentor result card ───────────────────────────────────────────────────── */
function MatchCard({ mentor, matchPct }: { mentor: Mentor; matchPct: number }) {
  const router = useRouter();
  const flag = mentor.country ? (FLAG_MAP[mentor.country.name] ?? "🌍") : "";
  const minPrice = mentor.plans.length
    ? Math.min(...mentor.plans.map((p) => p.price))
    : null;

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        borderRadius: 16,
        border: "1.5px solid #e5e7eb",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      }}
    >
      {/* Photo area */}
      <div
        style={{
          height: 180,
          background: "linear-gradient(135deg,#e5e7eb,#d1d5db)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mentor.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mentor.photoUrl}
            alt={mentor.fullName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#fdf2f4", border: "3px solid #f9c6d2",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", fontWeight: 800, color: "#C1113F",
            }}
          >
            {initials(mentor.fullName)}
          </div>
        )}
        {/* Flag badge top-right */}
        {flag && (
          <span
            style={{
              position: "absolute", top: 10, right: 10,
              fontSize: "1.4rem", lineHeight: 1,
            }}
          >
            {flag}
          </span>
        )}
        {/* Program badge bottom-left */}
        {mentor.program && (
          <span
            style={{
              position: "absolute", bottom: 10, left: 10,
              background: "#f59e0b", color: "#fff",
              borderRadius: 999, padding: "2px 10px",
              fontSize: 11, fontWeight: 700,
            }}
          >
            {mentor.program.name}
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "0.9rem 1rem" }}>
        <p style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111", margin: 0 }}>
          {mentor.fullName}
        </p>
        {mentor.headline && (
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden" }}>
            {mentor.headline}
          </p>
        )}
        {mentor.universityName && (
          <p style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>
            {mentor.universityName}
          </p>
        )}
        {mentor.scholarship && (
          <p style={{ fontSize: 12, color: "#C1113F", fontWeight: 700, marginTop: 4 }}>
            {mentor.scholarship.name}
          </p>
        )}

        {/* Match % + Book button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>Match</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#C1113F", margin: 0 }}>
              {matchPct}%
            </p>
          </div>
          <button
            onClick={() => router.push(`/mentors/${mentor.id}`)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#C1113F", color: "#fff",
              border: "none", borderRadius: 999,
              padding: "0.5rem 1rem",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            Book a session
            <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Results screen ───────────────────────────────────────────────────────── */
function ResultsScreen({
  mentors,
  isLoading,
  onBack,
  onClose,
}: {
  mentors: Mentor[];
  isLoading: boolean;
  onBack: () => void;
  onClose: () => void;
}) {
  const [scrollIdx, setScrollIdx] = useState(0);
  const visible = 2; // cards visible at once

  const prev = () => setScrollIdx((i) => Math.max(0, i - 1));
  const next = () => setScrollIdx((i) => Math.min(mentors.length - visible, i + 1));

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100 }}
      />
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 101, background: "#fff", borderRadius: 20,
          width: "min(600px,95vw)", maxHeight: "88vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6" }}>
          <button
            onClick={onBack}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 600 }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back
          </button>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={{ padding: "1.25rem 1.5rem 0" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111", margin: 0 }}>Your Matches</h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Tap a mentor to book a session</p>
        </div>

        {/* Cards carousel */}
        <div style={{ flex: 1, padding: "1.25rem 1rem", position: "relative" }}>
          {isLoading ? (
            <div style={{ display: "flex", gap: 16, justifyContent: "center", padding: "2rem 0" }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ width: 220, height: 320, borderRadius: 16, background: "#f3f4f6", flexShrink: 0 }} />
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <p style={{ fontSize: "1rem", color: "#6b7280" }}>No mentors found for your preferences.</p>
              <button
                onClick={onBack}
                style={{ marginTop: 16, background: "#C1113F", color: "#fff", border: "none", borderRadius: 999, padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
              >
                Adjust preferences
              </button>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Prev arrow */}
              {scrollIdx > 0 && (
                <button
                  onClick={prev}
                  style={{
                    position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
                    zIndex: 2, width: 36, height: 36, borderRadius: "50%",
                    background: "#fff", border: "1.5px solid #e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <ChevronLeft style={{ width: 18, height: 18 }} />
                </button>
              )}

              {/* Cards */}
              <div style={{ display: "flex", gap: 14, overflow: "hidden" }}>
                {mentors.slice(scrollIdx, scrollIdx + visible).map((m, i) => (
                  <MatchCard key={m.id} mentor={m} matchPct={99 - i * 2} />
                ))}
              </div>

              {/* Next arrow */}
              {scrollIdx + visible < mentors.length && (
                <button
                  onClick={next}
                  style={{
                    position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                    zIndex: 2, width: 36, height: 36, borderRadius: "50%",
                    background: "#fff", border: "1.5px solid #e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <ChevronRight style={{ width: 18, height: 18 }} />
                </button>
              )}

              {/* Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
                {mentors.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === scrollIdx ? 20 : 8, height: 8,
                      borderRadius: 999,
                      background: i === scrollIdx ? "#C1113F" : "#d1d5db",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onClick={() => setScrollIdx(Math.min(i, mentors.length - visible))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main wizard ──────────────────────────────────────────────────────────── */
export function SearchWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);  // 1 | 2 | 3 | 4 (results)
  const [countrySearch, setCountrySearch] = useState("");

  const [state, setState] = useState<WizardState>({
    continents: [],
    countries:  [],
    programs:   [],
    courses:    [],
    budget:     "",
    services:   [],
  });

  const { data: apiCountries } = useCountries();
  const { data: apiPrograms  } = usePrograms();

  /* Build mentor filters from wizard state */
  const mentorFilters = useMemo(() => {
    const countrySlug = state.countries.length === 1
      ? apiCountries?.find((c) => c.name === state.countries[0])?.slug
      : undefined;
    const programSlug = state.programs.length === 1
      ? apiPrograms?.find((p) => p.name === state.programs[0])?.slug
      : undefined;
    return { country: countrySlug, program: programSlug, page: 1, limit: 8 };
  }, [state.countries, state.programs, apiCountries, apiPrograms]);

  const { data: mentorData, isLoading: mentorLoading } = useMentors(
    step === 4 ? mentorFilters : { page: 1, limit: 1 }  // only fetch on step 4
  );

  /* Country list */
  const countryList = useMemo(() => {
    if (apiCountries && apiCountries.length > 0) return apiCountries.map((c) => c.name);
    return ALL_COUNTRIES;
  }, [apiCountries]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countryList;
    return countryList.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countryList, countrySearch]);

  const TOTAL_STEPS = 3;

  /* ── Step 4: results screen ── */
  if (step === 4) {
    return (
      <ResultsScreen
        mentors={mentorData?.items ?? []}
        isLoading={mentorLoading}
        onBack={() => setStep(3)}
        onClose={onClose}
      />
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, backdropFilter: "blur(2px)" }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 101, background: "#fff", borderRadius: 20,
          width: "min(580px,95vw)", maxHeight: "88vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        }}
      >
        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "1.5rem 1.5rem 0" }}>
          <div>
            <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600, marginBottom: 4 }}>
              Step {step} of {TOTAL_STEPS}
            </p>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0 }}>
              {step === 1 && "Your Preferences"}
              {step === 2 && "What are your study goals?"}
              {step === 3 && "What do you need help with?"}
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 0 }}>
              {step === 1 && "Pick regions and specific countries (optional)"}
              {step === 2 && "Degree level, field, and budget help us match mentors"}
              {step === 3 && "Select all services that apply"}
            </p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <>
              <SectionLabel title="Target Continent" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {CONTINENTS.map((c) => (
                  <Chip key={c} label={c} selected={state.continents.includes(c)}
                    onClick={() => setState((s) => ({ ...s, continents: toggle(s.continents, c) }))} />
                ))}
              </div>

              <SectionLabel title="Target Countries" />
              {/* Search input */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "0.55rem 0.9rem", marginBottom: 14, background: "#f9fafb" }}>
                <Search style={{ width: 15, height: 15, color: "#9ca3af", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search countries"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: "#111", width: "100%" }}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {filteredCountries.map((c) => (
                  <Chip key={c} label={c} selected={state.countries.includes(c)}
                    onClick={() => setState((s) => ({ ...s, countries: toggle(s.countries, c) }))} />
                ))}
                {filteredCountries.length === 0 && (
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>No countries match.</p>
                )}
              </div>
            </>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <>
              <SectionLabel title="Preferred Programs" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {PREFERRED_PROGRAMS.map((p) => (
                  <Chip key={p} label={p} selected={state.programs.includes(p)}
                    onClick={() => setState((s) => ({ ...s, programs: toggle(s.programs, p) }))} />
                ))}
              </div>

              <SectionLabel title="Interested Course" sub="Field or area you want to study" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {INTERESTED_COURSES.map((c) => (
                  <Chip key={c} label={c} selected={state.courses.includes(c)}
                    onClick={() => setState((s) => ({ ...s, courses: toggle(s.courses, c) }))} />
                ))}
              </div>

              <SectionLabel title="Budget situation" />
              <div>
                {BUDGET_OPTIONS.map((b) => (
                  <ListItem key={b} label={b} selected={state.budget === b}
                    onClick={() => setState((s) => ({ ...s, budget: s.budget === b ? "" : b }))} />
                ))}
              </div>
            </>
          )}

          {/* ══ STEP 3 ══ */}
          {step === 3 && (
            <>
              <SectionLabel title="What do you need help with?" sub="Select all services that apply" />
              <div>
                {HELP_SERVICES.map((s) => (
                  <ListItem key={s} label={s} selected={state.services.includes(s)}
                    onClick={() => setState((st) => ({ ...st, services: toggle(st.services, s) }))} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem 1.5rem", borderTop: "1px solid #f3f4f6" }}>
          <button
            onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: "#6b7280", fontWeight: 600, padding: "0.5rem" }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} />
            {step === 1 ? "Cancel" : "Back"}
          </button>

          <button
            onClick={() => setStep((s) => s + 1)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#C1113F", color: "#fff", border: "none", borderRadius: 999, padding: "0.75rem 1.75rem", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}
          >
            {step < TOTAL_STEPS ? (
              <>Continue <ArrowRight style={{ width: 16, height: 16 }} /></>
            ) : (
              <>Get Recommendations <ArrowRight style={{ width: 16, height: 16 }} /></>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
