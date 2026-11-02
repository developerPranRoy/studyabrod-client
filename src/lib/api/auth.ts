import { api } from "@/lib/api/client";
import { toUser } from "@/lib/api/dto";
import type { ApiEnvelope, AuthPayload, User } from "@/lib/api/types";

interface RawAuthData {
  token: string;
  user?: unknown;
}

function toAuthPayload(raw: RawAuthData): AuthPayload {
  return { token: raw.token, user: toUser(raw.user) };
}

export async function login(input: { email: string; password: string }): Promise<AuthPayload> {
  const res = await api.post<ApiEnvelope<RawAuthData>>("/auth/login", input);
  return toAuthPayload(res.data.data);
}

export interface RegisterResponse {
  email: string;
  verificationRequired: boolean;
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: true;
  onboarding: object;
}): Promise<RegisterResponse> {
  const res = await api.post<ApiEnvelope<{ email: string; verificationRequired: boolean }>>("/auth/register", input);
  return {
    email: (res.data.data?.email as string) ?? "",
    verificationRequired: Boolean(res.data.data?.verificationRequired),
  };
}

export async function getMe(): Promise<User> {
  const res = await api.get<ApiEnvelope<unknown>>("/auth/me");
  return toUser(res.data.data);
}

/**
 * Mentor sign-up — creates the account and an empty draft profile, then sends a
 * verification email. Unlike student registration, it returns a login token straight
 * away so the wizard can begin before the email is verified (publishing still needs it).
 */
export async function registerMentor(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: true;
}): Promise<AuthPayload> {
  const res = await api.post<ApiEnvelope<RawAuthData>>("/auth/register/mentor", input);
  return toAuthPayload(res.data.data);
}

/** Google Sign-In — sends the Google ID token to the server for verification. */
export async function loginWithGoogle(input: { idToken: string }): Promise<AuthPayload> {
  const res = await api.post<ApiEnvelope<RawAuthData>>("/auth/google", {
    idToken: input.idToken,
    onboarding: {
      programId: 1,
      fieldIds: [1],
      regionIds: [1],
      countryIds: [],
      countriesOther: true,
      budgetRangeId: 1,
      fundingNeedId: 1,
      workWhileStudying: false,
      stayAfterStudy: "NOT_ESSENTIAL",
      ielts: { taken: false },
      applyMode: "SELF",
      helpTopicIds: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      sourceId: 1,
    },
  });
  return toAuthPayload(res.data.data);
}

export async function forgotPassword(input: { email: string }): Promise<void> {
  await api.post('/auth/forgot-password', input);
}

export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  await api.post('/auth/reset-password', input);
}

export async function resendVerification(input: { email: string }): Promise<void> {
  await api.post('/auth/resend-verification', input);
}
