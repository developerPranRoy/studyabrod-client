"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllCountries,
  getCountries,
  getCountry,
  getMentorOnboardingOptions,
  getOnboardingOptions,
  getPricingMarkets,
  getPrograms,
  getScholarship,
  getScholarships,
  getServices,
  getSessionCategories,
  getTimezones,
  getUniversities,
} from "@/lib/api/lookups";
import { qk } from "@/hooks/query-keys";

const LOOKUP_STALE = 10 * 60 * 1000; // lookups rarely change

export function useCountries() {
  return useQuery({ queryKey: qk.countries, queryFn: getCountries, staleTime: LOOKUP_STALE });
}

export function useCountry(slug: string) {
  return useQuery({
    queryKey: qk.country(slug),
    queryFn: () => getCountry(slug),
    enabled: Boolean(slug),
    staleTime: LOOKUP_STALE,
  });
}

export function usePrograms() {
  return useQuery({ queryKey: qk.programs, queryFn: getPrograms, staleTime: LOOKUP_STALE });
}

export function useScholarships() {
  return useQuery({ queryKey: qk.scholarships, queryFn: getScholarships, staleTime: LOOKUP_STALE });
}

export function useScholarship(slug: string) {
  return useQuery({
    queryKey: qk.scholarship(slug),
    queryFn: () => getScholarship(slug),
    enabled: Boolean(slug),
    staleTime: LOOKUP_STALE,
  });
}

/** Universities load only after a country is selected (requirement: real API-driven dropdown). */
export function useUniversities(countryId: number | null) {
  return useQuery({
    queryKey: qk.universities(countryId ?? 0),
    queryFn: () => getUniversities(countryId as number),
    enabled: countryId != null,
    staleTime: LOOKUP_STALE,
  });
}

export function useOnboardingOptions() {
  return useQuery({
    queryKey: qk.onboardingOptions,
    queryFn: getOnboardingOptions,
    staleTime: LOOKUP_STALE,
  });
}

export function useMentorOnboardingOptions() {
  return useQuery({
    queryKey: qk.mentorOnboardingOptions,
    queryFn: getMentorOnboardingOptions,
    staleTime: LOOKUP_STALE,
  });
}

export function usePricingMarkets() {
  return useQuery({
    queryKey: qk.pricingMarkets,
    queryFn: getPricingMarkets,
    staleTime: LOOKUP_STALE,
  });
}

export function useServices() {
  return useQuery({
    queryKey: qk.services,
    queryFn: getServices,
    staleTime: LOOKUP_STALE,
  });
}

export function useSessionCategories() {
  return useQuery({
    queryKey: qk.sessionCategories,
    queryFn: getSessionCategories,
    staleTime: LOOKUP_STALE,
  });
}

export function useTimezones() {
  return useQuery({
    queryKey: qk.timezones,
    queryFn: getTimezones,
    staleTime: LOOKUP_STALE,
  });
}

export function useAllCountries() {
  return useQuery({
    queryKey: qk.allCountries,
    queryFn: getAllCountries,
    staleTime: LOOKUP_STALE,
  });
}
