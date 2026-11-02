"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/store/auth-store";
import {
  useMentorMeOnboarding,
  useMentorPreview,
  usePutMentorAvailability,
  usePutMentorExpertise,
  usePutMentorPricing,
  usePutMentorProfile,
  usePutMentorSource,
  usePublishMentor,
} from "@/hooks/use-mentor-wizard";
import {
  useMentorOnboardingOptions,
  useOnboardingOptions,
  useAllCountries,
  usePricingMarkets,
  useServices,
  useTimezones,
} from "@/hooks/use-lookups";
import type {
  MentorMeAvailabilityInput,
  MentorMeWeeklySlot,
  MentorMeAvailabilityRange,
} from "@/lib/api/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_NAMES = [
  "Source",
  "Profile",
  "Location",
  "University",
  "Scholarships",
  "Expertise",
  "Availability",
  "Pricing",
  "Payout",
  "Social",
  "Preview",
  "Growth",
] as const;

const TOTAL_STEPS = 12;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

interface StepperProps {
  current: number; // 1-based
}

function Stepper({ current }: StepperProps) {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden px-4 py-3 text-sm font-medium text-muted-foreground">
        Step {current} of {TOTAL_STEPS}: {STEP_NAMES[current - 1]}
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-start justify-center gap-1 px-4 py-6 overflow-x-auto">
        {STEP_NAMES.map((name, i) => {
          const step = i + 1;
          const isCompleted = step < current;
          const isCurrent = step === current;
          return (
            <div key={step} className="flex flex-col items-center min-w-[56px]">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary border-primary text-primary-foreground ring-2 ring-primary/30"
                    : "bg-background border-border text-muted-foreground"
                )}
                aria-label={`Step ${step}: ${name}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? "✓" : step}
              </div>
              <span
                className={cn(
                  "mt-1 text-[10px] text-center leading-tight",
                  isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Wizard footer
// ---------------------------------------------------------------------------

interface FooterProps {
  step: number;
  onBack: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  continueLabel?: string;
  hideBack?: boolean;
}

function WizardFooter({
  step,
  onBack,
  onContinue,
  continueDisabled,
  continueLoading,
  continueLabel = "Continue",
  hideBack,
}: FooterProps) {
  return (
    <div className="flex items-center justify-between pt-8">
      {!hideBack && step > 1 ? (
        <Button variant="ghost" onClick={onBack} type="button">
          ← Back
        </Button>
      ) : (
        <div />
      )}
      <Button
        onClick={onContinue}
        disabled={continueDisabled || continueLoading}
        type="button"
        className="min-w-[120px]"
      >
        {continueLoading ? "Saving…" : continueLabel}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder step
// ---------------------------------------------------------------------------

function PlaceholderStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        Coming soon — this step will be available shortly.
      </p>
      <Button onClick={onContinue} className="mt-4" type="button">
        Continue
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Source
// ---------------------------------------------------------------------------

function StepSource({
  onContinue,
  onBack,
  step,
}: {
  onContinue: () => void;
  onBack: () => void;
  step: number;
}) {
  const { data: opts } = useMentorOnboardingOptions();
  const { data: onbOpts } = useOnboardingOptions();
  const mutation = usePutMentorSource();
  const [selected, setSelected] = useState<number | null>(null);

  // sources come from the student onboarding options
  const sources = onbOpts?.sources ?? [];

  async function handleContinue() {
    if (selected == null) return;
    await mutation.mutateAsync({ sourceId: selected });
    onContinue();
  }

  // suppress unused warning — opts only needed indirectly
  void opts;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center" style={{ fontFamily: "Caveat, cursive" }}>
        How did you hear about AbroadMates?
      </h2>

      {sources.length === 0 && (
        <p className="text-muted-foreground text-center">Loading options…</p>
      )}

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {sources.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={cn(
              "px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected === s.id
                ? "bg-pink-50 border-primary text-primary"
                : "bg-background border-border hover:border-primary/50"
            )}
            aria-pressed={selected === s.id}
          >
            {selected === s.id && <span className="mr-1">✓</span>}
            {s.name}
          </button>
        ))}
      </div>

      <WizardFooter
        step={step}
        onBack={onBack}
        onContinue={handleContinue}
        continueDisabled={selected == null}
        continueLoading={mutation.isPending}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Profile
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  nationalityId: z.number({ required_error: "Nationality is required" }),
  sellingPoint: z.string().min(10, "At least 10 characters").max(500, "Max 500 characters"),
  phone: z.string().min(1, "Phone is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

function StepProfile({
  onContinue,
  onBack,
  step,
}: {
  onContinue: () => void;
  onBack: () => void;
  step: number;
}) {
  const { data: countries } = useAllCountries();
  const mutation = usePutMentorProfile();
  const [countrySearch, setCountrySearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  const nationalityId = watch("nationalityId");

  const filteredCountries = (countries ?? []).filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  async function onSubmit(data: ProfileForm) {
    await mutation.mutateAsync({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      nationalityId: data.nationalityId,
      sellingPoint: data.sellingPoint,
      phone: data.phone,
    });
    onContinue();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2
        className="text-2xl font-semibold mb-6 text-center"
        style={{ fontFamily: "Caveat, cursive" }}
      >
        Tell us about yourself
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name <span aria-hidden>*</span>
          </label>
          <input
            id="firstName"
            {...register("firstName")}
            className={cn(
              "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
              errors.firstName ? "border-destructive" : "border-input"
            )}
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="text-destructive text-xs mt-1" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="middleName" className="block text-sm font-medium mb-1">
            Middle Name
          </label>
          <input
            id="middleName"
            {...register("middleName")}
            className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="additional-name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last Name <span aria-hidden>*</span>
          </label>
          <input
            id="lastName"
            {...register("lastName")}
            className={cn(
              "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
              errors.lastName ? "border-destructive" : "border-input"
            )}
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="text-destructive text-xs mt-1" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone <span aria-hidden>*</span>
          </label>
          <input
            id="phone"
            {...register("phone")}
            type="tel"
            className={cn(
              "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
              errors.phone ? "border-destructive" : "border-input"
            )}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="text-destructive text-xs mt-1" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Nationality searchable select */}
      <div className="mb-4">
        <label htmlFor="nationalitySearch" className="block text-sm font-medium mb-1">
          Nationality <span aria-hidden>*</span>
        </label>
        <input
          id="nationalitySearch"
          type="text"
          placeholder="Search country…"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          className={cn(
            "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-1",
            errors.nationalityId ? "border-destructive" : "border-input"
          )}
          autoComplete="off"
          aria-label="Search nationality"
        />
        {countrySearch && (
          <ul
            className="border border-input rounded-md max-h-40 overflow-y-auto bg-background shadow-sm"
            role="listbox"
            aria-label="Nationality options"
          >
            {filteredCountries.slice(0, 30).map((c) => (
              <li
                key={c.id}
                role="option"
                aria-selected={nationalityId === c.id}
                onClick={() => {
                  setValue("nationalityId", c.id, { shouldValidate: true });
                  setCountrySearch(c.name);
                }}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                  nationalityId === c.id && "bg-accent font-medium"
                )}
              >
                {c.name}
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
            )}
          </ul>
        )}
        {nationalityId && !countrySearch.includes(String(nationalityId)) && (
          <p className="text-xs text-muted-foreground mt-1">
            Selected: {countries?.find((c) => c.id === nationalityId)?.name}
          </p>
        )}
        {errors.nationalityId && (
          <p className="text-destructive text-xs mt-1" role="alert">
            {errors.nationalityId.message}
          </p>
        )}
      </div>

      {/* Selling point */}
      <div className="mb-4">
        <label htmlFor="sellingPoint" className="block text-sm font-medium mb-1">
          Your selling point{" "}
          <span className="text-muted-foreground font-normal">(10–500 characters)</span>{" "}
          <span aria-hidden>*</span>
        </label>
        <textarea
          id="sellingPoint"
          {...register("sellingPoint")}
          rows={4}
          className={cn(
            "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none",
            errors.sellingPoint ? "border-destructive" : "border-input"
          )}
          placeholder="Tell students why they should book a call with you…"
        />
        {errors.sellingPoint && (
          <p className="text-destructive text-xs mt-1" role="alert">
            {errors.sellingPoint.message}
          </p>
        )}
      </div>

      <WizardFooter
        step={step}
        onBack={onBack}
        onContinue={handleSubmit(onSubmit)}
        continueLoading={mutation.isPending}
      />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Step 6: Expertise
// ---------------------------------------------------------------------------

function StepExpertise({
  onContinue,
  onBack,
  step,
}: {
  onContinue: () => void;
  onBack: () => void;
  step: number;
}) {
  const { data: onbOpts } = useOnboardingOptions();
  const mutation = usePutMentorExpertise();
  const [selected, setSelected] = useState<number[]>([]);

  const topics = onbOpts?.helpTopics ?? [];

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleContinue() {
    if (selected.length === 0) return;
    await mutation.mutateAsync({ helpTopicIds: selected });
    onContinue();
  }

  return (
    <div>
      <h2
        className="text-2xl font-semibold mb-6 text-center"
        style={{ fontFamily: "Caveat, cursive" }}
      >
        What can you help students with?
      </h2>

      {topics.length === 0 && (
        <p className="text-muted-foreground text-center">Loading options…</p>
      )}

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            aria-pressed={selected.includes(t.id)}
            className={cn(
              "px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected.includes(t.id)
                ? "bg-pink-50 border-primary text-primary"
                : "bg-background border-border hover:border-primary/50"
            )}
          >
            {selected.includes(t.id) && <span className="mr-1">✓</span>}
            {t.name}
          </button>
        ))}
      </div>

      {selected.length === 0 && topics.length > 0 && (
        <p className="text-destructive text-sm text-center mb-4" role="alert">
          Please select at least one topic.
        </p>
      )}

      <WizardFooter
        step={step}
        onBack={onBack}
        onContinue={handleContinue}
        continueDisabled={selected.length === 0}
        continueLoading={mutation.isPending}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 7: Availability
// ---------------------------------------------------------------------------

interface TimeRange {
  start: string;
  end: string;
}

type WeeklySchedule = Record<number, TimeRange[]>; // weekday 1-7 => ranges

const AVAILABLE_UNTIL_OPTIONS: { label: string; value: string | null }[] = [
  { label: "Indefinitely", value: null },
  { label: "3 months", value: "3months" },
  { label: "6 months", value: "6months" },
  { label: "1 year", value: "1year" },
];

function computeAvailableUntil(choice: string | null): string | null {
  if (choice === null) return null;
  const now = new Date();
  if (choice === "3months") {
    now.setMonth(now.getMonth() + 3);
  } else if (choice === "6months") {
    now.setMonth(now.getMonth() + 6);
  } else if (choice === "1year") {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now.toISOString();
}

function StepAvailability({
  onContinue,
  onBack,
  step,
}: {
  onContinue: () => void;
  onBack: () => void;
  step: number;
}) {
  const { data: timezones } = useTimezones();
  const mutation = usePutMentorAvailability();

  const [timezone, setTimezone] = useState("");
  const [tzSearch, setTzSearch] = useState("");
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
  });
  const [availableUntilKey, setAvailableUntilKey] = useState<string | null>(null);

  const filteredTz = (timezones ?? []).filter((tz) =>
    tz.toLowerCase().includes(tzSearch.toLowerCase())
  );

  function addRange(weekday: number) {
    setSchedule((prev) => ({
      ...prev,
      [weekday]: [...(prev[weekday] ?? []), { start: "09:00", end: "17:00" }],
    }));
  }

  function removeRange(weekday: number, idx: number) {
    setSchedule((prev) => ({
      ...prev,
      [weekday]: prev[weekday].filter((_, i) => i !== idx),
    }));
  }

  function updateRange(weekday: number, idx: number, field: "start" | "end", value: string) {
    setSchedule((prev) => {
      const updated = prev[weekday].map((r, i) => (i === idx ? { ...r, [field]: value } : r));
      return { ...prev, [weekday]: updated };
    });
  }

  async function handleContinue() {
    const weekly: MentorMeWeeklySlot[] = Object.entries(schedule)
      .filter(([, ranges]) => ranges.length > 0)
      .map(([weekday, ranges]) => ({
        weekday: Number(weekday),
        ranges: ranges.map((r): MentorMeAvailabilityRange => ({ start: r.start, end: r.end })),
      }));

    const input: MentorMeAvailabilityInput = {
      timezone,
      weekly,
      availableUntil: computeAvailableUntil(availableUntilKey),
    };

    await mutation.mutateAsync(input);
    onContinue();
  }

  return (
    <div>
      <h2
        className="text-2xl font-semibold mb-6 text-center"
        style={{ fontFamily: "Caveat, cursive" }}
      >
        When are you available?
      </h2>

      {/* Timezone */}
      <div className="mb-6">
        <label htmlFor="tzSearch" className="block text-sm font-medium mb-1">
          Timezone <span aria-hidden>*</span>
        </label>
        <input
          id="tzSearch"
          type="text"
          placeholder="Search timezone…"
          value={tzSearch}
          onChange={(e) => setTzSearch(e.target.value)}
          className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-1"
          autoComplete="off"
          aria-label="Search timezone"
        />
        {tzSearch && (
          <ul
            className="border border-input rounded-md max-h-40 overflow-y-auto bg-background shadow-sm"
            role="listbox"
            aria-label="Timezone options"
          >
            {filteredTz.slice(0, 30).map((tz) => (
              <li
                key={tz}
                role="option"
                aria-selected={timezone === tz}
                onClick={() => {
                  setTimezone(tz);
                  setTzSearch(tz);
                }}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                  timezone === tz && "bg-accent font-medium"
                )}
              >
                {tz}
              </li>
            ))}
            {filteredTz.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>
            )}
          </ul>
        )}
      </div>

      {/* Weekly schedule */}
      <div className="mb-6 space-y-3">
        <p className="text-sm font-medium">Weekly Schedule</p>
        {WEEKDAY_LABELS.map((label, i) => {
          const weekday = i + 1;
          const ranges = schedule[weekday] ?? [];
          return (
            <div key={weekday} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium w-10">{label}</span>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => addRange(weekday)}
                >
                  + Add time range
                </Button>
              </div>
              {ranges.map((range, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2">
                  <label className="sr-only" htmlFor={`start-${weekday}-${idx}`}>
                    Start time for {label}
                  </label>
                  <input
                    id={`start-${weekday}-${idx}`}
                    type="time"
                    value={range.start}
                    onChange={(e) => updateRange(weekday, idx, "start", e.target.value)}
                    className="border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <label className="sr-only" htmlFor={`end-${weekday}-${idx}`}>
                    End time for {label}
                  </label>
                  <input
                    id={`end-${weekday}-${idx}`}
                    type="time"
                    value={range.end}
                    onChange={(e) => updateRange(weekday, idx, "end", e.target.value)}
                    className="border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeRange(weekday, idx)}
                    className="text-destructive text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive rounded"
                    aria-label={`Remove time range ${idx + 1} for ${label}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Available until */}
      <div className="mb-6">
        <label htmlFor="availableUntil" className="block text-sm font-medium mb-1">
          Available until
        </label>
        <select
          id="availableUntil"
          value={availableUntilKey ?? ""}
          onChange={(e) => setAvailableUntilKey(e.target.value === "" ? null : e.target.value)}
          className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {AVAILABLE_UNTIL_OPTIONS.map((o) => (
            <option key={o.value ?? "__indefinitely"} value={o.value ?? ""}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <WizardFooter
        step={step}
        onBack={onBack}
        onContinue={handleContinue}
        continueDisabled={!timezone}
        continueLoading={mutation.isPending}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 8: Pricing
// ---------------------------------------------------------------------------

function StepPricing({
  onContinue,
  onBack,
  step,
}: {
  onContinue: () => void;
  onBack: () => void;
  step: number;
}) {
  const { data: markets } = usePricingMarkets();
  const { data: services } = useServices();
  const mutation = usePutMentorPricing();

  // keyed by `${marketId}-${serviceId}` => price
  const [prices, setPrices] = useState<Record<string, number>>({});

  function setPrice(marketId: number, serviceId: number, value: number) {
    setPrices((prev) => ({ ...prev, [`${marketId}-${serviceId}`]: value }));
  }

  async function handleContinue() {
    const priceList = (markets ?? []).flatMap((market) =>
      (services ?? []).map((service) => ({
        marketId: market.id,
        serviceId: service.id,
        price: prices[`${market.id}-${service.id}`] ?? 0,
      }))
    );
    await mutation.mutateAsync({ prices: priceList });
    onContinue();
  }

  return (
    <div>
      <h2
        className="text-2xl font-semibold mb-6 text-center"
        style={{ fontFamily: "Caveat, cursive" }}
      >
        Set your pricing
      </h2>

      {(markets ?? []).length === 0 && (
        <p className="text-muted-foreground text-center">Loading markets…</p>
      )}

      <div className="space-y-6 mb-8">
        {(markets ?? []).map((market) => (
          <div key={market.id} className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3">
              {market.name}
              {market.currency && (
                <span className="ml-2 text-muted-foreground text-sm">({market.currency})</span>
              )}
            </h3>
            <div className="space-y-3">
              {(services ?? []).map((service) => {
                const key = `${market.id}-${service.id}`;
                return (
                  <div key={service.id} className="flex items-center gap-3">
                    <label
                      htmlFor={`price-${key}`}
                      className="text-sm font-medium w-40 shrink-0"
                    >
                      {service.name} ({service.durationMin} min)
                    </label>
                    <input
                      id={`price-${key}`}
                      type="number"
                      min={0}
                      step={1}
                      value={prices[key] ?? ""}
                      onChange={(e) =>
                        setPrice(market.id, service.id, Number(e.target.value))
                      }
                      placeholder="0"
                      className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-32"
                      aria-label={`Price for ${service.name} in ${market.name}`}
                    />
                    {market.currency && (
                      <span className="text-sm text-muted-foreground">{market.currency}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <WizardFooter
        step={step}
        onBack={onBack}
        onContinue={handleContinue}
        continueLoading={mutation.isPending}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 11: Preview / Publish
// ---------------------------------------------------------------------------

function StepPreview({
  onContinue,
  onBack,
  step,
}: {
  onContinue: () => void;
  onBack: () => void;
  step: number;
}) {
  const { data: preview, isLoading } = useMentorPreview();
  const mutation = usePublishMentor();
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  async function handlePublish() {
    setEmailNotVerified(false);
    try {
      await mutation.mutateAsync();
      onContinue();
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 403 &&
        isObj(err.details) &&
        (str(err.details.code) === "EMAIL_NOT_VERIFIED" ||
          (isObj(err.details) &&
            isObj(err.details.data) &&
            str((err.details.data as Record<string, unknown>).code) === "EMAIL_NOT_VERIFIED"))
      ) {
        setEmailNotVerified(true);
      }
    }
  }

  function isObj(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
  }

  function str(v: unknown): string | null {
    return typeof v === "string" && v.length > 0 ? v : null;
  }

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-12">Loading preview…</p>;
  }

  const name =
    [preview?.firstName, preview?.lastName].filter(Boolean).join(" ") || "Your Profile";

  return (
    <div>
      <h2
        className="text-2xl font-semibold mb-6 text-center"
        style={{ fontFamily: "Caveat, cursive" }}
      >
        Your profile is ready to publish!
      </h2>

      {emailNotVerified && (
        <div
          className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-sm text-yellow-800"
          role="alert"
        >
          Please verify your email before publishing. Check your inbox.
        </div>
      )}

      <div className="border border-border rounded-xl p-6 mb-6 flex flex-col items-center gap-3">
        {preview?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${process.env.NEXT_PUBLIC_API_ORIGIN ?? ""}${preview.photoUrl}`}
            alt={name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground"
            aria-label="Avatar placeholder"
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <p className="text-lg font-semibold">{name}</p>
          {preview?.sellingPoint && (
            <p className="text-sm text-muted-foreground mt-1 max-w-md">{preview.sellingPoint}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} type="button">
          ← Back
        </Button>
        <Button
          onClick={handlePublish}
          disabled={mutation.isPending}
          type="button"
          className="min-w-[120px]"
        >
          {mutation.isPending ? "Publishing…" : "Publish"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 12: Growth / Confetti
// ---------------------------------------------------------------------------

function StepGrowth({ slug }: { slug?: string | null }) {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const profileUrl = slug ? `${siteUrl}/mentors/${slug}` : null;

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4" aria-hidden>
        🎉
      </div>
      <h2
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "Caveat, cursive" }}
      >
        Your profile is live!
      </h2>
      <p className="text-muted-foreground mb-6">
        Congratulations! Students can now find and book you.
      </p>

      {profileUrl && (
        <div className="mb-6 p-3 bg-muted rounded-lg text-sm break-all">
          <p className="font-medium mb-1">Share your profile:</p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {profileUrl}
          </a>
        </div>
      )}

      <Button
        onClick={() => router.push("/dashboard")}
        size="lg"
        type="button"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MentorOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, isMentor } = useAuth();
  const { data: onboarding, isLoading: onboardingLoading } = useMentorMeOnboarding();
  const { data: preview } = useMentorPreview();

  const [step, setStep] = useState(1);
  const [initialized, setInitialized] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isMentor) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, isMentor, router]);

  // Initialize step from API
  useEffect(() => {
    if (!initialized && onboarding?.nextStep) {
      setStep(onboarding.nextStep);
      setInitialized(true);
    }
  }, [initialized, onboarding]);

  function advance() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  if (!hasHydrated || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Stepper current={step} />

      {/* Progress bar */}
      <div className="w-full h-1 bg-border">
        <div
          className="h-1 bg-primary transition-all"
          style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Step ${step} of ${TOTAL_STEPS}`}
        />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 1 && (
          <StepSource onContinue={advance} onBack={back} step={step} />
        )}
        {step === 2 && (
          <StepProfile onContinue={advance} onBack={back} step={step} />
        )}
        {step === 3 && (
          <PlaceholderStep onContinue={advance} />
        )}
        {step === 4 && (
          <PlaceholderStep onContinue={advance} />
        )}
        {step === 5 && (
          <PlaceholderStep onContinue={advance} />
        )}
        {step === 6 && (
          <StepExpertise onContinue={advance} onBack={back} step={step} />
        )}
        {step === 7 && (
          <StepAvailability onContinue={advance} onBack={back} step={step} />
        )}
        {step === 8 && (
          <StepPricing onContinue={advance} onBack={back} step={step} />
        )}
        {step === 9 && (
          <PlaceholderStep onContinue={advance} />
        )}
        {step === 10 && (
          <PlaceholderStep onContinue={advance} />
        )}
        {step === 11 && (
          <StepPreview onContinue={advance} onBack={back} step={step} />
        )}
        {step === 12 && (
          <StepGrowth slug={preview?.slug} />
        )}
      </main>
    </div>
  );
}
