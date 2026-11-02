import { api } from "@/lib/api/client";
import {
  asArray,
  toCountry,
  toPricingMarket,
  toProgram,
  toScholarship,
  toService,
  toSessionCategory,
  toUniversityNames,
} from "@/lib/api/dto";
import type {
  ApiEnvelope,
  Country,
  MentorOnboardingOptions,
  OnboardingOptions,
  PricingMarket,
  Program,
  Scholarship,
  Service,
  SessionCategory,
} from "@/lib/api/types";

export async function getCountries(): Promise<Country[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/lookups/countries");
  return asArray(res.data.data, (c) => c)
    .map(toCountry)
    .filter((c): c is Country => c !== null);
}

export async function getCountry(slug: string): Promise<Country> {
  const res = await api.get<ApiEnvelope<unknown>>(`/lookups/countries/${encodeURIComponent(slug)}`);
  const country = toCountry(res.data.data);
  if (!country) throw new Error("Country not found");
  return country;
}

export async function getPrograms(): Promise<Program[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/lookups/programs");
  return asArray(res.data.data, (p) => p)
    .map(toProgram)
    .filter((p): p is Program => p !== null);
}

export async function getScholarships(): Promise<Scholarship[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/lookups/scholarships");
  return asArray(res.data.data, (s) => s)
    .map(toScholarship)
    .filter((s): s is Scholarship => s !== null);
}

export async function getScholarship(slug: string): Promise<Scholarship> {
  const res = await api.get<ApiEnvelope<unknown>>(
    `/lookups/scholarships/${encodeURIComponent(slug)}`
  );
  const scholarship = toScholarship(res.data.data);
  if (!scholarship) throw new Error("Scholarship not found");
  return scholarship;
}

/** University list for a country — powered by the real universities API via the backend. */
export async function getUniversities(countryId: number): Promise<string[]> {
  const res = await api.get<ApiEnvelope<unknown>>("/lookups/universities", {
    params: { countryId },
  });
  return toUniversityNames(res.data.data);
}

/** Student onboarding options: programs, fields, regions, budget ranges, funding needs, help topics, sources. */
export async function getOnboardingOptions(): Promise<OnboardingOptions> {
  const res = await api.get<ApiEnvelope<unknown>>("/lookups/onboarding-options");
  return toOnboardingOptions(res.data.data);
}

/** Mentor wizard options: education statuses, programs, social platforms, payout methods. */
export async function getMentorOnboardingOptions(): Promise<MentorOnboardingOptions> {
  const res = await api.get<ApiEnvelope<unknown>>("/lookups/mentor-onboarding-options");
  return toMentorOnboardingOptions(res.data.data);
}

/** BDT / USD pricing markets with their recommended prices. */
export async function getPricingMarkets(): Promise<PricingMarket[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/lookups/pricing-markets");
  return asArray(res.data.data, (m) => m)
    .map(toPricingMarket)
    .filter((m): m is PricingMarket => m !== null);
}

/** Bookable services (the 20 / 40 minute calls) with their duration. */
export async function getServices(): Promise<Service[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/lookups/services");
  return asArray(res.data.data, (s) => s)
    .map(toService)
    .filter((s): s is Service => s !== null);
}

/** Group-session categories. */
export async function getSessionCategories(): Promise<SessionCategory[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/lookups/session-categories");
  return asArray(res.data.data, (c) => c)
    .map(toSessionCategory)
    .filter((c): c is SessionCategory => c !== null);
}

/** IANA timezone names. */
export async function getTimezones(): Promise<string[]> {
  const res = await api.get<ApiEnvelope<unknown>>("/lookups/timezones");
  return toTimezoneNames(res.data.data);
}

/** All countries of the world (not just those with mentors). */
export async function getAllCountries(): Promise<Country[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/lookups/countries", {
    params: { all: true },
  });
  return asArray(res.data.data, (c) => c)
    .map(toCountry)
    .filter((c): c is Country => c !== null);
}

// --- option-bundle normalizers (reference tables share the { id, name, slug } shape) ---
const toOptionArray = (raw: unknown): Program[] =>
  asArray(raw, (o) => o)
    .map(toProgram)
    .filter((p): p is Program => p !== null);

function toOnboardingOptions(raw: unknown): OnboardingOptions {
  const r = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    programs: toOptionArray(r.programs),
    fields: toOptionArray(r.fields),
    regions: toOptionArray(r.regions),
    budgetRanges: toOptionArray(r.budgetRanges),
    fundingNeeds: toOptionArray(r.fundingNeeds),
    helpTopics: toOptionArray(r.helpTopics),
    sources: toOptionArray(r.sources),
  };
}

function toMentorOnboardingOptions(raw: unknown): MentorOnboardingOptions {
  const r = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    educationStatuses: toOptionArray(r.educationStatuses),
    programs: toOptionArray(r.programs),
    socialPlatforms: toOptionArray(r.socialPlatforms),
    payoutMethods: toOptionArray(r.payoutMethods),
  };
}

/** Countries filtered by region IDs — optionally only those with mentors. */
export async function getCountriesByRegion(regionIds: number[], withMentors?: boolean): Promise<Country[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>('/lookups/countries', {
    params: { regionIds: regionIds.join(','), withMentors: withMentors ? 'true' : undefined },
  });
  return asArray(res.data.data, (c) => c).map(toCountry).filter((c): c is Country => c !== null);
}

function toTimezoneNames(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === "string");
  }
  // Some APIs return [{ id, name }] — fall back to the name.
  return asArray(raw, (t) => t)
    .map((t) => (typeof t.name === "string" ? t.name : null))
    .filter((v): v is string => Boolean(v));
}
