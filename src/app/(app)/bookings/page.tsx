"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useMyBookings } from "@/hooks/use-bookings";
import { isPast } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingRow } from "@/components/bookings/booking-row";

export default function MyBookingsPage() {
  const { data: bookings, isLoading, isError, error, refetch } = useMyBookings(true);

  const upcoming = (bookings ?? [])
    .filter((b) => !isPast(b.scheduledAt) && b.status !== "CANCELLED")
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  const past = (bookings ?? [])
    .filter((b) => isPast(b.scheduledAt) || b.status === "CANCELLED")
    .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          Every call you&apos;ve booked with a mentor — update or cancel without reloading.
        </p>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : bookings && bookings.length ? (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length ? (
              upcoming.map((booking) => <BookingRow key={booking.id} booking={booking} />)
            ) : (
              <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                Nothing scheduled.{" "}
                <Link href="/mentors" className="font-medium text-brand-600 hover:underline">
                  Find a mentor
                </Link>{" "}
                to book your next call.
              </p>
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Past &amp; cancelled ({past.length})
              </h2>
              {past.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </section>
          )}
        </>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No bookings yet"
          description="Book a 20 or 40 minute call with a mentor and it'll show up here."
          action={
            <Button asChild>
              <Link href="/mentors">Find a mentor</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
