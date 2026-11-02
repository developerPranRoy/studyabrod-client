"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useScholarship } from "@/hooks/use-lookups";
import { useMentors } from "@/hooks/use-mentors";
import { MentorCard, MentorCardSkeleton } from "@/components/mentors/mentor-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

/** Scholarship page — title + description from the API plus mentors linked to it. */
export default function ScholarshipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: scholarship, isLoading, isError, error, refetch } = useScholarship(slug);
  const { data: mentors } = useMentors({ scholarship: slug, sort: "top_rated", page: 1, limit: 12 });

  useEffect(() => {
    if (scholarship) document.title = `${scholarship.title ?? scholarship.name} · AbroadMates`;
    return () => {
      document.title = "AbroadMates";
    };
  }, [scholarship]);

  if (isError) {
    return (
      <div className="container py-16">
        <ErrorState title="Scholarship not found" error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-brand-50 to-background">
        <div className="container space-y-3 py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-600">
            <GraduationCap className="h-3.5 w-3.5" /> Scholarship
          </span>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
            {isLoading ? "Loading…" : scholarship?.title ?? scholarship?.name}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {scholarship?.description ??
              "Meet mentors who won this scholarship and ask them exactly how they did it."}
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-script text-4xl text-brand-600">Mentors who can help</h2>
          <Button variant="outline" asChild>
            <Link href={`/mentors?scholarship=${slug}`}>
              Filter in Find a Mentor <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {mentors && mentors.items.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No mentors linked to this scholarship yet"
            description="Browse all mentors instead — many can help with funding strategy."
            action={
              <Button variant="outline" asChild>
                <Link href="/mentors">Browse mentors</Link>
              </Button>
            }
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
