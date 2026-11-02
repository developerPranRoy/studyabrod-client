"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Globe2 } from "lucide-react";
import { useCountry } from "@/hooks/use-lookups";
import { useMentors } from "@/hooks/use-mentors";
import { MentorCard, MentorCardSkeleton } from "@/components/mentors/mentor-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

/** Country page — own title + description from the API, and only that country's mentors. */
export default function CountryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: country, isLoading, isError, error, refetch } = useCountry(slug);
  const { data: mentors } = useMentors({ country: slug, sort: "top_rated", page: 1, limit: 12 });

  useEffect(() => {
    if (country) document.title = `${country.title ?? `Study in ${country.name}`} · AbroadMates`;
    return () => {
      document.title = "AbroadMates";
    };
  }, [country]);

  if (isError) {
    return (
      <div className="container py-16">
        <ErrorState title="Country not found" error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-brand-50 to-background">
        <div className="container space-y-3 py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-600">
            <Globe2 className="h-3.5 w-3.5" /> Study destination
          </span>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
            {isLoading ? "Loading…" : country?.title ?? `Study in ${country?.name ?? ""}`}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {country?.description ??
              `Meet mentors currently studying in ${country?.name ?? "this country"} — and hear what it's really like.`}
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-script text-4xl text-brand-600">
            Mentors in {country?.name ?? "…"}
          </h2>
          <Button variant="outline" asChild>
            <Link href={`/mentors?country=${slug}`}>
              Filter in Find a Mentor <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {mentors && mentors.items.length === 0 ? (
          <EmptyState
            icon={Globe2}
            title={`No mentors in ${country?.name ?? "this country"} yet`}
            description="Check back soon — new mentors join every week."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!mentors
              ? Array.from({ length: 4 }).map((_, i) => <MentorCardSkeleton key={i} />)
              : mentors.items.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
          </div>
        )}
      </section>
    </div>
  );
}
