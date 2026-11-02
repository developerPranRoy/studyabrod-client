import { api } from "@/lib/api/client";
import { asArray, isObj, num, str } from "@/lib/api/dto";
import type {
  ApiEnvelope,
  MentorMeAvailability,
  MentorMeAvailabilityInput,
  MentorMeBooking,
  MentorMeCalendarDay,
  MentorMeEducationItem,
  MentorMeExpertiseInput,
  MentorMeExperienceItem,
  MentorMeGrowthInput,
  MentorMeLocationInput,
  MentorMeOnboarding,
  MentorMeOverview,
  MentorMePayout,
  MentorMePayoutInput,
  MentorMePricingInput,
  MentorMePreview,
  MentorMeProfileInput,
  MentorMePublishResult,
  MentorMeScholarshipsInput,
  MentorMeSlot,
  MentorMeSlotInput,
  MentorMeSocialInput,
  MentorMeSourceInput,
} from "@/lib/api/types";

// ------------------------------------------------------------- reads ----

export async function getMentorMeOnboarding(): Promise<MentorMeOnboarding> {
  const res = await api.get<ApiEnvelope<unknown>>("/mentors/me/onboarding");
  const r = isObj(res.data.data) ? res.data.data : {};
  const strength = isObj(r.strength) ? r.strength : {};
  return { strength: { percent: num(strength.percent) ?? 0 } };
}

export async function getMentorMeOverview(): Promise<MentorMeOverview> {
  const res = await api.get<ApiEnvelope<unknown>>("/mentors/me/overview");
  const r = isObj(res.data.data) ? res.data.data : {};
  const stats = isObj(r.stats) ? r.stats : {};
  return {
    stats: { totalStudents: num(stats.totalStudents) ?? 0 },
    weeklyHours: asArray(r.weeklyHours, (w) => w),
    upcoming: asArray(r.upcoming, (u) => u),
  };
}

export async function getMentorMeAvailability(): Promise<MentorMeAvailability> {
  const res = await api.get<ApiEnvelope<unknown>>("/mentors/me/availability");
  const r = isObj(res.data.data) ? res.data.data : {};
  return {
    weekly: asArray(r.weekly, (w) => w),
    oneOff: asArray(r.oneOff, (s) => s).map(toMentorMeSlot),
  };
}

export async function getMentorMeCalendar(
  from: string,
  to: string
): Promise<MentorMeCalendarDay[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/mentors/me/availability/calendar", {
    params: { from, to },
  });
  return asArray(res.data.data, (d) => d).map(toMentorMeCalendarDay);
}

export async function getMentorMeBookings(
  from?: string,
  to?: string
): Promise<MentorMeBooking[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/mentors/me/bookings", {
    params: { from: from || undefined, to: to || undefined },
  });
  return asArray(res.data.data, (b) => b).map(toMentorMeBooking);
}

export async function getMentorMePayout(): Promise<MentorMePayout> {
  const res = await api.get<ApiEnvelope<unknown>>("/mentors/me/payout");
  const r = isObj(res.data.data) ? res.data.data : {};
  return { methodId: num(r.methodId) ?? num(r.method_id), hint: str(r.hint) };
}

export async function getMentorMePreview(): Promise<MentorMePreview> {
  const res = await api.get<ApiEnvelope<unknown>>("/mentors/me/preview");
  const r = isObj(res.data.data) ? res.data.data : {};
  return { pricing: asArray(r.pricing, (p) => p), slug: str(r.slug) };
}

// ------------------------------------------------------------- writes (wizard steps) ----

export async function saveMentorMeSource(input: MentorMeSourceInput): Promise<void> {
  await api.put("/mentors/me/source", input);
}

export async function saveMentorMeProfile(input: MentorMeProfileInput): Promise<void> {
  await api.put("/mentors/me/profile", input);
}

export async function uploadMentorMePhoto(file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  await api.post("/mentors/me/photo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function uploadMentorMeCv(file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  await api.post("/mentors/me/cv", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function saveMentorMeLocation(input: MentorMeLocationInput): Promise<void> {
  await api.put("/mentors/me/location", input);
}

export async function saveMentorMeEducationsAbroad(
  educations: MentorMeEducationItem[]
): Promise<void> {
  await api.put("/mentors/me/educations/abroad", { educations });
}

export async function saveMentorMeEducationsBackground(
  educations: MentorMeEducationItem[]
): Promise<void> {
  await api.put("/mentors/me/educations/background", { educations });
}

export async function saveMentorMeScholarships(input: MentorMeScholarshipsInput): Promise<void> {
  await api.put("/mentors/me/scholarships", input);
}

export async function saveMentorMeExpertise(input: MentorMeExpertiseInput): Promise<void> {
  await api.put("/mentors/me/expertise", input);
}

export async function saveMentorMeAvailability(input: MentorMeAvailabilityInput): Promise<void> {
  await api.put("/mentors/me/availability", input);
}

export async function addMentorMeSlot(input: MentorMeSlotInput): Promise<MentorMeSlot> {
  const res = await api.post<ApiEnvelope<unknown>>("/mentors/me/availability/slots", input);
  return toMentorMeSlot(res.data.data);
}

export async function deleteMentorMeSlot(slotId: number): Promise<void> {
  await api.delete(`/mentors/me/availability/slots/${slotId}`);
}

export async function saveMentorMeTimezone(timezone: string): Promise<void> {
  await api.patch("/mentors/me/timezone", { timezone });
}

export async function saveMentorMePricing(input: MentorMePricingInput): Promise<void> {
  await api.put("/mentors/me/pricing", input);
}

export async function saveMentorMePayout(input: MentorMePayoutInput): Promise<void> {
  await api.put("/mentors/me/payout", input);
}

export async function saveMentorMeSocial(input: MentorMeSocialInput): Promise<void> {
  await api.put("/mentors/me/social", input);
}

export async function publishMentorMe(): Promise<MentorMePublishResult> {
  const res = await api.post<ApiEnvelope<unknown>>("/mentors/me/publish");
  const r = isObj(res.data.data) ? res.data.data : {};
  return { status: str(r.status) ?? "DRAFT", slug: str(r.slug) ?? "" };
}

export async function saveMentorMeGrowth(input: MentorMeGrowthInput): Promise<void> {
  await api.put("/mentors/me/growth", input);
}

// ------------------------------------------------------------- writes (dashboard tab) ----

export async function saveMentorMeExperiences(
  experiences: MentorMeExperienceItem[]
): Promise<void> {
  await api.put("/mentors/me/experiences", { experiences });
}

// ------------------------------------------------------------- normalizers ----

function toMentorMeSlot(raw: unknown): MentorMeSlot {
  const r = isObj(raw) ? raw : {};
  return {
    id: num(r.id) ?? 0,
    date: str(r.date) ?? "",
    start: str(r.start) ?? str(r.startsAt) ?? "",
    end: str(r.end) ?? str(r.endsAt) ?? "",
  };
}

function toMentorMeCalendarDay(raw: unknown): MentorMeCalendarDay {
  const r = isObj(raw) ? raw : {};
  return { date: str(r.date) ?? "", status: str(r.status) ?? "" };
}

function toMentorMeBooking(raw: unknown): MentorMeBooking {
  const r = isObj(raw) ? raw : {};
  const student = isObj(r.student) ? r.student : isObj(r.studentUser) ? r.studentUser : null;
  return {
    id: num(r.id) ?? 0,
    scheduledAt: str(r.scheduledAt) ?? str(r.scheduled_at) ?? "",
    status: str(r.status) ?? "PENDING",
    studentName:
      str(r.studentName) ?? (student ? str(student.fullName) : null) ?? "Student",
  };
}
