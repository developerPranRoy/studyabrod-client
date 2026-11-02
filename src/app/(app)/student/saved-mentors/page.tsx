"use client";

import { Heart } from "lucide-react";
import { useSavedMentors, useRemoveSavedMentor } from "@/hooks/use-students";
import type { SavedMentor } from "@/lib/api/types";
import { MentorCard, MentorCardSkeleton } from "@/components/mentors/mentor-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

function SavedMentorCard({ mentor }: { mentor: SavedMentor }) {
  const remove = useRemoveSavedMentor();

  return (
    <div className="relative">
      <MentorCard mentor={mentor} />
      <Button
        variant="outline"
        size="icon"
        aria-label={`Remove ${mentor.fullName} from saved mentors`}
        disabled={remove.isPending}
        onClick={() => remove.mutate(mentor.id)}
        className="absolute right-3 top-3 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
      >
        <Heart className="h-4 w-4 fill-brand-500 text-brand-500" />
      </Button>
    </div>
  );
}

export default function SavedMentorsPage() {
  const { data: mentors, isLoading, isError, error, refetch } = useSavedMentors();

  const skeletons = Array.from({ length: 6 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Mentors</h1>
        <p className="mt-1 text-muted-foreground">
          Mentors you&apos;ve saved for later — reach out any time.
        </p>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletons.map((_, i) => (
            <MentorCardSkeleton key={i} />
          ))}
        </div>
      ) : !mentors || mentors.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved mentors yet"
          description="Heart a mentor on their profile or in the mentor list to save them here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <SavedMentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
