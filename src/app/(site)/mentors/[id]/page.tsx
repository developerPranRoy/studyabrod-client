"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Star,
  Timer,
  Video,
} from "lucide-react";
import { cn, formatPrice, initials } from "@/lib/utils";
import { useMentor } from "@/hooks/use-mentors";
import { useAuth } from "@/store/auth-store";
import { BookCallDialog } from "@/components/mentors/book-call-dialog";
import { CvDownloadButton } from "@/components/mentors/cv-download-button";
import { ErrorState } from "@/components/shared/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: mentor, isLoading, isError, error, refetch } = useMentor(id);
  const { isAuthenticated } = useAuth();

  // Per-page document title (client-rendered detail view).
  useEffect(() => {
    if (mentor) document.title = `${mentor.fullName} · AbroadMates`;
    return () => {
      document.title = "AbroadMates";
    };
  }, [mentor]);

  if (isError) {
    return (
      <div className="container py-16">
        <ErrorState title="Couldn't load this mentor" error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !mentor) {
    return (
      <div className="container space-y-6 py-10">
        <Skeleton className="h-8 w-40" />
        <Card className="p-6">
          <div className="flex gap-5">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-10">
      <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
        <Link href="/mentors">
          <ArrowLeft className="h-4 w-4" /> Back to mentors
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Profile */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-brand-600 to-brand-400" />
          <div className="px-6 pb-6">
            <div className="-mt-14 mb-4 flex flex-wrap items-end justify-between gap-4">
              <Avatar className="h-28 w-28 border-4 border-white shadow-card">
                <AvatarImage src={mentor.photoUrl ?? undefined} alt={mentor.fullName} />
                <AvatarFallback className="text-3xl">{initials(mentor.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {mentor.rating != null && (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {mentor.rating.toFixed(1)}
                  </span>
                )}
                {mentor.totalSessions > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Video className="h-4 w-4" /> {mentor.totalSessions} sessions
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold">{mentor.fullName}</h1>
            {mentor.headline ? (
              <p className="mt-1 text-muted-foreground">{mentor.headline}</p>
            ) : null}

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {mentor.universityName && (
                <p className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand-500" />
                  {mentor.universityName}
                </p>
              )}
              {mentor.country && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  <Link
                    href={`/countries/${mentor.country.slug}`}
                    className="hover:text-brand-600 hover:underline"
                  >
                    {mentor.country.name}
                  </Link>
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {mentor.program && <Badge variant="secondary">{mentor.program.name}</Badge>}
              {mentor.scholarship && (
                <Link href={`/scholarships/${mentor.scholarship.slug}`}>
                  <Badge variant="warning" className="hover:bg-amber-200">
                    {mentor.scholarship.name}
                  </Badge>
                </Link>
              )}
            </div>

            {mentor.bio ? (
              <>
                <Separator className="my-6" />
                <h2 className="mb-2 font-semibold">About</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {mentor.bio}
                </p>
              </>
            ) : null}
          </div>
        </Card>

        {/* Booking panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-1 font-semibold">Book a 1:1 call</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pick a plan — you'll choose the exact time next.
            </p>
            <div className="space-y-3">
              {mentor.plans.length ? (
                mentor.plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3.5",
                      "transition-colors hover:border-brand-300"
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Timer className="h-4 w-4 text-brand-500" />
                      {plan.durationMin} min call
                    </span>
                    <span className="font-bold text-brand-600">{formatPrice(plan.price)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No plans published yet.</p>
              )}
            </div>
            <div className="mt-4">
              <BookCallDialog mentor={mentor} trigger={<Button className="w-full">Book a call</Button>} />
            </div>
          </Card>

          {(mentor.cvUrl || isAuthenticated) && (
            <Card className="p-5">
              <h2 className="mb-2 font-semibold">Mentor CV</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Download the CV to review education and experience.
              </p>
              <CvDownloadButton mentorId={mentor.id} disabled={!isAuthenticated} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
