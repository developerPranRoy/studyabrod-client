import { api } from "@/lib/api/client";
import { asArray, isObj, num, str, toMentor } from "@/lib/api/dto";
import type {
  ApiEnvelope,
  SavedMentor,
  StudentMe,
  StudentOverview,
  StudentScheduleItem,
} from "@/lib/api/types";

export async function getStudentMeOverview(): Promise<StudentOverview> {
  const res = await api.get<ApiEnvelope<unknown>>("/students/me/overview");
  const r = isObj(res.data.data) ? res.data.data : {};
  const counts = isObj(r.counts) ? r.counts : {};
  return { counts: { all: num(counts.all) ?? 0 } };
}

export async function getStudentMe(): Promise<StudentMe> {
  const res = await api.get<ApiEnvelope<unknown>>("/students/me");
  const r = isObj(res.data.data) ? res.data.data : {};
  return {
    firstName: str(r.firstName) ?? str(r.first_name) ?? "",
    lastName: str(r.lastName) ?? str(r.last_name) ?? "",
  };
}

export async function updateStudentMe(input: {
  firstName: string;
  lastName: string;
  onboarding: object;
}): Promise<void> {
  await api.put("/students/me", input);
}

export async function saveStudentTimezone(timezone: string): Promise<void> {
  await api.patch("/students/me/timezone", { timezone });
}

export async function getStudentSchedule(type?: string): Promise<StudentScheduleItem[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/students/me/schedule", {
    params: { type: type || undefined },
  });
  return asArray(res.data.data, (s) => s).map(toStudentScheduleItem);
}

export async function saveMentor(mentorId: number): Promise<void> {
  await api.put(`/students/me/saved-mentors/${mentorId}`);
}

export async function getSavedMentors(): Promise<SavedMentor[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/students/me/saved-mentors");
  return asArray(res.data.data, (m) => m).map((raw) => ({
    ...toMentor(raw),
    isSaved: Boolean(isObj(raw) && (raw.isSaved ?? raw.is_saved)),
  }));
}

export async function removeSavedMentor(mentorId: number): Promise<void> {
  await api.delete(`/students/me/saved-mentors/${mentorId}`);
}

function toStudentScheduleItem(raw: unknown): StudentScheduleItem {
  const r = isObj(raw) ? raw : {};
  return {
    id: num(r.id) ?? 0,
    type: str(r.type) ?? "GROUP",
    startsAt: str(r.startsAt) ?? str(r.starts_at) ?? "",
  };
}
