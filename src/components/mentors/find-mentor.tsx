"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import type { MentorFilters, MentorSort } from "@/lib/api/types";
import { useMentors } from "@/hooks/use-mentors";
import { useDebounce } from "@/hooks/use-debounce";
import { MentorCard, MentorCardSkeleton } from "@/components/mentors/mentor-card";
import { MentorFilterBar } from "@/components/mentors/mentor-filter-bar";
import { ExportMentorsButton } from "@/components/mentors/export-mentors-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

const SORTS: MentorSort[] = ["top_rated", "most_sessions", "price_asc"];

function readFilters(params: URLSearchParams): MentorFilters {
  const sort = params.get("sort");
  return {
    country: params.get("country") ?? undefined,
    program: params.get("program") ?? undefined,
    service: params.get("service") ?? undefined,
    scholarship: params.get("scholarship") ?? undefined,
    search: params.get("search") ?? undefined,
    sort: SORTS.includes(sort as MentorSort) ? (sort as MentorSort) : undefined,
    page: Math.max(1, Number(params.get("page")) || 1),
  };
}

export function FindMentor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  // Search input is debounced before it becomes a query param (and an API call).
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  const syncUrl = useCallback(
    (patch: MentorFilters) => {
      const merged: MentorFilters = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (merged.country) params.set("country", merged.country);
      if (merged.program) params.set("program", merged.program);
      if (merged.service) params.set("service", merged.service);
      if (merged.scholarship) params.set("scholarship", merged.scholarship);
      if (merged.search) params.set("search", merged.search);
      if (merged.sort) params.set("sort", merged.sort);
      if (merged.page && merged.page > 1) params.set("page", String(merged.page));
      const qs = params.toString();
      router.replace(qs ? `/mentors?${qs}` : "/mentors", { scroll: false });
    },
    [filters, router]
  );

  // Push debounced search into the URL (and reset to page 1).
  useEffect(() => {
    if ((debouncedSearch || undefined) !== filters.search) {
      syncUrl({ search: debouncedSearch || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const onChange = (patch: Partial<MentorFilters>) => syncUrl({ ...patch, page: 1 });
  const onReset = () => {
    setSearchInput("");
    router.replace("/mentors", { scroll: false });
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useMentors({
    ...filters,
    limit: PAGE_SIZE,
  });

  return (
    <div className="container space-y-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            {data ? `${data.meta.total} mentor${data.meta.total === 1 ? "" : "s"}` : "Loading mentors…"}
            {isFetching && !isLoading ? " · refreshing" : ""}
          </p>
        </div>
        <ExportMentorsButton filters={filters} />
      </div>

      <MentorFilterBar
        filters={filters}
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        onChange={onChange}
        onReset={onReset}
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MentorCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
          <Pagination
            className="pt-4"
            page={data.meta.page}
            totalPages={data.meta.totalPages ?? 1}
            onPage={(page) => syncUrl({ page })}
          />
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No mentors match these filters"
          description="Try widening your filters or clearing the search."
          action={
            <Button variant="outline" onClick={onReset}>
              Reset filters
            </Button>
          }
        />
      )}
    </div>
  );
}
