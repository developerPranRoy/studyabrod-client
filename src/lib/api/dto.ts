/**
 * DTO normalizers — map the backend's JSON into stable frontend types.
 * The helpers tolerate small shape differences (nested `user`, snake_case,
 * alternate key names) so the UI never breaks on harmless variations.
 */
import type {
  Booking,
  Country,
  GroupSession,
  Mentor,
  MentorPlan,
  PaginationMeta,
  PricingMarket,
  Program,
  Scholarship,
  Service,
  SessionCategory,
  User,
} from "@/lib/api/types";

type Raw = Record<string, unknown>;

export const isObj = (v: unknown): v is Raw => typeof v === "object" && v !== null;
export const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
export const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
};

export const asArray = <T>(v: unknown, map: (item: Raw) => T): T[] =>
  Array.isArray(v) ? v.filter(isObj).map(map) : [];

export function toUser(raw: unknown): User {
  const r = isObj(raw) ? raw : {};
  return {
    id: num(r.id) ?? 0,
    fullName:
      str(r.fullName) ??
      str(r.full_name) ??
      ((str(r.firstName) || str(r.lastName))
        ? `${str(r.firstName) ?? ""} ${str(r.lastName) ?? ""}`.trim()
        : null) ??
      str(r.firstName) ??
      str(r.name) ??
      "",
    email: str(r.email) ?? "",
    role: str(r.role) === "MENTOR" ? "MENTOR" : "STUDENT",
  };
}

export function toCountry(raw: unknown): Country | null {
  if (!isObj(raw)) return null;
  return {
    id: num(raw.id) ?? 0,
    name: str(raw.name) ?? "",
    slug: str(raw.slug) ?? "",
    title: str(raw.title),
    description: str(raw.description),
    mentorCount: num(raw.mentorCount) ?? num(raw.mentor_count),
  };
}

export function toProgram(raw: unknown): Program | null {
  if (!isObj(raw)) return null;
  return { id: num(raw.id) ?? 0, name: str(raw.name) ?? "", slug: str(raw.slug) ?? "" };
}

export function toScholarship(raw: unknown): Scholarship | null {
  if (!isObj(raw)) return null;
  return {
    id: num(raw.id) ?? 0,
    name: str(raw.name) ?? "",
    slug: str(raw.slug) ?? "",
    title: str(raw.title),
    description: str(raw.description),
    countryName: str(raw.countryName) ?? str(raw.country_name),
  };
}

export function toPlan(raw: unknown): MentorPlan | null {
  if (!isObj(raw)) return null;
  const durationMin = num(raw.durationMin) ?? num(raw.duration_min) ?? num(raw.duration);
  const price = num(raw.price);
  if (durationMin == null || price == null) return null;
  return { id: num(raw.id) ?? 0, durationMin, price };
}

/** Universities endpoint may return `["MIT", …]` or `[{ name: "MIT" }, …]`. */
export function toUniversityNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item : isObj(item) ? str(item.name) : null))
    .filter((v): v is string => Boolean(v));
}

export function toMentor(raw: unknown): Mentor {
  const r = isObj(raw) ? raw : {};
  const user = isObj(r.user) ? r.user : null;

  const country =
    toCountry(r.country) ??
    (num(r.countryId) != null || str(r.countryName)
      ? {
          id: num(r.countryId) ?? 0,
          name: str(r.countryName) ?? "",
          slug: str(r.countrySlug) ?? "",
        }
      : null);
  const program =
    toProgram(r.program) ??
    (num(r.programId) != null
      ? { id: num(r.programId) ?? 0, name: str(r.programName) ?? "", slug: str(r.programSlug) ?? "" }
      : null);
  const scholarship =
    toScholarship(r.scholarship) ??
    (num(r.scholarshipId) != null
      ? {
          id: num(r.scholarshipId) ?? 0,
          name: str(r.scholarshipName) ?? "",
          slug: str(r.scholarshipSlug) ?? "",
        }
      : null);

  const plans = asArray(r.plans, (p) => p).map(toPlan).filter((p): p is MentorPlan => p !== null);

  return {
    id: num(r.id) ?? 0,
    fullName: str(r.fullName) ?? (user ? str(user.fullName) : null) ?? "Mentor",
    headline: str(r.headline),
    bio: str(r.bio),
    photoUrl:
      str(r.photoUrl) ?? str(r.photo_url) ?? str(r.photo) ?? (user ? str(user.photoUrl) : null),
    cvUrl: str(r.cvUrl) ?? str(r.cv_url),
    universityName: str(r.universityName) ?? str(r.university_name) ?? str(r.university),
    country,
    program,
    scholarship,
    plans,
    rating: num(r.rating) ?? num(r.avgRating) ?? num(r.avg_rating),
    totalSessions: num(r.totalSessions) ?? num(r.total_sessions) ?? num(r.sessionsCount) ?? 0,
  };
}

export function toMeta(raw: unknown, fallbackCount: number): PaginationMeta {
  const r = isObj(raw) ? raw : {};
  const page = num(r.page) ?? 1;
  const limit = (num(r.limit) ?? fallbackCount) || 12;
  const total = num(r.total) ?? fallbackCount;
  return {
    page,
    limit,
    total,
    totalPages: num(r.totalPages) ?? Math.max(1, Math.ceil(total / limit)),
  };
}

export function toBooking(raw: unknown): Booking {
  const r = isObj(raw) ? raw : {};
  const plan = isObj(r.plan) ? r.plan : null;
  const mentor = isObj(r.mentor) ? r.mentor : null;
  const mentorUser = mentor && isObj(mentor.user) ? (mentor.user as Raw) : null;
  return {
    id: num(r.id) ?? 0,
    scheduledAt: str(r.scheduledAt) ?? str(r.scheduled_at) ?? "",
    status: (str(r.status) ?? "PENDING").toUpperCase(),
    durationMin: num(r.durationMin) ?? (plan ? num(plan.durationMin) ?? num(plan.duration_min) : null),
    price: num(r.price) ?? (plan ? num(plan.price) : null),
    mentorId: num(r.mentorId) ?? (mentor ? num(mentor.id) : null),
    mentorName:
      str(r.mentorName) ??
      (mentor ? str(mentor.fullName) : null) ??
      (mentorUser ? str(mentorUser.fullName) : null) ??
      "Mentor",
    mentorPhotoUrl:
      str(r.mentorPhotoUrl) ?? (mentor ? str(mentor.photoUrl) : null),
    mentorHeadline: str(r.mentorHeadline) ?? (mentor ? str(mentor.headline) : null),
  };
}

export function toSession(raw: unknown): GroupSession {
  const r = isObj(raw) ? raw : {};
  const host = isObj(r.host) ? r.host : isObj(r.mentor) ? (r.mentor as Raw) : null;
  const hostUser = host && isObj(host.user) ? (host.user as Raw) : null;
  return {
    id: num(r.id) ?? 0,
    title: str(r.title) ?? "Session",
    description: str(r.description),
    category: (str(r.category) ?? "GENERAL").toUpperCase(),
    startsAt: str(r.startsAt) ?? str(r.starts_at) ?? "",
    endsAt: str(r.endsAt) ?? str(r.ends_at),
    location: str(r.location),
    hostName:
      str(r.hostName) ?? (host ? str(host.fullName) : null) ?? (hostUser ? str(hostUser.fullName) : null),
    registeredCount: num(r.registeredCount) ?? num(r.registered_count) ?? num(r.attendees) ?? 0,
    capacity: num(r.capacity),
    isRegistered: Boolean(r.isRegistered ?? r.is_registered ?? r.registered),
  };
}

// ------------------------------------------------- lookups: services / categories / markets ----
export function toService(raw: unknown): Service | null {
  if (!isObj(raw)) return null;
  const id = num(raw.id);
  if (id == null) return null;
  return {
    id,
    name: str(raw.name) ?? "",
    slug: str(raw.slug) ?? "",
    durationMin: num(raw.durationMin) ?? num(raw.duration_min) ?? 0,
  };
}

export function toSessionCategory(raw: unknown): SessionCategory | null {
  if (!isObj(raw)) return null;
  const id = num(raw.id);
  if (id == null) return null;
  return { id, name: str(raw.name) ?? "", slug: str(raw.slug) ?? "" };
}

export function toPricingMarket(raw: unknown): PricingMarket | null {
  if (!isObj(raw)) return null;
  const id = num(raw.id);
  if (id == null) return null;
  return { id, name: str(raw.name) ?? "", currency: str(raw.currency) };
}
