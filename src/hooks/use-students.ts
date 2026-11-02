"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSavedMentors,
  getStudentMe,
  getStudentMeOverview,
  getStudentSchedule,
  removeSavedMentor,
  saveMentor,
  saveStudentTimezone,
  updateStudentMe,
} from "@/lib/api/students";
import { qk } from "@/hooks/query-keys";

// ------------------------------------------------------------ queries ----

export function useStudentOverview(enabled = true) {
  return useQuery({ queryKey: qk.studentOverview, queryFn: getStudentMeOverview, enabled });
}

export function useStudentMe(enabled = true) {
  return useQuery({ queryKey: qk.studentMe, queryFn: getStudentMe, enabled });
}

export function useStudentSchedule(type?: string, enabled = true) {
  return useQuery({
    queryKey: qk.studentSchedule(type),
    queryFn: () => getStudentSchedule(type),
    enabled,
  });
}

export function useSavedMentors(enabled = true) {
  return useQuery({ queryKey: qk.savedMentors, queryFn: getSavedMentors, enabled });
}

// ------------------------------------------------------------ mutations ----

export function useUpdateStudentMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { firstName: string; lastName: string; onboarding: object }) =>
      updateStudentMe(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "me"] });
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveStudentTimezone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timezone: string) => saveStudentTimezone(timezone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", "me"] });
      toast.success("Time zone updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: number) => saveMentor(mentorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.savedMentors });
      toast.success("Mentor saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRemoveSavedMentor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: number) => removeSavedMentor(mentorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.savedMentors });
      toast.success("Mentor removed");
    },
    onError: (error) => toast.error(error.message),
  });
}
