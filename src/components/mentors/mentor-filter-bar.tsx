"use client";

import { RotateCcw, Search } from "lucide-react";
import type { MentorFilters, MentorSort } from "@/lib/api/types";
import { useCountries, usePrograms, useScholarships } from "@/hooks/use-lookups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

const SORT_OPTIONS: Array<{ value: MentorSort; label: string }> = [
  { value: "top_rated", label: "Top rated" },
  { value: "most_sessions", label: "Most sessions" },
  { value: "price_asc", label: "Price: low to high" },
];

const SERVICE_OPTIONS = [
  { value: "20", label: "20 min call" },
  { value: "40", label: "40 min call" },
];

interface Props {
  filters: MentorFilters;
  searchInput: string;
  onSearchInput: (value: string) => void;
  onChange: (patch: Partial<MentorFilters>) => void;
  onReset: () => void;
}

/** Filter bar for Find a Mentor — country / program / service / scholarship + search + sort + reset. */
export function MentorFilterBar({ filters, searchInput, onSearchInput, onChange, onReset }: Props) {
  const { data: countries } = useCountries();
  const { data: programs } = usePrograms();
  const { data: scholarships } = useScholarships();

  const activeCount = [filters.country, filters.program, filters.service, filters.scholarship].filter(
    Boolean
  ).length;

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => onSearchInput(e.target.value)}
            placeholder="Search by name or university…"
            className="pl-9"
            aria-label="Search mentors"
          />
        </div>

        <FilterSelect
          value={filters.country}
          placeholder="Country"
          onValueChange={(v) => onChange({ country: v })}
          options={(countries ?? []).map((c) => ({ value: c.slug, label: c.name }))}
        />
        <FilterSelect
          value={filters.program}
          placeholder="Program"
          onValueChange={(v) => onChange({ program: v })}
          options={(programs ?? []).map((p) => ({ value: p.slug, label: p.name }))}
        />
        <FilterSelect
          value={filters.service}
          placeholder="Service"
          onValueChange={(v) => onChange({ service: v })}
          options={SERVICE_OPTIONS}
        />
        <FilterSelect
          value={filters.scholarship}
          placeholder="Scholarship"
          onValueChange={(v) => onChange({ scholarship: v })}
          options={(scholarships ?? []).map((s) => ({ value: s.slug, label: s.name }))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          value={filters.sort ?? "top_rated"}
          onValueChange={(v) => onChange({ sort: v as MentorSort })}
        >
          <SelectTrigger className="w-[200px]" aria-label="Sort mentors">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!activeCount && !filters.search && !filters.sort}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Reset filters
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  placeholder,
  options,
  onValueChange,
}: {
  value?: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(v) => onValueChange(v === ALL ? undefined : v)}
    >
      <SelectTrigger aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All {placeholder.toLowerCase()}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
