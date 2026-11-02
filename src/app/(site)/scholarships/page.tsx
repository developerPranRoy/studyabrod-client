"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useScholarships } from "@/hooks/use-lookups";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScholarshipsPage() {
  const { data: scholarships, isLoading, isError, error, refetch } = useScholarships();

  return (
    <>
      <section className="bg-brand-50 border-b mb-10">
        <div className="container py-14 text-center">
          <h1 className="font-script text-5xl sm:text-6xl text-brand-600">Scholarships</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Funding is the hardest part. Talk to mentors who actually won these scholarships — and
            learn how they did it.
          </p>
        </div>
      </section>

      <div className="container py-12">
        {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : scholarships && scholarships.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((scholarship) => (
            <Link key={scholarship.id} href={`/scholarships/${scholarship.slug}`}>
              <Card className="group flex h-full flex-col gap-3 p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lifted">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-brand-600">
                  {scholarship.name}
                </h2>
                {scholarship.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {scholarship.description}
                  </p>
                ) : null}
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                  View mentors <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="No scholarships listed yet"
          description="Scholarship guides are on the way."
        />
      )}
    </div>
    </>
  );
}
