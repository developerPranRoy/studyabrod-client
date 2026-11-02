"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getMentorMeOnboarding,
  getMentorPreview,
  publishMentor,
  putMentorAvailability,
  putMentorExpertise,
  putMentorPricing,
  putMentorProfile,
  putMentorSource,
} from '@/lib/api/mentor-wizard';
import { qk } from '@/hooks/query-keys';
import type {
  MentorMeAvailabilityInput,
  MentorMeExpertiseInput,
  MentorMePricingInput,
  MentorMeProfileInput,
  MentorMeSourceInput,
} from '@/lib/api/types';

export function useMentorMeOnboarding() {
  return useQuery({
    queryKey: qk.mentorMeOnboarding,
    queryFn: getMentorMeOnboarding,
  });
}

function useInvalidateOnboarding() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: qk.mentorMeOnboarding });
}

export function usePutMentorSource() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (input: MentorMeSourceInput) => putMentorSource(input),
    onSuccess: () => { invalidate(); toast.success('Saved'); },
    onError: (e) => toast.error(e.message),
  });
}

export function usePutMentorProfile() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (input: MentorMeProfileInput) => putMentorProfile(input),
    onSuccess: () => { invalidate(); toast.success('Profile saved'); },
    onError: (e) => toast.error(e.message),
  });
}

export function usePutMentorExpertise() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (input: MentorMeExpertiseInput) => putMentorExpertise(input),
    onSuccess: () => { invalidate(); toast.success('Expertise saved'); },
    onError: (e) => toast.error(e.message),
  });
}

export function usePutMentorAvailability() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (input: MentorMeAvailabilityInput) => putMentorAvailability(input),
    onSuccess: () => { invalidate(); toast.success('Availability saved'); },
    onError: (e) => toast.error(e.message),
  });
}

export function usePutMentorPricing() {
  const invalidate = useInvalidateOnboarding();
  return useMutation({
    mutationFn: (input: MentorMePricingInput) => putMentorPricing(input),
    onSuccess: () => { invalidate(); toast.success('Pricing saved'); },
    onError: (e) => toast.error(e.message),
  });
}

export function useMentorPreview() {
  return useQuery({
    queryKey: qk.mentorMePreview,
    queryFn: getMentorPreview,
  });
}

export function usePublishMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishMentor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.mentorMeOnboarding });
      qc.invalidateQueries({ queryKey: qk.mentorMePreview });
      toast.success('Profile published!');
    },
    onError: (e) => toast.error(e.message),
  });
}
