/** API envelope + shared domain types for the AbroadMates Web API. */

export type Role = "STUDENT" | "MENTOR";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface Country {
  id: number;
  name: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  mentorCount?: number | null;
}

export interface Program {
  id: number;
  name: string;
  slug: string;
}

export interface Scholarship {
  id: number;
  name: string;
  slug: string;
  title?: string | null;
  description?: string | null;
  countryName?: string | null;
}

export interface MentorPlan {
  id: number;
  durationMin: number;
  price: number;
}

export interface Mentor {
  id: number;
  fullName: string;
  headline: string | null;
  bio: string | null;
  photoUrl: string | null;
  cvUrl: string | null;
  universityName: string | null;
  country: Country | null;
  program: Program | null;
  scholarship: Scholarship | null;
  plans: MentorPlan[];
  rating: number | null;
  totalSessions: number;
}

export type MentorSort = "top_rated" | "most_sessions" | "price_asc";

export interface MentorFilters {
  country?: string;
  program?: string;
  service?: string; // plan duration, e.g. "20" | "40"
  scholarship?: string;
  search?: string;
  sort?: MentorSort;
  page?: number;
  limit?: number;
}

export interface MentorListResult {
  items: Mentor[];
  meta: PaginationMeta;
}

/** Master-detail payload: mentor profile (master) + plans (detail). */
export interface MentorProfilePayload {
  headline: string;
  bio: string;
  countryId: number;
  universityName: string;
  programId: number;
  scholarshipId: number | null;
  plans: Array<{ durationMin: number; price: number }>;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | string;

export interface Booking {
  id: number;
  scheduledAt: string;
  status: BookingStatus;
  durationMin: number | null;
  price: number | null;
  mentorId: number | null;
  mentorName: string;
  mentorPhotoUrl: string | null;
  mentorHeadline: string | null;
}

export type SessionTab = "all" | "upcoming" | "past";

export interface GroupSession {
  id: number;
  title: string;
  description: string | null;
  category: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  hostName: string | null;
  registeredCount: number;
  capacity: number | null;
  isRegistered: boolean;
}

export interface GroupSessionPayload {
  title: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt: string;
  location: string;
}

// --------------------------------------------------------------- lookups ----

/** A bookable call type, e.g. the 20 / 40 minute services. */
export interface Service {
  id: number;
  name: string;
  slug: string;
  durationMin: number;
}

export interface SessionCategory {
  id: number;
  name: string;
  slug: string;
}

/** A pricing market (BDT / USD) with its recommended prices. */
export interface PricingMarket {
  id: number;
  name: string;
  currency: string | null;
}

/** Reference-table option — programs, regions, budget ranges, etc. all share this shape. */
export interface OnboardingOptions {
  programs: Program[];
  fields: Program[];
  regions: Program[];
  budgetRanges: Program[];
  fundingNeeds: Program[];
  helpTopics: Program[];
  sources: Program[];
}

export interface MentorOnboardingOptions {
  educationStatuses: Program[];
  programs: Program[];
  socialPlatforms: Program[];
  payoutMethods: Program[];
}

// ------------------------------------------------ mentor wizard & dashboard ----
// /mentors/me/... — the 12-step wizard plus the dashboard read models.

export interface MentorMeOnboarding {
  /** Wizard progress + profile strength. */
  status: "DRAFT" | "LIVE";
  nextStep: string | null;
  steps: { key: string; done: boolean }[];
  strength: { percent: number; done: number; total: number };
}

export interface MentorMeOverview {
  /** Dashboard overview: aggregate stats, upcoming sessions, weekly hours. */
  stats: { totalStudents: number };
  weeklyHours: unknown[];
  upcoming: unknown[];
}

export interface MentorMeAvailability {
  weekly: unknown[];
  oneOff: MentorMeSlot[];
}

export interface MentorMeCalendarDay {
  date: string;
  status: string;
}

export interface MentorMeSlot {
  id: number;
  date: string;
  start: string;
  end: string;
}

export interface MentorMeBooking {
  id: number;
  scheduledAt: string;
  status: string;
  studentName: string;
}

export interface MentorMePayout {
  methodId: number | null;
  hint: string | null;
}

export interface MentorMePreview {
  pricing: unknown[];
  slug: string | null;
}

export interface MentorMePublishResult {
  status: string;
  slug: string;
}

// Wizard step payloads (match the Postman collection request bodies).
export interface MentorMeSourceInput {
  sourceId: number;
}

export interface MentorMeProfileInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  nationalityId?: number;
  phone?: string;
  sellingPoint?: string;
  photoCrop?: { zoom?: number; x?: number; y?: number };
}

export interface MentorMeLocationInput {
  current: { street?: string; city?: string; countryId: number };
  permanent: { sameAsCurrent?: boolean; street?: string; city?: string; countryId?: number };
}

export interface MentorMeEducationItem {
  universityName: string;
  countryId: number;
  statusId: number;
  programId: number;
  fieldOfStudy?: string;
  admissionYear?: number;
  city?: string;
  scholarshipNote?: string;
  graduationYear?: number;
}

export interface MentorMeScholarshipProgram {
  scholarshipId: number;
  outcome: string;
}

export interface MentorMeScholarshipsInput {
  noScholarshipProgram: boolean;
  programs: MentorMeScholarshipProgram[];
}

export interface MentorMeExpertiseInput {
  helpTopicIds: number[];
}

export interface MentorMeAvailabilityRange {
  start: string;
  end: string;
}

export interface MentorMeWeeklySlot {
  weekday: number;
  ranges: MentorMeAvailabilityRange[];
}

export interface MentorMeAvailabilityInput {
  timezone: string;
  weekly: MentorMeWeeklySlot[];
  availableUntil: string | null;
}

export interface MentorMePricingPrice {
  marketId: number;
  serviceId: number;
  price: number;
}

export interface MentorMePricingInput {
  prices: MentorMePricingPrice[];
}

export interface MentorMePayoutInput {
  methodId: number;
  details: Record<string, unknown>;
  confirmed: boolean;
}

export interface MentorMeSocialLink {
  platformId: number;
  url: string;
}

export interface MentorMeSocialInput {
  links: MentorMeSocialLink[];
}

export interface MentorMeGrowthInput {
  sharedOnSocial: boolean;
}

export interface MentorMeExperienceItem {
  kind: string;
  title: string;
  organization?: string;
  startYear: number;
  endYear?: number;
}

export interface MentorMeSlotInput {
  date: string;
  start: string;
  end: string;
}

// -------------------------------------------------------- student dashboard ----
// /students/me/... — student overview, profile, schedule and saved mentors.

export interface StudentOverview {
  counts: { all: number };
}

export interface StudentMe {
  firstName: string;
  lastName: string;
}

export interface StudentScheduleItem {
  id: number;
  type: string;
  startsAt: string;
}

export interface SavedMentor extends Mentor {
  isSaved: boolean;
}
