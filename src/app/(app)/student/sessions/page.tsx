"use client";

import { BookOpen } from "lucide-react";
import { useMyBookings } from "@/hooks/use-bookings";
import { isPast } from "@/lib/utils";
import { BookingRow } from "@/components/bookings/booking-row";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentSessionsPage() {
  const { data: bookings, isLoading, isError, error, refetch } = useMyBookings(true);

  const upcoming = (bookings ?? [])
    .filter((b) => !isPast(b.scheduledAt) && b.status !== "CANCELLED")
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));

  const past = (bookings ?? [])
    .filter((b) => isPast(b.scheduledAt) && b.status !== "CANCELLED")
    .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));

  const withdrawn = (bookings ?? [])
    .filter((b) => b.status === "CANCELLED")
    .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));

  const skeletons = Array.from({ length: 3 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Sessions</h1>
        <p className="mt-1 text-muted-foreground">
          All your 1-on-1 calls with mentors in one place.
        </p>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {skeletons.map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="withdrawn">Withdrawn ({withdrawn.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No upcoming sessions"
                description="Book a call with a mentor and it will appear here."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {upcoming.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No past sessions"
                description="Completed calls will appear here."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {past.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdrawn">
            {withdrawn.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No withdrawn sessions"
                description="Cancelled bookings will appear here."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {withdrawn.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
