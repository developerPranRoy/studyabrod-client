"use client";

import Link from "next/link";
import { CalendarDays, Clock, Loader2, MapPin, Users } from "lucide-react";
import type { GroupSession } from "@/lib/api/types";
import { formatDate, formatDateTime, isPast } from "@/lib/utils";
import { useAuth } from "@/store/auth-store";
import { useRegisterForSession, useUnregisterFromSession } from "@/hooks/use-sessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  WORKSHOP: "Workshop",
  QA: "Q&A",
  SCHOLARSHIPS: "Scholarships",
  WEBINAR: "Webinar",
  GENERAL: "General",
};

export const categoryLabel = (category: string) => CATEGORY_LABELS[category] ?? category;

export function SessionCard({ session }: { session: GroupSession }) {
  const { isAuthenticated, isStudent, hasHydrated } = useAuth();
  const register = useRegisterForSession();
  const unregister = useUnregisterFromSession();

  // Registration closes automatically once the session date has passed.
  const closed = isPast(session.startsAt);
  const busy = register.isPending || unregister.isPending;

  const action = () => {
    if (session.isRegistered) unregister.mutate(session.id);
    else register.mutate(session.id);
  };

  return (
    <Card className="flex h-full flex-col gap-4 p-5 transition-shadow hover:shadow-lifted">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="secondary">{categoryLabel(session.category)}</Badge>
          <h3 className="text-lg font-semibold leading-snug">{session.title}</h3>
        </div>
        {closed ? <Badge variant="muted">Past</Badge> : <Badge variant="success">Upcoming</Badge>}
      </div>

      {session.description ? (
        <p className="line-clamp-3 text-sm text-muted-foreground">{session.description}</p>
      ) : null}

      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-500" />
          {formatDateTime(session.startsAt)}
        </p>
        {session.endsAt ? (
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-500" />
            Ends {formatDate(session.endsAt, { hour: "numeric", minute: "2-digit" })}
          </p>
        ) : null}
        {session.location ? (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-500" />
            {session.location}
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-500" />
          {session.registeredCount}
          {session.capacity ? ` / ${session.capacity}` : ""} registered
          {session.hostName ? ` · hosted by ${session.hostName}` : ""}
        </p>
      </div>

      <div className="mt-auto border-t pt-4">
        {closed ? (
          <Button disabled variant="secondary" className="w-full">
            Registration closed
          </Button>
        ) : !hasHydrated ? (
          <Skeleton className="h-9 w-full" />
        ) : !isAuthenticated ? (
          <Button asChild className="w-full">
            <Link href={`/login?next=/sessions`}>Sign in to register</Link>
          </Button>
        ) : !isStudent ? (
          <Button disabled variant="secondary" className="w-full">
            Students only
          </Button>
        ) : (
          <Button
            onClick={action}
            disabled={busy}
            variant={session.isRegistered ? "outline" : "default"}
            className="w-full"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {session.isRegistered ? "Unregister" : "Register for free"}
          </Button>
        )}
      </div>
    </Card>
  );
}

export function SessionCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="mt-auto border-t pt-4">
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}
