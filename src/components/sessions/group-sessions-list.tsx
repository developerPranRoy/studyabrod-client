"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarX2 } from "lucide-react";
import type { SessionTab } from "@/lib/api/types";
import { useSessions } from "@/hooks/use-sessions";
import { SessionCard, SessionCardSkeleton } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";
const CATEGORIES = ["WORKSHOP", "QA", "SCHOLARSHIPS", "WEBINAR", "GENERAL"];

export function GroupSessionsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab: SessionTab = searchParams.get("tab") === "past" ? "past" : "upcoming";
  const category = searchParams.get("category") ?? undefined;

  const { data: sessions, isLoading, isError, error, refetch } = useSessions(tab, category);

  const categories = useMemo(() => {
    const fromData = (sessions ?? []).map((s) => s.category);
    return [...new Set([...CATEGORIES, ...fromData])];
  }, [sessions]);

  const setParams = (nextTab: SessionTab, nextCategory?: string) => {
    const params = new URLSearchParams();
    if (nextTab !== "upcoming") params.set("tab", nextTab);
    if (nextCategory) params.set("category", nextCategory);
    const qs = params.toString();
    router.replace(qs ? `/sessions?${qs}` : "/sessions", { scroll: false });
  };

  return (
    <div className="container py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setParams(v as SessionTab, category)}>
          <TabsList>
            <TabsTrigger value="upcoming" className="px-5">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="px-5">
              Past
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={category ?? ALL}
          onValueChange={(v) => setParams(tab, v === ALL ? undefined : v)}
        >
          <SelectTrigger className="w-[190px]" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarX2}
          title={tab === "upcoming" ? "No upcoming sessions" : "No past sessions"}
          description={
            tab === "upcoming"
              ? "New sessions are announced regularly — check back soon."
              : "Sessions you missed will appear here."
          }
        />
      )}
    </div>
  );
}
