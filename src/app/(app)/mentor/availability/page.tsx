"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, ExternalLink } from "lucide-react";
import { getMentorMeAvailability } from "@/lib/api/mentor-wizard";
import { qk } from "@/hooks/query-keys";
import { isObj, num, str } from "@/lib/api/dto";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ------------------------------------------------------------------ types --

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

interface TimeRange {
  start: string;
  end: string;
}

interface WeeklySlot {
  weekday: number;
  ranges: TimeRange[];
}

interface AvailabilityData {
  timezone: string | null;
  weekly: WeeklySlot[];
}

// ------------------------------------------------------------------ helpers --

function parseRange(raw: unknown): TimeRange | null {
  if (!isObj(raw)) return null;
  const start = str(raw.start);
  const end = str(raw.end);
  if (!start || !end) return null;
  return { start, end };
}

function parseWeeklySlot(raw: unknown): WeeklySlot | null {
  if (!isObj(raw)) return null;
  const weekday = num(raw.weekday);
  if (weekday == null) return null;
  const ranges = Array.isArray(raw.ranges)
    ? raw.ranges.map(parseRange).filter((r): r is TimeRange => r !== null)
    : [];
  return { weekday, ranges };
}

function normalizeAvailability(raw: unknown): AvailabilityData {
  if (!isObj(raw)) return { timezone: null, weekly: [] };
  const timezone = str(raw.timezone);
  const weekly = Array.isArray(raw.weekly)
    ? raw.weekly.map(parseWeeklySlot).filter((s): s is WeeklySlot => s !== null)
    : [];
  return { timezone, weekly };
}

// ------------------------------------------------------------------ sub-components --

function EditLink() {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/mentor-onboarding">
        Edit in Onboarding Wizard
        <ExternalLink className="h-4 w-4" />
      </Link>
    </Button>
  );
}

function WeeklySchedule({ data }: { data: AvailabilityData }) {
  const slotsWithRanges = data.weekly.filter((s) => s.ranges.length > 0);

  if (slotsWithRanges.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No weekly schedule configured"
        description="Set your availability in the onboarding wizard so students know when you're free."
        action={<EditLink />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {slotsWithRanges.map((slot) => {
        const dayName = WEEKDAY_NAMES[slot.weekday] ?? `Day ${slot.weekday}`;
        return (
          <div
            key={slot.weekday}
            className="flex flex-col gap-2 rounded-lg border bg-card p-4 sm:flex-row sm:items-start"
          >
            <span className="w-28 shrink-0 font-medium text-sm">{dayName}</span>
            <div className="flex flex-wrap gap-2">
              {slot.ranges.map((range, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  <Clock className="h-3 w-3" />
                  {range.start} – {range.end}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ page --

export default function MentorAvailabilityPage() {
  const { data: raw, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.mentorMeAvailability,
    queryFn: getMentorMeAvailability,
  });

  const availability = normalizeAvailability(raw);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your weekly schedule as students will see it.
          </p>
        </div>
        <EditLink />
      </div>

      {/* Timezone badge */}
      {!isLoading && !isError && availability.timezone && (
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Timezone: <span className="font-medium text-foreground">{availability.timezone}</span>
        </div>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading availability">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Couldn't load your availability"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : (
            <WeeklySchedule data={availability} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
