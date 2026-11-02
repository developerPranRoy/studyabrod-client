"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addMentorMeSlot,
  deleteMentorMeSlot,
  getMentorMeAvailability,
  getMentorMeBookings,
  getMentorMeCalendar,
  getMentorMeOnboarding,
  getMentorMeOverview,
  getMentorMePayout,
  getMentorMePreview,
  publishMentorMe,
  saveMentorMeAvailability,
  saveMentorMeEducationsAbroad,
  saveMentorMeEducationsBackground,
  saveMentorMeExpertise,
  saveMentorMeExperiences,
  saveMentorMeGrowth,
  saveMentorMeLocation,
  saveMentorMePayout,
  saveMentorMePricing,
  saveMentorMeProfile,
  saveMentorMeScholarships,
  saveMentorMeSocial,
  saveMentorMeSource,
  saveMentorMeTimezone,
  uploadMentorMeCv,
  uploadMentorMePhoto,
} from "@/lib/api/mentor-me";
import { qk } from "@/hooks/query-keys";
import type {
  MentorMeAvailabilityInput,
  MentorMeEducationItem,
  MentorMeExpertiseInput,
  MentorMeExperienceItem,
  MentorMeGrowthInput,
  MentorMeLocationInput,
  MentorMePayoutInput,
  MentorMePricingInput,
  MentorMeProfileInput,
  MentorMeScholarshipsInput,
  MentorMeSlotInput,
  MentorMeSocialInput,
  MentorMeSourceInput,
} from "@/lib/api/types";

// ------------------------------------------------------------ queries ----

export function useMentorMeOnboarding(enabled = true) {
  return useQuery({ queryKey: qk.mentorMeOnboarding, queryFn: getMentorMeOnboarding, enabled });
}

export function useMentorMeOverview(enabled = true) {
  return useQuery({ queryKey: qk.mentorMeOverview, queryFn: getMentorMeOverview, enabled });
}

export function useMentorMeAvailability(enabled = true) {
  return useQuery({ queryKey: qk.mentorMeAvailability, queryFn: getMentorMeAvailability, enabled });
}

export function useMentorMeCalendar(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: qk.mentorMeCalendar(from, to),
    queryFn: () => getMentorMeCalendar(from, to),
    enabled: enabled && Boolean(from) && Boolean(to),
  });
}

export function useMentorMeBookings(from?: string, to?: string, enabled = true) {
  return useQuery({
    queryKey: qk.mentorMeBookings,
    queryFn: () => getMentorMeBookings(from, to),
    enabled,
  });
}

export function useMentorMePayout(enabled = true) {
  return useQuery({ queryKey: qk.mentorMePayout, queryFn: getMentorMePayout, enabled });
}

export function useMentorMePreview(enabled = true) {
  return useQuery({ queryKey: qk.mentorMePreview, queryFn: getMentorMePreview, enabled });
}

// ------------------------------------------------------------ helpers ----

/** Invalidate every mentor wizard/dashboard cache so progress + stats refresh after a save. */
function useInvalidateMentorMe() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["mentors", "me"] });
}

// ------------------------------------------------------------ mutations (wizard steps) ----

export function useSaveMentorMeSource() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeSourceInput) => saveMentorMeSource(input),
    onSuccess: () => {
      invalidate();
      toast.success("Saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeProfile() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeProfileInput) => saveMentorMeProfile(input),
    onSuccess: () => {
      invalidate();
      toast.success("Profile saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUploadMentorMePhoto() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (file: File) => uploadMentorMePhoto(file),
    onSuccess: () => {
      invalidate();
      toast.success("Photo updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUploadMentorMeCv() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (file: File) => uploadMentorMeCv(file),
    onSuccess: () => {
      invalidate();
      toast.success("CV uploaded");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeLocation() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeLocationInput) => saveMentorMeLocation(input),
    onSuccess: () => {
      invalidate();
      toast.success("Location saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeEducationsAbroad() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (educations: MentorMeEducationItem[]) => saveMentorMeEducationsAbroad(educations),
    onSuccess: () => {
      invalidate();
      toast.success("Education saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeEducationsBackground() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (educations: MentorMeEducationItem[]) =>
      saveMentorMeEducationsBackground(educations),
    onSuccess: () => {
      invalidate();
      toast.success("Background saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeScholarships() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeScholarshipsInput) => saveMentorMeScholarships(input),
    onSuccess: () => {
      invalidate();
      toast.success("Scholarships saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeExpertise() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeExpertiseInput) => saveMentorMeExpertise(input),
    onSuccess: () => {
      invalidate();
      toast.success("Expertise saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeAvailability() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeAvailabilityInput) => saveMentorMeAvailability(input),
    onSuccess: () => {
      invalidate();
      toast.success("Availability saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useAddMentorMeSlot() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeSlotInput) => addMentorMeSlot(input),
    onSuccess: () => {
      invalidate();
      toast.success("Slot added");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteMentorMeSlot() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (slotId: number) => deleteMentorMeSlot(slotId),
    onSuccess: () => {
      invalidate();
      toast.success("Slot removed");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeTimezone() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (timezone: string) => saveMentorMeTimezone(timezone),
    onSuccess: () => {
      invalidate();
      toast.success("Time zone updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMePricing() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMePricingInput) => saveMentorMePricing(input),
    onSuccess: () => {
      invalidate();
      toast.success("Pricing saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMePayout() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMePayoutInput) => saveMentorMePayout(input),
    onSuccess: () => {
      invalidate();
      toast.success("Payout details saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeSocial() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeSocialInput) => saveMentorMeSocial(input),
    onSuccess: () => {
      invalidate();
      toast.success("Social links saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function usePublishMentorMe() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: () => publishMentorMe(),
    onSuccess: (data) => {
      invalidate();
      toast.success(data.status === "LIVE" ? "You're live!" : "Published");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeGrowth() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (input: MentorMeGrowthInput) => saveMentorMeGrowth(input),
    onSuccess: () => {
      invalidate();
      toast.success("Saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveMentorMeExperiences() {
  const invalidate = useInvalidateMentorMe();
  return useMutation({
    mutationFn: (experiences: MentorMeExperienceItem[]) => saveMentorMeExperiences(experiences),
    onSuccess: () => {
      invalidate();
      toast.success("Experiences saved");
    },
    onError: (error) => toast.error(error.message),
  });
}
