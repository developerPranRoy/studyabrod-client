"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMe, login, loginWithGoogle, register, registerMentor } from "@/lib/api/auth";
import { qk } from "@/hooks/query-keys";
import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/lib/api/types";

export function useMe(enabled: boolean) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      const user = await getMe();
      setUser(user);
      return user;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string; next?: string }) => login(input),
    onSuccess: ({ token, user }, variables) => {
      setAuth(token, user);
      queryClient.invalidateQueries();
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
      router.push(variables.next ?? (user.role === "MENTOR" ? "/dashboard" : "/mentors"));
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      acceptTerms: true;
      onboarding: object;
      next?: string;
    }) =>
      register({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: input.password,
        confirmPassword: input.confirmPassword,
        acceptTerms: input.acceptTerms,
        onboarding: input.onboarding,
      }),
    onSuccess: () => {
      toast.success("Check your email to verify your account");
      router.push("/login?verify=1");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clear();
    queryClient.clear();
    router.push("/login");
  };
}

export function useGoogleLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idToken: string) => loginWithGoogle({ idToken }),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      queryClient.invalidateQueries();
      toast.success(`Welcome, ${user.fullName.split(" ")[0]}!`);
      router.push(user.role === "MENTOR" ? "/dashboard" : "/mentors");
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Mentor sign-up returns a login token straight away, so the wizard can begin. */
export function useRegisterMentor() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      acceptTerms: true;
      next?: string;
    }) => registerMentor(input),
    onSuccess: ({ token, user }, variables) => {
      setAuth(token, user);
      queryClient.invalidateQueries();
      toast.success(`Welcome, ${user.fullName.split(" ")[0]}! Start building your profile.`);
      router.push(variables.next ?? "/dashboard/mentor/profile");
    },
    onError: (error) => toast.error(error.message),
  });
}

export type { Role };
