# Implementation Plan — Mentor Flow Rebuild

> Generated from codebase exploration. Every file path, API endpoint, and type reference is grounded in code read during investigation.

---

## Design Decisions

1. **Mentor register page route group**: The new `/mentor/register` is placed under `(site)` with its own nested layout (`src/app/(site)/mentor/register/layout.tsx`) so it renders without the `SiteHeader`/`SiteFooter` chrome defined in `src/app/(site)/layout.tsx`. A segment-level layout override is the cleanest Next.js 14 approach — no changes to `(site)/layout.tsx` required.

2. **Onboarding route group**: `/mentor/onboarding` lives under `(app)` (auth-gated via `DashboardShell`→`RequireAuth`) but its own `layout.tsx` removes the left sidebar and renders fullscreen — a pattern identical to what the existing `app/mentor-onboarding/` attempted but that directory is not under any authenticated route group.

3. **Wizard shell architecture**: A single `MentorWizard` client component drives all 12 steps. Step components live in `src/components/mentor-wizard/steps/`. This mirrors the existing `StudentWizard` pattern and keeps each step independently unit-testable.

4. **`verificationRequired` in auth-store**: Stored as a boolean so any component (banner, wizard shell) can read it via `useAuthStore` without prop-drilling. `setAuth` is updated to optionally accept it from the register-mentor response.

5. **`MentorOnboardingOptions` type expansion**: The existing type at `types.ts` is missing `sources`, `scholarships`, `helpTopics`, `payoutMethods` (with `requiredFields`/`optionalFields`), `services`, `pricingMarkets` as richer shapes. We enrich the types rather than casting to `unknown` — consistent with the project's dto-normalizer pattern.

6. **Booked sessions page**: Lives at `src/app/(app)/mentor/sessions/booked/page.tsx` — matches the new `MENTOR_NAV` entry and the existing `MentorMeBooking` type + `getMentorMeBookings` API function already in `mentor-me.ts`.

7. **`getMentorMe` function**: A `GET /mentors/me` API call is needed to prefill wizard steps. The existing `mentor-me.ts` has per-resource calls but no single `/mentors/me` draft profile fetch. We add `getMentorMeDraft()` there and a corresponding hook `useMentorMeDraft()` in `use-mentor-me.ts`.

---

## Implementation Plan

- [ ] 1. **Expand `lib/api/types.ts` with new shared types**

  Add the following interfaces / type augmentations required by tasks 1–4. No existing types are removed.

  **New types to add:**
  ```ts
  // Richer payout method shape (step 9)
  export interface PayoutMethod {
    id: number;
    name: string;
    slug: string;
    requiredFields: string[];
    optionalFields: string[];
  }

  // Richer social platform shape (step 10)
  export interface SocialPlatform {
    id: number;
    name: string;
    slug: string;
    domains: string[];
  }

  // Richer pricing market shape (step 8) — extends the existing PricingMarket
  export interface PricingMarketFull extends PricingMarket {
    recommendedPrices: Record<number, number>; // serviceId -> recommended price
    platformFeePercent: number;
  }

  // Richer scholarship shape for wizard step 5
  export interface ScholarshipOption {
    id: number;
    name: string;
    slug: string;
  }

  // Full mentor draft profile returned by GET /mentors/me (wizard prefill)
  export interface MentorMeDraft {
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    nationalityId: number | null;
    sellingPoint: string | null;
    photoUrl: string | null;
    cvUrl: string | null;
    photoCrop: { zoom: number; x: number; y: number } | null;
    source: { sourceId: number | null };
    location: MentorMeLocationInput | null;
    social: MentorMeSocialLink[];
    payout: { method: string | null; maskedHint: string | null; confirmedAt: string | null };
    status: string;
  }

  // Onboarding progress returned by GET /mentors/me/onboarding (full shape)
  export interface MentorOnboardingProgress {
    steps: Array<{ key: string; done: boolean }>;
    nextStep: number;
    status: string;
    strength: { percent: number };
  }

  // Mentor register response (POST /auth/register/mentor returns token + verificationRequired)
  export interface MentorAuthPayload extends AuthPayload {
    verificationRequired: boolean;
  }

  // Mentor booked session (GET /mentors/me/bookings full shape)
  export interface MentorBookedSession {
    id: number;
    scheduledAt: string;
    status: string;
    studentName: string;
    studentPhotoUrl: string | null;
    durationMin: number | null;
    price: number | null;
    topic: string | null;
  }
  ```

  **Augment existing `MentorOnboardingOptions`** to add the richer lookup fields the wizard needs:
  ```ts
  export interface MentorOnboardingOptions {
    educationStatuses: Array<{ id: number; name: string; slug: string; isCurrent?: boolean }>;
    programs: Array<{ id: number; name: string; slug: string; isBackgroundOnly?: boolean }>;
    socialPlatforms: SocialPlatform[];
    payoutMethods: PayoutMethod[];
    sources: Array<{ id: number; name: string; slug: string }>;
    scholarships: ScholarshipOption[];
    helpTopics: Array<{ id: number; name: string; slug: string }>;
    services: Array<{ id: number; name: string; slug: string; durationMin: number }>;
    pricingMarkets: PricingMarketFull[];
  }
  ```

  Files: `src/lib/api/types.ts`

  Verify: `npm run typecheck` — exits 0 with no new errors.

---

- [ ] 2. **Update `lib/api/auth.ts` — mentor register returns `verificationRequired`**

  Change `registerMentor` to return `MentorAuthPayload` instead of `AuthPayload`, extracting `verificationRequired` from the envelope `data` field (same pattern as `register()` in the same file).

  ```ts
  // Before
  export async function registerMentor(input: {...}): Promise<AuthPayload>

  // After  
  export async function registerMentor(input: {...}): Promise<MentorAuthPayload>
  // implementation: const vr = Boolean(res.data.data?.verificationRequired);
  // return { ...toAuthPayload(res.data.data), verificationRequired: vr };
  ```

  Files: `src/lib/api/auth.ts`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 3. **Update `store/auth-store.ts` — add `verificationRequired` field (Task 3)**

  Add `verificationRequired: boolean` to `AuthState`, defaulting to `false`. Update `setAuth` signature to accept an optional third argument `verificationRequired?: boolean`. Persist it alongside `token` and `user` in `partialize`.

  ```ts
  interface AuthState {
    ...
    verificationRequired: boolean;
    setAuth: (token: string, user: User, verificationRequired?: boolean) => void;
    ...
  }
  // set: { token, user, verificationRequired: verificationRequired ?? false }
  // partialize: (state) => ({ token: state.token, user: state.user, verificationRequired: state.verificationRequired })
  ```

  Export `useVerificationRequired` selector:
  ```ts
  export const useVerificationRequired = () => useAuthStore((s) => s.verificationRequired);
  ```

  Files: `src/store/auth-store.ts`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 4. **Update `hooks/use-auth-actions.ts` — wire `verificationRequired` into `useRegisterMentor`**

  `useRegisterMentor.onSuccess` now receives `MentorAuthPayload`. Call `setAuth(token, user, verificationRequired)`. Redirect to `/mentor/onboarding` instead of `/dashboard/mentor/profile`.

  ```ts
  onSuccess: ({ token, user, verificationRequired }, variables) => {
    setAuth(token, user, verificationRequired);
    queryClient.invalidateQueries();
    toast.success(`Welcome, ${user.fullName.split(" ")[0]}! Start building your profile.`);
    router.push(variables.next ?? "/mentor/onboarding");
  },
  ```

  Also add a `useResendVerification` mutation in this file:
  ```ts
  export function useResendVerification() {
    return useMutation({
      mutationFn: (email: string) => resendVerification({ email }),
      onSuccess: () => toast.success("Verification email sent"),
      onError: (e) => toast.error(e.message),
    });
  }
  ```
  (The `resendVerification` function already exists in `lib/api/auth.ts`.)

  Files: `src/hooks/use-auth-actions.ts`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 5. **Add `getMentorMeDraft` to `lib/api/mentor-me.ts` and `useMentorMeDraft` to `hooks/use-mentor-me.ts`**

  Add a new read function to `mentor-me.ts` that calls `GET /mentors/me` and normalises the response into `MentorMeDraft`. Add corresponding query key `mentorMeDraft: ["mentors", "me", "draft"]` to `hooks/query-keys.ts`, and add `useMentorMeDraft(enabled?)` to `hooks/use-mentor-me.ts`.

  Also expand `getMentorOnboardingOptions` normaliser in `lib/api/lookups.ts` to extract `sources`, `scholarships`, `helpTopics`, `services`, and `pricingMarkets` with their richer shapes (using the dto helper `isObj`, `num`, `str`, `asArray`). Update `toMentorOnboardingOptions` function and `MentorOnboardingOptions` shape.

  Files:
  - `src/lib/api/mentor-me.ts`
  - `src/hooks/use-mentor-me.ts`
  - `src/hooks/query-keys.ts`
  - `src/lib/api/lookups.ts`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 6. **Create the mentor register page — Task 1**

  **Delete** `src/app/(auth)/register/mentor/page.tsx`.

  **Create** `src/app/(site)/mentor/register/layout.tsx` — overrides the parent `(site)/layout.tsx` by rendering a fullscreen split-screen without `SiteHeader`/`SiteFooter`:
  ```tsx
  export default function MentorRegisterLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: crimson panel */}
        <aside className="hidden lg:flex flex-col justify-between bg-[#C1113F] p-10 text-white relative overflow-hidden">
          {/* decorative circle + Logo (light) + tagline "Be the mentor you once needed." + 3 bullet points */}
        </aside>
        {/* Right: cream/white form panel */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8 bg-[#FFFCF5]">
          {children}
        </main>
      </div>
    );
  }
  ```

  **Create** `src/app/(site)/mentor/register/page.tsx` — form component using `react-hook-form` + zod. Schema:
  - `fullName`: string, min 2 words (first + last: `.refine(v => v.trim().split(/\s+/).length >= 2)` with message "Must contain first and last name"), label "As students will see you"
  - `email`: valid email
  - `password`: ≥8 chars, letter + number
  - `confirmPassword`: must match
  - `acceptTerms`: `z.literal(true)`, label "Yes, I agree to the Terms of Service"

  On submit: call `useRegisterMentor()`. Button label: "Continue to build my profile". Below form: privacy note "Your information stays private until you finish and submit your mentor profile". No Turnstile (dependency not installed; leave a `{/* TODO: Turnstile */}` comment).

  Files:
  - `src/app/(site)/mentor/register/layout.tsx` (CREATE)
  - `src/app/(site)/mentor/register/page.tsx` (CREATE)
  - DELETE `src/app/(auth)/register/mentor/page.tsx`

  Verify: `npm run typecheck` — exits 0. Confirm the deleted file no longer appears in Next.js route tree (no import of it anywhere in the codebase).

---

- [ ] 7. **Update `site-header.tsx` — change "Join as a mentor" link (Task 1)**

  The current header has no "Join as a mentor" link — it only has Login + Sign up. Add a "Join as a mentor" link pointing to `/mentor/register` in the desktop right section (between Log in and Sign up, visible only when `!isAuthenticated`) and in the mobile drawer (below Sign Up).

  ```tsx
  // Desktop right section, unauthenticated only:
  <Button variant="ghost" size="sm" asChild className="text-sm font-medium text-gray-700">
    <Link href="/mentor/register">Join as a mentor</Link>
  </Button>
  ```

  Also add it to the mobile drawer `MobileDrawer` component's auth section.

  Files: `src/components/layout/site-header.tsx`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 8. **Create the onboarding layout and page scaffolding — Task 2**

  **Create** `src/app/(app)/mentor/onboarding/layout.tsx` — a fullscreen layout that renders without the dashboard sidebar. It wraps children in `<RequireAuth role="MENTOR">` and renders a bare container (no `DashboardShell`). To escape the parent `(app)/layout.tsx` which wraps in `DashboardShell`, this layout must itself be a server component that renders a plain `<div>` — the `RequireAuth` guard is placed inside the page component instead, since the (app) layout already wraps everything in `RequireAuth` via `DashboardShell`.

  > **Decision**: The `(app)/layout.tsx` renders `<DashboardShell>` unconditionally. To get a fullscreen wizard without the sidebar, the onboarding layout overrides the shell by rendering a `min-h-screen` wrapper without sidebar. We do this by making `src/app/(app)/mentor/onboarding/layout.tsx` a client layout that wraps children in a div directly — Next.js allows layouts at any segment level to override parent layout output for their subtree. The sidebar is part of the `DashboardShell` rendered by `(app)/layout.tsx`, which we cannot opt out of without a route group change. Therefore we move the onboarding route OUTSIDE `(app)` into a new `(wizard)` route group.

  > **Revised approach**: Create `src/app/(wizard)/` route group with its own `layout.tsx` that only wraps in `<RequireAuth role="MENTOR">` (no sidebar), and place the onboarding pages there. This avoids sidebar bleed-through without touching existing `(app)/layout.tsx`.

  **Create** `src/app/(wizard)/layout.tsx`:
  ```tsx
  import { RequireAuth } from "@/components/auth/require-auth";
  export default function WizardLayout({ children }: { children: React.ReactNode }) {
    return <RequireAuth role="MENTOR">{children}</RequireAuth>;
  }
  ```

  **Create** `src/app/(wizard)/mentor/onboarding/layout.tsx`:
  ```tsx
  export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }
  ```

  **Create** `src/app/(wizard)/mentor/onboarding/page.tsx`:
  ```tsx
  import { MentorWizard } from "@/components/mentor-wizard/mentor-wizard";
  export default function MentorOnboardingPage() {
    return <MentorWizard />;
  }
  ```

  Files:
  - `src/app/(wizard)/layout.tsx` (CREATE)
  - `src/app/(wizard)/mentor/onboarding/layout.tsx` (CREATE)
  - `src/app/(wizard)/mentor/onboarding/page.tsx` (CREATE)

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 9. **Create the `MentorWizard` shell component — Task 2**

  Create `src/components/mentor-wizard/mentor-wizard.tsx`. This is the main orchestrator:

  - On mount: call `useMentorMeOnboarding()` (already in `use-mentor-me.ts`) — response is `MentorOnboardingProgress`; resume at `progress.nextStep`. Show a loading spinner while fetching.
  - State: `currentStep: number` (1–12), `doneSteps: Set<number>`.
  - Renders: top bar with `<Logo />`, step title, and "Save & Exit" button (calls `router.push("/dashboard")`). Below: `<WizardStepper>` (12 labeled circles, filled=done, clickable if done). Below: current `<StepN>` component. Each step gets `onComplete: () => void` (advances step + marks done).
  - Verification banner: reads `useVerificationRequired()` from auth-store. If `true`, shows a persistent yellow/amber banner "Verify your email to publish your profile" with a "Resend" button calling `useResendVerification()`.
  - "Save & Exit" navigates to `/dashboard`.

  Files: `src/components/mentor-wizard/mentor-wizard.tsx`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 10. **Create all 12 wizard step components — Task 2**

  Create one file per step in `src/components/mentor-wizard/steps/`. Each step component signature: `function Step<N>({ onComplete }: { onComplete: () => void }): JSX.Element`. All use `react-hook-form` + zod for forms, existing hooks from `use-mentor-me.ts`, and lookups from `use-lookups.ts`.

  **Step 1 — `step-01-source.tsx`**
  - Data: `useOnboardingOptions()` → `opts.sources` (same source as student wizard)
  - Form: single-select pill grid
  - API: `useSaveMentorMeSource()` → `PUT /mentors/me/source { sourceId }`
  - Prefill: `useMentorMeDraft()` → `draft.source.sourceId`

  **Step 2 — `step-02-profile.tsx`**
  - Data: `useAllCountries()` for nationality searchable select
  - Photo: drag-and-drop uploader with canvas crop to square ≤2 MB JPEG/PNG, zoom slider, "Reset to center", "Happy with picture" — `useUploadMentorMePhoto()` → `POST /mentors/me/photo` multipart `file`
  - CV: PDF ≤5 MB — `useUploadMentorMeCv()` → `POST /mentors/me/cv`
  - Fields: First name, Middle name (optional), Last name, Nationality (searchable), "Your unique selling point" (textarea, 500-char counter, min 10) with label "Your unique selling point for guiding students"
  - zod schema: `firstName` required, `lastName` required, `nationalityId: z.number()`, `sellingPoint: z.string().min(10).max(500)`, `middleName` optional
  - API: `useSaveMentorMeProfile()` → `PUT /mentors/me/profile { firstName, middleName, lastName, nationalityId, sellingPoint, photoCrop }`
  - Prefill: `useMentorMeDraft()` → first/middle/last/nationality/sellingPoint/photoCrop
  - UI: "Choose a photo that feels like you" tips card (two avatar icon placeholders)

  **Step 3 — `step-03-location.tsx`**
  - Data: `useAllCountries()` for both city/country selects
  - Fields: Street address (optional), City (required), Country (required) for current location; checkbox "Same as current location" — when unchecked show identical set of fields for permanent home
  - zod schema: `current: { street?: string; city: string; countryId: number }`, `permanent: { sameAsCurrent: boolean; street?: string; city?: string; countryId?: number }` with `.superRefine` to require city/countryId when `!sameAsCurrent`
  - API: `useSaveMentorMeLocation()` → `PUT /mentors/me/location`
  - Prefill from `useMentorMeDraft()` → `draft.location`

  **Step 4 — `step-04-university.tsx`**
  - Data: `useMentorOnboardingOptions()` → `educationStatuses`, `programs` (filter `isBackgroundOnly` for abroad vs. all for background); `useAllCountries()` for university country; `useUniversities(countryId)` for search-as-you-type with free text fallback
  - Orange tip box: "Own-country education will not count as your abroad university..."
  - Repeatable education card for "abroad" (pill "University degree abroad"): universityName (autocomplete), status (educationStatuses), degree (programs where `!isBackgroundOnly`), field of study, admissionYear, graduationYear (disabled with "N/A" when `status.isCurrent`, required otherwise), city (optional), universityCountry; collapsible "University Scholarships (Optional)"
  - Repeatable education card for "background" (pill "Background"): same fields but degree from ALL programs including `isBackgroundOnly`
  - Buttons: "Add another university degree abroad", "Add own-country education"
  - API: `useSaveMentorMeEducationsAbroad()` → `PUT /mentors/me/educations/abroad { educations: [...] }` (min 1 abroad) and `useSaveMentorMeEducationsBackground()` → `PUT /mentors/me/educations/background`
  - Show per-card API 400 errors (e.g. "Own-country education belongs under Background")

  **Step 5 — `step-05-scholarships.tsx`**
  - Data: `useMentorOnboardingOptions()` → `scholarships`
  - Tip box above form
  - Mutually exclusive: "+ Add Scholarship Program" (scholarshipId select + outcome: "Applied"/"Received" radio) OR "I did not apply for a scholarship program" checkbox
  - Repeatable scholarship rows with add/delete
  - zod: `noScholarshipProgram: boolean`, `programs: Array<{ scholarshipId: number; outcome: string }>` — superRefine: if `!noScholarshipProgram` then `programs.length >= 1`
  - API: `useSaveMentorMeScholarships()` → `PUT /mentors/me/scholarships { noScholarshipProgram, programs }`

  **Step 6 — `step-06-expertise.tsx`**
  - Data: `useMentorOnboardingOptions()` → `helpTopics`
  - 13 topic card tiles with icons (use Lucide icons mapped per topic name), multi-select, "n selected" badge, min 1
  - Tip: "You can always update your expertise areas later from your mentor dashboard"
  - API: `useSaveMentorMeExpertise()` → `PUT /mentors/me/expertise { helpTopicIds }`

  **Step 7 — `step-07-availability.tsx`**
  - Data: `useTimezones()`, auto-detect default `Intl.DateTimeFormat().resolvedOptions().timeZone`
  - Error banner "Please add at least one time slot for your availability" until valid
  - Weekly schedule: Mon–Sun rows (weekday 0=Sunday..6=Saturday as per spec), each row: "Unavailable" state or one+ time ranges (24 h value HH:MM sent, 12 h AM/PM shown in UI), "+ Add hours", "Copy" (popover to copy to other days), delete range button
  - Validate no overlapping ranges client-side
  - "Delete all schedules" button → `DELETE /mentors/me/availability` (use `api.delete` directly, invalidate)
  - "How long should this availability run?" chips: "1 month", "3 months", "6 months", "Ends on a specific date" (date picker input), "No end date (ongoing)"; live text "N days until [date]" for date chip
  - `availableUntil`: computed as `"YYYY-MM-DD"` string or `null` (ongoing)
  - API: `useSaveMentorMeAvailability()` → `PUT /mentors/me/availability { timezone, weekly, availableUntil }`

  **Step 8 — `step-08-pricing.tsx`**
  - Data: `useMentorOnboardingOptions()` → `pricingMarkets` (full shape with `platformFeePercent`, `recommendedPrices`), `services`
  - Orange info box: read currency/fee from market data, do NOT hard-code; e.g. "Students in Bangladesh pay in BDT, everyone else in USD. AbroadMates keeps 30% and you keep 70%."
  - Two market cards (Bangladesh/BDT, Outside Bangladesh/USD); per service (20 min, 40 min): price input with placeholder, "Use recommended" button fills `market.recommendedPrices[serviceId]`; below each input: "After 30% platform fee — You keep: X / Platform fee: Y" computed from `platformFeePercent`
  - Min 1 price > 0 to submit
  - API: `useSaveMentorMePricing()` → `PUT /mentors/me/pricing { prices: [{marketId, serviceId, price}] }`

  **Step 9 — `step-09-payout.tsx`**
  - Data: `useMentorOnboardingOptions()` → `payoutMethods` (each has `requiredFields: string[]`, `optionalFields: string[]`)
  - Method tiles: Bank Transfer, Wise, PayPal, Payoneer, bKash (from API, not hard-coded)
  - Selected method: generate form fields from `requiredFields` + `optionalFields` with label map; `contactNumber` and `mobileNumber` get a country-code select prefix + number input, sent as one combined string
  - Checkbox "I confirm the payout details above are accurate" (`confirmed: true`)
  - NEVER pre-fill: `useMentorMePayout()` returns `{ method, maskedHint, confirmedAt }` — show "Saved: [Method] ••••" + "Change" button that resets to empty form; do NOT pre-fill input values
  - API: `useSaveMentorMePayout()` → `PUT /mentors/me/payout { methodId, details, confirmed }`

  **Step 10 — `step-10-social.tsx`**
  - Data: `useMentorOnboardingOptions()` → `socialPlatforms` (each has `domains: string[]`)
  - Min 1 valid link to proceed; green text "You can proceed with at least one valid link"
  - Rows: platform select + URL input with domain prefix displayed, green tick when URL host matches `platform.domains`, "Check" button opens link in new tab, delete icon
  - "+ Add Social Media Link" button
  - API: `useSaveMentorMeSocial()` → `PUT /mentors/me/social { links: [{platformId, url}] }`

  **Step 11 — `step-11-preview.tsx`**
  - Data: `useMentorMePreview()` → preview card (name, photo, sellingPoint, slug)
  - "Publish profile" button → `usePublishMentorMe()` → `POST /mentors/me/publish`
  - 403 `EMAIL_NOT_VERIFIED` error: catch `ApiError`, do NOT navigate, show banner "Verify your email to publish your profile" + Resend button (`useResendVerification()`), "I've verified — try again" button re-calls publish
  - On success: call `onComplete()` to advance to step 12

  **Step 12 — `step-12-growth.tsx`**
  - Checkbox "Share on social media" (`sharedOnSocial: boolean`)
  - API: `useSaveMentorMeGrowth()` → `PUT /mentors/me/growth { sharedOnSocial }`
  - On complete: show confetti/success state, link to `/dashboard`

  Files to create:
  - `src/components/mentor-wizard/mentor-wizard.tsx`
  - `src/components/mentor-wizard/steps/step-01-source.tsx`
  - `src/components/mentor-wizard/steps/step-02-profile.tsx`
  - `src/components/mentor-wizard/steps/step-03-location.tsx`
  - `src/components/mentor-wizard/steps/step-04-university.tsx`
  - `src/components/mentor-wizard/steps/step-05-scholarships.tsx`
  - `src/components/mentor-wizard/steps/step-06-expertise.tsx`
  - `src/components/mentor-wizard/steps/step-07-availability.tsx`
  - `src/components/mentor-wizard/steps/step-08-pricing.tsx`
  - `src/components/mentor-wizard/steps/step-09-payout.tsx`
  - `src/components/mentor-wizard/steps/step-10-social.tsx`
  - `src/components/mentor-wizard/steps/step-11-preview.tsx`
  - `src/components/mentor-wizard/steps/step-12-growth.tsx`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 11. **Update `dashboard-shell.tsx` — new MENTOR_NAV + sidebar footer card (Task 4)**

  Replace the `MENTOR_NAV` array with the new structure. Remove the old `Wand2`/`/mentor-onboarding` link, add new entries:

  ```ts
  const MENTOR_NAV = [
    { href: "/dashboard",               label: "Overview",        icon: LayoutDashboard },
    { href: "/mentor/sessions/booked",  label: "Booked Sessions", icon: BookOpen },
    { href: "/mentor/availability",     label: "Availability",    icon: CalendarDays },
    { href: "/mentor/profile",          label: "Profile",         icon: UserRound },
    { href: "/dashboard/mentor/sessions", label: "Group Sessions", icon: Video },
  ];
  ```

  Add a sidebar footer card above the "Back to site" button (mentor only). The card shows wizard progress using `useMentorMeOnboarding()` with `enabled: isMentor`:
  ```tsx
  {isMentor && (
    <div className="mb-2 rounded-lg border bg-brand-50 p-3">
      <p className="text-xs font-semibold text-brand-700">Profile strength</p>
      <div className="mt-1.5 h-1.5 rounded-full bg-brand-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${strength}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{strength}% complete</span>
        <Link href="/mentor/onboarding" className="text-xs font-semibold text-brand-600 hover:underline">
          Continue →
        </Link>
      </div>
    </div>
  )}
  ```

  Files: `src/components/layout/dashboard-shell.tsx`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 12. **Create `src/app/(app)/mentor/sessions/booked/page.tsx` (Task 4)**

  Mentor's booked (1-on-1) sessions page. Uses `useMentorMeBookings()` from `use-mentor-me.ts` (calls `GET /mentors/me/bookings`). Renders a table/card list showing:
  - Student name, session date/time (`formatDateTime`), duration, status badge, price
  - Filter tabs: All / Upcoming / Past (filter client-side by comparing `scheduledAt` to `Date.now()`)
  - Empty state using `<EmptyState>`; error state using `<ErrorState>`; skeleton loading with `<Skeleton>`
  - Same card layout pattern as `app/(app)/dashboard/mentor/sessions/page.tsx` (which shows GROUP sessions)

  Files: `src/app/(app)/mentor/sessions/booked/page.tsx`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 13. **Update `components/dashboard/mentor-overview.tsx` (Task 4)**

  Replace the stub overview with a full overview that:
  - Fetches `useMentorMeOnboarding()` → wizard progress (`steps`, `nextStep`, `strength`)
  - Fetches `useMentorMeOverview()` → `stats.totalStudents`, `upcoming` sessions, `weeklyHours`
  - Renders:
    1. Stat cards row: Total students, Upcoming sessions (count from `upcoming` array), Profile strength %
    2. Profile setup progress card: wizard `steps` array from onboarding progress — each step shows its `key` label and `done` boolean as filled/unfilled circle; "Continue building profile →" link to `/mentor/onboarding` if any step undone
    3. Upcoming sessions card: list `upcoming` with student name, scheduled time (`formatDateTime`), status badge; "View all" → `/mentor/sessions/booked`
    4. Quick actions card: "Manage availability" → `/mentor/availability`, "Group sessions" → `/dashboard/mentor/sessions`

  Use `Card`, `Badge`, `Button`, `Skeleton`, `EmptyState` components. Follow the existing 2-column grid layout pattern in the current `mentor-overview.tsx`.

  Files: `src/components/dashboard/mentor-overview.tsx`

  Verify: `npm run typecheck` — exits 0.

---

- [ ] 14. **Final build verification**

  Run both required checks from the project root `client/app/`:
  ```
  npx tsc --noEmit
  npx next build
  ```
  Both must exit 0. Fix any remaining type errors before marking complete.

  Files: no new files — fix-up pass only if needed.

  Verify: `npx tsc --noEmit` exits 0, then `npx next build` exits 0.

---

## Digest

| File | Block to change | Test / Verify |
|---|---|---|
| `src/lib/api/types.ts` | Add 7 new interfaces: `PayoutMethod`, `SocialPlatform`, `PricingMarketFull`, `ScholarshipOption`, `MentorMeDraft`, `MentorOnboardingProgress`, `MentorAuthPayload`, `MentorBookedSession`; augment `MentorOnboardingOptions` | `npm run typecheck` |
| `src/lib/api/auth.ts` | `registerMentor` return type → `MentorAuthPayload`; extract `verificationRequired` from envelope | `npm run typecheck` |
| `src/store/auth-store.ts` | Add `verificationRequired: boolean`; update `setAuth` signature; export `useVerificationRequired` selector | `npm run typecheck` |
| `src/hooks/use-auth-actions.ts` | `useRegisterMentor.onSuccess` wires `verificationRequired`; redirect to `/mentor/onboarding`; add `useResendVerification` | `npm run typecheck` |
| `src/lib/api/mentor-me.ts` | Add `getMentorMeDraft(): Promise<MentorMeDraft>` calling `GET /mentors/me` | `npm run typecheck` |
| `src/hooks/use-mentor-me.ts` | Add `useMentorMeDraft(enabled?)` | `npm run typecheck` |
| `src/hooks/query-keys.ts` | Add `mentorMeDraft: ["mentors", "me", "draft"]` | `npm run typecheck` |
| `src/lib/api/lookups.ts` | Expand `toMentorOnboardingOptions` to extract `sources`, `scholarships`, `helpTopics`, `services`, `pricingMarkets` (full shapes) | `npm run typecheck` |
| `src/app/(site)/mentor/register/layout.tsx` | CREATE — split-screen layout, no SiteHeader/SiteFooter | `npm run typecheck` |
| `src/app/(site)/mentor/register/page.tsx` | CREATE — form with fullName (2-word validation), email, password, confirmPassword, acceptTerms; calls `useRegisterMentor` | `npm run typecheck` |
| `src/app/(auth)/register/mentor/page.tsx` | DELETE | File must not exist |
| `src/components/layout/site-header.tsx` | Desktop right: add "Join as a mentor" → `/mentor/register` link (unauthenticated only); mobile drawer same | `npm run typecheck` |
| `src/app/(wizard)/layout.tsx` | CREATE — `<RequireAuth role="MENTOR">` wrapper | `npm run typecheck` |
| `src/app/(wizard)/mentor/onboarding/layout.tsx` | CREATE — bare `min-h-screen` wrapper | `npm run typecheck` |
| `src/app/(wizard)/mentor/onboarding/page.tsx` | CREATE — renders `<MentorWizard />` | `npm run typecheck` |
| `src/components/mentor-wizard/mentor-wizard.tsx` | CREATE — shell: `useMentorMeOnboarding`, step router, verification banner (`useVerificationRequired`), "Save & Exit" | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-01-source.tsx` | CREATE — single-select pill; `PUT /mentors/me/source` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-02-profile.tsx` | CREATE — photo crop, CV upload, name/nationality/sellingPoint; `PUT /mentors/me/profile`, `POST /mentors/me/photo`, `POST /mentors/me/cv` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-03-location.tsx` | CREATE — current + permanent address; `PUT /mentors/me/location` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-04-university.tsx` | CREATE — repeatable education cards; `PUT /mentors/me/educations/abroad`, `PUT /mentors/me/educations/background` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-05-scholarships.tsx` | CREATE — scholarship rows or "no scholarship"; `PUT /mentors/me/scholarships` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-06-expertise.tsx` | CREATE — topic tiles multi-select; `PUT /mentors/me/expertise` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-07-availability.tsx` | CREATE — weekly schedule rows, time chips, "Delete all" → `DELETE /mentors/me/availability`; `PUT /mentors/me/availability` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-08-pricing.tsx` | CREATE — market cards, "Use recommended", fee breakdown; `PUT /mentors/me/pricing` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-09-payout.tsx` | CREATE — method tiles, generated form, no prefill; `PUT /mentors/me/payout` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-10-social.tsx` | CREATE — platform rows, domain prefix, green tick; `PUT /mentors/me/social` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-11-preview.tsx` | CREATE — profile preview card, publish button, 403 EMAIL_NOT_VERIFIED banner; `POST /mentors/me/publish` | `npm run typecheck` |
| `src/components/mentor-wizard/steps/step-12-growth.tsx` | CREATE — social share checkbox, success state; `PUT /mentors/me/growth` | `npm run typecheck` |
| `src/components/layout/dashboard-shell.tsx` | Replace `MENTOR_NAV` array (5 entries), add sidebar footer profile-strength card using `useMentorMeOnboarding` | `npm run typecheck` |
| `src/app/(app)/mentor/sessions/booked/page.tsx` | CREATE — booked 1-on-1 sessions list; `GET /mentors/me/bookings` via `useMentorMeBookings()` | `npm run typecheck` |
| `src/components/dashboard/mentor-overview.tsx` | Full rewrite — stats row, wizard progress steps, upcoming sessions, quick actions; `GET /mentors/me/onboarding`, `GET /mentors/me/overview` | `npm run typecheck` |

**Build commands** (run from `client/app/`):
- Typecheck: `npm run typecheck` (alias for `npx tsc --noEmit`)
- Build: `npx next build`

**Tests passing today**: The project has no test suite configured (no `jest.config`, no `vitest.config`, no test files found). Verification is exclusively `tsc --noEmit` + `next build`.

**Known gap**: Turnstile CAPTCHA — the `package.json` has no `@marsidev/react-turnstile` or equivalent dependency. The register page should include a `{/* TODO: Turnstile — add @marsidev/react-turnstile and NEXT_PUBLIC_TURNSTILE_SITE_KEY */}` comment and skip actual rendering until the dependency is added. This is the only user-facing feature from the spec left intentionally incomplete.
