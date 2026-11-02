import { api, API_URL } from "@/lib/api/client";
import { asArray, toMentor, toMeta } from "@/lib/api/dto";
import type {
  ApiEnvelope,
  Mentor,
  MentorFilters,
  MentorListResult,
  MentorProfilePayload,
} from "@/lib/api/types";

/** Reads are served by the backend's stored-procedure layer. */
export async function getMentors(filters: MentorFilters = {}): Promise<MentorListResult> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/mentors", {
    params: {
      country: filters.country || undefined,
      program: filters.program || undefined,
      service: filters.service || undefined,
      scholarship: filters.scholarship || undefined,
      search: filters.search || undefined,
      sort: filters.sort || undefined,
      page: filters.page ?? 1,
      limit: filters.limit ?? 12,
    },
  });
  const items = asArray(res.data.data, (m) => m).map(toMentor);
  return { items, meta: toMeta(res.data.meta, items.length) };
}

export async function getMentor(id: number | string): Promise<Mentor> {
  const res = await api.get<ApiEnvelope<unknown>>(`/mentors/${id}`);
  return toMentor(res.data.data);
}

/** Current mentor's own profile (master + plan details). */
export async function getMyMentorProfile(): Promise<Mentor> {
  const res = await api.get<ApiEnvelope<unknown>>("/mentors/me");
  return toMentor(res.data.data);
}

export async function createMentorProfile(payload: MentorProfilePayload): Promise<Mentor> {
  const res = await api.post<ApiEnvelope<unknown>>("/mentors", payload);
  return toMentor(res.data.data);
}

export async function updateMentorProfile(
  id: number,
  payload: MentorProfilePayload
): Promise<Mentor> {
  const res = await api.put<ApiEnvelope<unknown>>(`/mentors/${id}`, payload);
  return toMentor(res.data.data);
}

export async function deleteMentorProfile(id: number): Promise<void> {
  await api.delete(`/mentors/${id}`);
}

async function uploadMentorFile(id: number, kind: "photo" | "cv", file: File): Promise<Mentor> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post<ApiEnvelope<unknown>>(`/mentors/${id}/${kind}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return toMentor(res.data.data);
}

export const uploadMentorPhoto = (id: number, file: File) => uploadMentorFile(id, "photo", file);
export const uploadMentorCv = (id: number, file: File) => uploadMentorFile(id, "cv", file);

/** Authenticated file URLs (CV download, exports) used by the download helper. */
export const mentorCvUrl = (id: number) => `${API_URL}/mentors/${id}/cv`;
export const mentorsExportUrl = (format: "excel" | "pdf", filters?: MentorFilters) => {
  const params = new URLSearchParams();
  if (filters?.country) params.set("country", filters.country);
  if (filters?.program) params.set("program", filters.program);
  if (filters?.service) params.set("service", filters.service);
  if (filters?.scholarship) params.set("scholarship", filters.scholarship);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.sort) params.set("sort", filters.sort);
  const qs = params.toString();
  return `${API_URL}/mentors/export/${format}${qs ? `?${qs}` : ""}`;
};
