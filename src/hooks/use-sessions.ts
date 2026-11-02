"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSession,
  deleteSession,
  getSessions,
  registerForSession,
  unregisterFromSession,
  updateSession,
} from "@/lib/api/sessions";
import { qk } from "@/hooks/query-keys";
import type { GroupSessionPayload, SessionTab } from "@/lib/api/types";

export function useSessions(tab: SessionTab, category?: string) {
  return useQuery({
    queryKey: qk.sessions(tab, category),
    queryFn: () => getSessions({ tab, category }),
  });
}

function useInvalidateSessions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["sessions"] });
}

export function useRegisterForSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: (id: number) => registerForSession(id),
    onSuccess: () => {
      invalidate();
      toast.success("You're registered — see you there!");
    },
    onError: (error) => toast.error(error.message), // 409: already registered / closed
  });
}

export function useUnregisterFromSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: (id: number) => unregisterFromSession(id),
    onSuccess: () => {
      invalidate();
      toast.success("Registration removed");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: GroupSessionPayload }) =>
      id ? updateSession(id, payload) : createSession(payload),
    onSuccess: (_data, { id }) => {
      invalidate();
      toast.success(id ? "Session updated" : "Session created");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: (id: number) => deleteSession(id),
    onSuccess: () => {
      invalidate();
      toast.success("Session deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}
