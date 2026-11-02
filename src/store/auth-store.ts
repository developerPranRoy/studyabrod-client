"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/api/types";

interface AuthState {
  token: string | null;
  user: User | null;
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "abroadmates-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

export const useAuth = () =>
  useAuthStore((s) => ({
    token: s.token,
    user: s.user,
    hasHydrated: s.hasHydrated,
    isAuthenticated: Boolean(s.token),
    isStudent: s.user?.role === "STUDENT",
    isMentor: s.user?.role === "MENTOR",
  }));
