"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMentorProfile,
  deleteMentorProfile,
  getMentor,
  getMentors,
  getMyMentorProfile,
  updateMentorProfile,
  uploadMentorCv,
  uploadMentorPhoto,
} from "@/lib/api/mentors";
import { qk } from "@/hooks/query-keys";
import type { MentorFilters, MentorProfilePayload } from "@/lib/api/types";

export function useMentors(filters: MentorFilters) {
  return useQuery({
    queryKey: qk.mentors(filters),
    queryFn: () => getMentors(filters),
    placeholderData: (previous) => previous, // smooth filter/pagination transitions
  });
}

export function useMentor(id: number | string) {
  return useQuery({ queryKey: qk.mentor(id), queryFn: () => getMentor(id), retry: 1 });
}

export function useMyMentorProfile(enabled: boolean) {
  return useQuery({
    queryKey: qk.myMentorProfile,
    queryFn: getMyMentorProfile,
    enabled,
    retry: (count, error) => {
      // 404 simply means "no profile yet" — the editor will create one.
      if ((error as { status?: number }).status === 404) return false;
      return count < 1;
    },
  });
}

function useProfileInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: qk.myMentorProfile });
    queryClient.invalidateQueries({ queryKey: ["mentors", "list"] });
  };
}

export function useSaveMentorProfile() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | null; payload: MentorProfilePayload }) =>
      id ? updateMentorProfile(id, payload) : createMentorProfile(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Profile saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteMentorProfile() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (id: number) => deleteMentorProfile(id),
    onSuccess: () => {
      invalidate();
      toast.success("Profile deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUploadMentorPhoto() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadMentorPhoto(id, file),
    onSuccess: () => {
      invalidate();
      toast.success("Photo updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUploadMentorCv() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadMentorCv(id, file),
    onSuccess: () => {
      invalidate();
      toast.success("CV uploaded");
    },
    onError: (error) => toast.error(error.message),
  });
}
