import { api } from "@/lib/api/client";
import { asArray, toSession } from "@/lib/api/dto";
import type { ApiEnvelope, GroupSession, GroupSessionPayload, SessionTab } from "@/lib/api/types";

export async function getSessions(input: {
  tab?: SessionTab;
  category?: string;
}): Promise<GroupSession[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/sessions", {
    params: { tab: input.tab, category: input.category || undefined },
  });
  return asArray(res.data.data, (s) => s).map(toSession);
}

/** Mentor's hosted group sessions (replaces GET /sessions/my for mentors). */
export async function getHostedSessions(): Promise<GroupSession[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/sessions/hosted");
  return asArray(res.data.data, (s) => s).map(toSession);
}

/** Student's registered group sessions. */
export async function getMySessions(): Promise<GroupSession[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/sessions/my");
  return asArray(res.data.data, (s) => s).map(toSession);
}

export async function getSession(id: number | string): Promise<GroupSession> {
  const res = await api.get<ApiEnvelope<unknown>>(`/sessions/${id}`);
  return toSession(res.data.data);
}

export async function registerForSession(id: number): Promise<void> {
  await api.post(`/sessions/${id}/register`);
}

export async function unregisterFromSession(id: number): Promise<void> {
  await api.delete(`/sessions/${id}/register`);
}

export async function createSession(payload: GroupSessionPayload): Promise<GroupSession> {
  const res = await api.post<ApiEnvelope<unknown>>("/sessions", payload);
  return toSession(res.data.data);
}

export async function updateSession(
  id: number,
  payload: GroupSessionPayload
): Promise<GroupSession> {
  const res = await api.put<ApiEnvelope<unknown>>(`/sessions/${id}`, payload);
  return toSession(res.data.data);
}

export async function deleteSession(id: number): Promise<void> {
  await api.delete(`/sessions/${id}`);
}
