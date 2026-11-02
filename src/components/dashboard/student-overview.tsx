"use client";

import Link from "next/link";
import { ArrowRight, Video, Users } from "lucide-react";
import { useMyBookings } from "@/hooks/use-bookings";
import { useSessions } from "@/hooks/use-sessions";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentOverview() {
  const { data: bookings, isLoading } = useMyBookings(true);
  const { data: sessions } = useSessions("upcoming");

  const upcoming = (bookings ?? [])
    .filter((b) => new Date(b.scheduledAt) > new Date() && b.status !== "CANCELLED")
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">What&apos;s coming up</h2>
            <p className="text-sm text-muted-foreground">Your next 1:1 calls</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-brand-600">
            <Link href="/bookings">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : upcoming.length ? (
          <div className="space-y-3">
            {upcoming.slice(0, 4).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">Session with {booking.mentorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(booking.scheduledAt)}
                    {booking.durationMin ? ` · ${booking.durationMin} min` : ""}
                  </p>
                </div>
                <Badge variant={booking.status === "CONFIRMED" ? "success" : "warning"}>
                  {booking.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No upcoming calls yet.</p>
            <Button asChild className="mt-3">
              <Link href="/mentors">Find a mentor</Link>
            </Button>
          </div>
        )}
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-1 font-semibold">Group sessions</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {sessions?.length
              ? `${sessions.length} upcoming session${sessions.length === 1 ? "" : "s"} you can join`
              : "Free live workshops and Q&As"}
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/sessions">
              <Video className="h-4 w-4" /> Browse sessions
            </Link>
          </Button>
        </Card>
        <Card className="p-6">
          <h2 className="mb-1 font-semibold">Need a mentor?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Filter by country, program, service, or scholarship.
          </p>
          <Button asChild className="w-full">
            <Link href="/mentors">
              <Users className="h-4 w-4" /> Find a mentor
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
