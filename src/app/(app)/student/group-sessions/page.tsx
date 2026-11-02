"use client";

import { CalendarDays } from "lucide-react";
import { useMySessions } from "@/hooks/use-sessions";
import { isPast } from "@/lib/utils";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentGroupSessionsPage() {
  const { data: sessions, isLoading, isError, error, refetch } = useMySessions();

  const upcoming = (sessions ?? [])
    .filter((s) => !isPast(s.startsAt))
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

  const past = (sessions ?? [])
    .filter((s) => isPast(s.startsAt))
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));

  const skeletons = Array.from({ length: 3 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Group Sessions</h1>
        <p className="mt-1 text-muted-foreground">
          Workshops, Q&amp;As, and webinars you&apos;ve registered for.
        </p>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletons.map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming group sessions"
                description="Register for a group session and it will appear here."
              />
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No past group sessions"
                description="Sessions you attended will appear here."
              />
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
