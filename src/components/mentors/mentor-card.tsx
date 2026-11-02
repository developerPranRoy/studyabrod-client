import Link from "next/link";
import { GraduationCap, MapPin, Star, Video } from "lucide-react";
import type { Mentor } from "@/lib/api/types";
import { cn, formatPrice, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function minPlanPrice(mentor: Mentor): number | null {
  if (!mentor.plans.length) return null;
  return Math.min(...mentor.plans.map((p) => p.price));
}

export function MentorCard({ mentor, className }: { mentor: Mentor; className?: string }) {
  const price = minPlanPrice(mentor);
  return (
    <Card
      className={cn(
        "group flex h-full flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lifted",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-brand-100">
          <AvatarImage src={mentor.photoUrl ?? undefined} alt={mentor.fullName} />
          <AvatarFallback className="text-lg">{initials(mentor.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Link
            href={`/mentors/${mentor.id}`}
            className="line-clamp-1 font-semibold leading-tight hover:text-brand-600"
          >
            {mentor.fullName}
          </Link>
          {mentor.headline ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{mentor.headline}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {mentor.rating != null && (
              <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {mentor.rating.toFixed(1)}
              </span>
            )}
            {mentor.totalSessions > 0 && (
              <span className="inline-flex items-center gap-1">
                <Video className="h-3.5 w-3.5" /> {mentor.totalSessions} sessions
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        {mentor.universityName && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4 shrink-0 text-brand-500" />
            <span className="line-clamp-1">{mentor.universityName}</span>
          </p>
        )}
        {mentor.country && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
            {mentor.country.name}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {mentor.program && <Badge variant="secondary">{mentor.program.name}</Badge>}
        {mentor.scholarship && <Badge variant="warning">{mentor.scholarship.name}</Badge>}
        {mentor.plans.map((plan) => (
          <Badge key={`${plan.id}-${plan.durationMin}`} variant="outline">
            {plan.durationMin} min
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Starting from</p>
          <p className="text-lg font-bold text-brand-600">
            {price != null ? formatPrice(price) : "—"}
          </p>
        </div>
        <Button asChild>
          <Link href={`/mentors/${mentor.id}`}>View profile</Link>
        </Button>
      </div>
    </Card>
  );
}

export function MentorCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-14" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-9 w-24" />
      </div>
    </Card>
  );
}
