"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/api/types";
import { useAuth } from "@/store/auth-store";
import { Spinner } from "@/components/shared/spinner";

/**
 * Client-side route guard. Wrap protected pages:
 *   <RequireAuth>…</RequireAuth>               — any signed-in user
 *   <RequireAuth role="MENTOR">…</RequireAuth> — role-restricted
 */
export function RequireAuth({
  role,
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading your account…" />
      </div>
    );
  }

  if (role && user?.role !== role) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold">This area is for {role === "MENTOR" ? "mentors" : "students"}</h1>
        <p className="text-muted-foreground">
          You're signed in as {user?.role === "MENTOR" ? "a mentor" : "a student"}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
