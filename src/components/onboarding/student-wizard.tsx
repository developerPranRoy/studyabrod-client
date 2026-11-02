"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRegister } from "@/hooks/use-auth-actions";
import { useOnboardingOptions, useCountriesByRegion, useTimezones } from "@/hooks/use-lookups";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/shared/spinner";
import { ErrorState } from "@/components/shared/error-state";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Wizard state
// ---------------------------------------------------------------------------

interface WizardAnswers {
  programId?: number;
  fieldIds?: number[];
  regionIds?: number[];
  countryIds?: number[];
  countriesOther?: boolean;
  budgetRangeId?: number;
  fundingNeedId?: number;
  workWhileStudying?: boolean;
  stayAfterStudy?: "YES" | "NO" | "NOT_ESSENTIAL";
  ielts?: { taken: boolean; score?: number };
  applyMode?: "SELF" | "ASSISTED";
  helpTopicIds?: number[];
  timezone?: string;
  sourceId?: number;
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

const STEP_NAMES = [
  "Degree",
  "Field of Study",
  "Regions",
  "Countries",
  "Budget",
  "Funding",
  "Work",
  "Stay After Study",
  "IELTS",
  "Apply Mode",
  "Help Topics",
  "Timezone",
  "Source",
] as const;

// ---------------------------------------------------------------------------
// Account form schema
// ---------------------------------------------------------------------------

const accountSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Za-z]/, "Include a letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms" }) }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type AccountFormValues = z.infer<typeof accountSchema>;

// ---------------------------------------------------------------------------
// Pill card component
// ---------------------------------------------------------------------------

interface PillCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function PillCard({ label, selected, onClick }: PillCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-shadow cursor-pointer",
        selected
          ? "border-2 border-brand-500 bg-pink-50 text-brand-700"
          : "border border-gray-200 bg-gray-100 text-gray-800 hover:shadow-md"
      )}
      aria-pressed={selected}
    >
      {selected && <Check className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

interface ProgressBarProps {
  step: number;
  total: number;
  stepName: string;
}

function ProgressBar({ step, total, stepName }: ProgressBarProps) {
  const percent = Math.round((step / total) * 100);
  return (
    <div className="mb-8 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Step {step} of {total}:{" "}
        <span className="font-semibold text-foreground">{stepName}</span>
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Step ${step} of ${total}`}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Navigation footer
// ---------------------------------------------------------------------------

interface NavFooterProps {
  onBack?: () => void;
  onContinue: () => void;
  continueDisabled: boolean;
  continueLabel?: string;
  isPending?: boolean;
}

function NavFooter({
  onBack,
  onContinue,
  continueDisabled,
  continueLabel = "Continue",
  isPending,
}: NavFooterProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      ) : (
        <span />
      )}
      <Button
        type="button"
        onClick={onContinue}
        disabled={continueDisabled || isPending}
        className="bg-brand-600 hover:bg-brand-700 text-white px-8"
        size="lg"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {continueLabel}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account creation form
// ---------------------------------------------------------------------------

interface AccountFormProps {
  answers: WizardAnswers;
  onBack: () => void;
}

function AccountForm({ answers, onBack }: AccountFormProps) {
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true,
    },
  });

  function onSubmit(values: AccountFormValues) {
    register.mutate({
      firstName: values.firstName,
      lastName: values.lastName ?? "",
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      acceptTerms: true,
      onboarding: {
        programId: answers.programId!,
        fieldIds: answers.fieldIds!,
        regionIds: answers.regionIds!,
        countryIds: answers.countryIds ?? [],
        countriesOther: answers.countriesOther ?? false,
        budgetRangeId: answers.budgetRangeId!,
        fundingNeedId: answers.fundingNeedId!,
        workWhileStudying: answers.workWhileStudying ?? false,
        stayAfterStudy: answers.stayAfterStudy ?? "NOT_ESSENTIAL",
        ielts: answers.ielts ?? { taken: false },
        applyMode: answers.applyMode ?? "SELF",
        helpTopicIds: answers.helpTopicIds ?? [],
        timezone: answers.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        sourceId: answers.sourceId!,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-script text-3xl text-brand-600">Almost there!</h2>
        <p className="text-muted-foreground">Create your account to save your preferences.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal leading-snug text-muted-foreground">
                    Yes, I agree to the{" "}
                    <span className="font-medium text-brand-600">Terms of Service</span> and Privacy
                    Policy.
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <Button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white px-8"
              size="lg"
              disabled={register.isPending}
            >
              {register.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create my account
            </Button>
          </div>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 inner component — needs hook for countries by region
// ---------------------------------------------------------------------------

interface Step4Props {
  regionIds: number[];
  countryIds: number[];
  countriesOther: boolean;
  onToggleCountry: (id: number) => void;
  onToggleOther: () => void;
}

function Step4Countries({
  regionIds,
  countryIds,
  countriesOther,
  onToggleCountry,
  onToggleOther,
}: Step4Props) {
  const { data: countries, isLoading, isError, refetch } = useCountriesByRegion(regionIds);

  if (isLoading) {
    return <Spinner label="Loading countries…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load countries"
        onRetry={() => void refetch()}
      />
    );
  }

  const list = countries ?? [];

  return (
    <div className="flex flex-wrap gap-3">
      {list.map((c) => (
        <PillCard
          key={c.id}
          label={c.name}
          selected={countryIds.includes(c.id)}
          onClick={() => onToggleCountry(c.id)}
        />
      ))}
      <PillCard
        label="Other"
        selected={countriesOther}
        onClick={onToggleOther}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 12 inner component — timezone select
// ---------------------------------------------------------------------------

interface Step12Props {
  timezone: string;
  onChange: (tz: string) => void;
}

function Step12Timezone({ timezone, onChange }: Step12Props) {
  const { data: timezones, isLoading } = useTimezones();

  const list = timezones ?? [];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Auto-detected: <span className="font-medium text-foreground">{timezone}</span>
      </p>
      <div>
        <label htmlFor="tz-select" className="sr-only">
          Timezone
        </label>
        <select
          id="tz-select"
          value={timezone}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          disabled={isLoading}
          aria-label="Select your timezone"
        >
          {/* Ensure the detected value is always present even if API hasn't loaded */}
          {list.length === 0 ? (
            <option value={timezone}>{timezone}</option>
          ) : (
            list.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export function StudentWizard() {
  const { data: options, isLoading, isError, refetch } = useOnboardingOptions();

  // Wizard state
  const [step, setStep] = useState<number>(1); // 1-indexed
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [showAccountForm, setShowAccountForm] = useState(false);

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading your options…" />
      </div>
    );
  }

  if (isError || !options) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Couldn't load onboarding options"
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step skip logic: step 11 is skipped when applyMode === 'SELF'
  // ---------------------------------------------------------------------------

  const skipHelpTopics = answers.applyMode === "SELF";

  // Effective step sequence (1-indexed logical steps that map to 1..13 visual steps)
  function nextStep(current: number): number {
    if (current === 10 && skipHelpTopics) return 12;
    return current + 1;
  }

  function prevStep(current: number): number {
    if (current === 12 && skipHelpTopics) return 10;
    return current - 1;
  }

  // ---------------------------------------------------------------------------
  // Validation per step
  // ---------------------------------------------------------------------------

  function isStepValid(s: number): boolean {
    switch (s) {
      case 1:
        return answers.programId !== undefined;
      case 2:
        return (answers.fieldIds?.length ?? 0) >= 1;
      case 3:
        return (answers.regionIds?.length ?? 0) >= 1;
      case 4:
        return (answers.countryIds?.length ?? 0) >= 1 || answers.countriesOther === true;
      case 5:
        return answers.budgetRangeId !== undefined;
      case 6:
        return answers.fundingNeedId !== undefined;
      case 7:
        return answers.workWhileStudying !== undefined;
      case 8:
        return answers.stayAfterStudy !== undefined;
      case 9:
        if (answers.ielts?.taken === false) return true;
        if (answers.ielts?.taken === true) return answers.ielts.score !== undefined;
        return false;
      case 10:
        return answers.applyMode !== undefined;
      case 11:
        return (answers.helpTopicIds?.length ?? 0) >= 1;
      case 12:
        return (answers.timezone ?? "").length > 0;
      case 13:
        return answers.sourceId !== undefined;
      default:
        return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleContinue() {
    if (!isStepValid(step)) return;
    if (step === 13) {
      setShowAccountForm(true);
      return;
    }
    setStep(nextStep(step));
  }

  function handleBack() {
    if (step === 1) return;
    setStep(prevStep(step));
  }

  // ---------------------------------------------------------------------------
  // Toggle helpers
  // ---------------------------------------------------------------------------

  function toggleId<K extends keyof WizardAnswers>(
    key: K,
    id: number,
    current: number[] | undefined
  ) {
    const arr = current ?? [];
    const next = arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id];
    setAnswers((prev) => ({ ...prev, [key]: next }));
  }

  // ---------------------------------------------------------------------------
  // Render account form
  // ---------------------------------------------------------------------------

  if (showAccountForm) {
    return (
      <AccountForm
        answers={answers}
        onBack={() => setShowAccountForm(false)}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Render wizard steps
  // ---------------------------------------------------------------------------

  const stepName = STEP_NAMES[step - 1];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <ProgressBar step={step} total={13} stepName={stepName} />

      {/* Step content */}
      <div className="space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* Step 1: Degree */}
        {/* ------------------------------------------------------------------ */}
        {step === 1 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              What degree are you aiming for?
            </h2>
            <div className="flex flex-wrap gap-3">
              {options.programs.map((p) => (
                <PillCard
                  key={p.id}
                  label={p.name}
                  selected={answers.programId === p.id}
                  onClick={() => setAnswers((prev) => ({ ...prev, programId: p.id }))}
                />
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 2: Field of study */}
        {/* ------------------------------------------------------------------ */}
        {step === 2 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              What field do you want to study?
            </h2>
            <div className="flex flex-wrap gap-3">
              {options.fields.map((f) => (
                <PillCard
                  key={f.id}
                  label={f.name}
                  selected={(answers.fieldIds ?? []).includes(f.id)}
                  onClick={() =>
                    toggleId("fieldIds", f.id, answers.fieldIds)
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 3: Regions */}
        {/* ------------------------------------------------------------------ */}
        {step === 3 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              Which regions interest you?
            </h2>
            <div className="flex flex-wrap gap-3">
              {options.regions.map((r) => (
                <PillCard
                  key={r.id}
                  label={r.name}
                  selected={(answers.regionIds ?? []).includes(r.id)}
                  onClick={() =>
                    toggleId("regionIds", r.id, answers.regionIds)
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 4: Countries */}
        {/* ------------------------------------------------------------------ */}
        {step === 4 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              Which countries are you interested in?
            </h2>
            <Step4Countries
              regionIds={answers.regionIds ?? []}
              countryIds={answers.countryIds ?? []}
              countriesOther={answers.countriesOther ?? false}
              onToggleCountry={(id) => toggleId("countryIds", id, answers.countryIds)}
              onToggleOther={() =>
                setAnswers((prev) => ({
                  ...prev,
                  countriesOther: !prev.countriesOther,
                }))
              }
            />
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 5: Budget */}
        {/* ------------------------------------------------------------------ */}
        {step === 5 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              What is your annual budget range?
            </h2>
            <div className="flex flex-wrap gap-3">
              {options.budgetRanges.map((b) => (
                <PillCard
                  key={b.id}
                  label={b.name}
                  selected={answers.budgetRangeId === b.id}
                  onClick={() => setAnswers((prev) => ({ ...prev, budgetRangeId: b.id }))}
                />
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 6: Funding */}
        {/* ------------------------------------------------------------------ */}
        {step === 6 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              Do you need funding/scholarships?
            </h2>
            <div className="flex flex-wrap gap-3">
              {options.fundingNeeds.map((f) => (
                <PillCard
                  key={f.id}
                  label={f.name}
                  selected={answers.fundingNeedId === f.id}
                  onClick={() => setAnswers((prev) => ({ ...prev, fundingNeedId: f.id }))}
                />
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 7: Work while studying */}
        {/* ------------------------------------------------------------------ */}
        {step === 7 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              Do you plan to work while studying?
            </h2>
            <div className="flex flex-wrap gap-3">
              <PillCard
                label="Yes"
                selected={answers.workWhileStudying === true}
                onClick={() => setAnswers((prev) => ({ ...prev, workWhileStudying: true }))}
              />
              <PillCard
                label="No"
                selected={answers.workWhileStudying === false && answers.workWhileStudying !== undefined}
                onClick={() => setAnswers((prev) => ({ ...prev, workWhileStudying: false }))}
              />
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 8: Stay after study */}
        {/* ------------------------------------------------------------------ */}
        {step === 8 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              Do you plan to stay after graduation?
            </h2>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { value: "YES" as const, label: "Yes" },
                  { value: "NO" as const, label: "No" },
                  { value: "NOT_ESSENTIAL" as const, label: "Not essential" },
                ] satisfies Array<{ value: "YES" | "NO" | "NOT_ESSENTIAL"; label: string }>
              ).map(({ value, label }) => (
                <PillCard
                  key={value}
                  label={label}
                  selected={answers.stayAfterStudy === value}
                  onClick={() => setAnswers((prev) => ({ ...prev, stayAfterStudy: value }))}
                />
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 9: IELTS */}
        {/* ------------------------------------------------------------------ */}
        {step === 9 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              Have you taken the IELTS?
            </h2>
            <div className="flex flex-wrap gap-3">
              <PillCard
                label="Yes"
                selected={answers.ielts?.taken === true}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    ielts: { taken: true, score: prev.ielts?.score },
                  }))
                }
              />
              <PillCard
                label="No"
                selected={answers.ielts?.taken === false}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, ielts: { taken: false } }))
                }
              />
            </div>

            {answers.ielts?.taken === true && (
              <div className="mt-4 space-y-2">
                <label
                  htmlFor="ielts-score"
                  className="block text-sm font-medium text-foreground"
                >
                  Your IELTS score (0–9)
                </label>
                <input
                  id="ielts-score"
                  type="number"
                  min={0}
                  max={9}
                  step={0.5}
                  value={answers.ielts.score ?? ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setAnswers((prev) => ({
                      ...prev,
                      ielts: {
                        taken: true,
                        score: isNaN(val) ? undefined : val,
                      },
                    }));
                  }}
                  placeholder="e.g. 7.5"
                  className="w-40 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-required="true"
                />
              </div>
            )}
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 10: Apply mode */}
        {/* ------------------------------------------------------------------ */}
        {step === 10 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              How do you want to apply?
            </h2>
            <div className="flex flex-wrap gap-3">
              <PillCard
                label="On my own"
                selected={answers.applyMode === "SELF"}
                onClick={() => setAnswers((prev) => ({ ...prev, applyMode: "SELF" }))}
              />
              <PillCard
                label="With guidance"
                selected={answers.applyMode === "ASSISTED"}
                onClick={() => setAnswers((prev) => ({ ...prev, applyMode: "ASSISTED" }))}
              />
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 11: Help topics (ASSISTED only) */}
        {/* ------------------------------------------------------------------ */}
        {step === 11 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              What do you need help with?
            </h2>
            <div className="flex flex-wrap gap-3">
              {options.helpTopics.map((h) => (
                <PillCard
                  key={h.id}
                  label={h.name}
                  selected={(answers.helpTopicIds ?? []).includes(h.id)}
                  onClick={() =>
                    toggleId("helpTopicIds", h.id, answers.helpTopicIds)
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 12: Timezone */}
        {/* ------------------------------------------------------------------ */}
        {step === 12 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              What is your timezone?
            </h2>
            <Step12Timezone
              timezone={
                answers.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
              }
              onChange={(tz) => setAnswers((prev) => ({ ...prev, timezone: tz }))}
            />
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Step 13: Source */}
        {/* ------------------------------------------------------------------ */}
        {step === 13 && (
          <>
            <h2 className="font-script text-2xl text-brand-600">
              How did you hear about us?
            </h2>
            <div className="flex flex-wrap gap-3">
              {options.sources.map((s) => (
                <PillCard
                  key={s.id}
                  label={s.name}
                  selected={answers.sourceId === s.id}
                  onClick={() => setAnswers((prev) => ({ ...prev, sourceId: s.id }))}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <NavFooter
        onBack={step > 1 ? handleBack : undefined}
        onContinue={handleContinue}
        continueDisabled={!isStepValid(step)}
        continueLabel={step === 13 ? "Continue to create account" : "Continue"}
      />
    </div>
  );
}
