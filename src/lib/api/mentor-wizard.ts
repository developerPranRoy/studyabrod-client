import { api } from '@/lib/api/client';
import { isObj, num, str } from '@/lib/api/dto';
import type {
  ApiEnvelope,
  MentorMeAvailabilityInput,
  MentorMeExpertiseInput,
  MentorMeOnboarding,
  MentorMePricingInput,
  MentorMeProfileInput,
  MentorMeSourceInput,
} from '@/lib/api/types';

export async function getMentorMeOnboarding(): Promise<MentorMeOnboarding & { nextStep: number }> {
  const res = await api.get<ApiEnvelope<unknown>>('/mentors/me/onboarding');
  const r = isObj(res.data.data) ? res.data.data : {};
  return {
    strength: { percent: num(isObj(r.strength) ? r.strength.percent : r.strength) ?? 0 },
    nextStep: num(r.nextStep) ?? 1,
  };
}

export async function putMentorSource(input: MentorMeSourceInput): Promise<void> {
  await api.put('/mentors/me/source', input);
}

export async function putMentorProfile(input: MentorMeProfileInput): Promise<void> {
  await api.put('/mentors/me/profile', input);
}

export async function putMentorExpertise(input: MentorMeExpertiseInput): Promise<void> {
  await api.put('/mentors/me/expertise', input);
}

export async function putMentorAvailability(input: MentorMeAvailabilityInput): Promise<void> {
  await api.put('/mentors/me/availability', input);
}

export async function putMentorPricing(input: MentorMePricingInput): Promise<void> {
  await api.put('/mentors/me/pricing', input);
}

export async function getMentorPreview(): Promise<{
  slug: string | null;
  firstName?: string;
  lastName?: string;
  sellingPoint?: string;
  photoUrl?: string | null;
}> {
  const res = await api.get<ApiEnvelope<unknown>>('/mentors/me/preview');
  const r = isObj(res.data.data) ? res.data.data : {};
  return {
    slug: str(r.slug) ?? null,
    firstName: str(r.firstName) ?? str(r.first_name) ?? undefined,
    lastName: str(r.lastName) ?? str(r.last_name) ?? undefined,
    sellingPoint: str(r.sellingPoint) ?? str(r.selling_point) ?? undefined,
    photoUrl: str(r.photoUrl) ?? str(r.photo_url) ?? null,
  };
}

export async function publishMentor(): Promise<{ status: string; slug: string }> {
  const res = await api.post<ApiEnvelope<unknown>>('/mentors/me/publish');
  const r = isObj(res.data.data) ? res.data.data : {};
  return { status: str(r.status) ?? 'published', slug: str(r.slug) ?? '' };
}

export async function getMentorMeAvailability(): Promise<unknown> {
  const res = await api.get<ApiEnvelope<unknown>>('/mentors/me/availability');
  return res.data.data;
}

export async function getMentorPricingMarkets(): Promise<unknown> {
  const res = await api.get<ApiEnvelope<unknown>>('/lookups/pricing-markets');
  return res.data.data;
}
