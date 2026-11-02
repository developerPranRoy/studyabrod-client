"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, FileText, UserRound, Video } from "lucide-react";
import { useMyMentorProfile } from "@/hooks/use-mentors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MentorOverview() {
  // retry:false + 404 check — a mentor with no profile yet gets an empty state, not a crash
  const { data: profile, isLoading, isError } = useMyMentorProfile(true);

  const hasProfile = Boolean(profile && profile.id);
  const hasPlans   = Boolean(profile?.plans.length);
  const hasPhoto   = Boolean(profile?.photoUrl);
  const hasCv      = Boolean(profile?.cvUrl);

  const steps = [
    { done: hasProfile, label: "Create your mentor profile",      href: "/dashboard/mentor/profile", icon: UserRound  },
    { done: hasPlans,   label: "Add 20 / 40 min plans with prices", href: "/dashboard/mentor/profile", icon: CalendarDays },
    { done: hasPhoto,   label: "Upload a profile photo",           href: "/dashboard/mentor/profile", icon: UserRound  },
    { done: hasCv,      label: "Upload your CV (PDF)",             href: "/dashboard/mentor/profile", icon: FileText   },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  // 404 = no profile yet — show the setup checklist
  const showSetup = isError || !hasProfile;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Profile setup</h2>
            <p className="text-sm text-muted-foreground">
              {showSetup
                ? "Complete your profile to start receiving bookings"
                : `${doneCount} of ${steps.length} done`}
            </p>
          </div>
          <span className="text-2xl font-extrabold text-brand-600">
            {showSetup ? "0%" : `${Math.round((doneCount / steps.length) * 100)}%`}
          </span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: showSetup ? "0%" : `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <div className="space-y-2">
          {steps.map((step) => (
            <Link
              key={step.label}
              href={step.href}
              className="flex items-center justify-between rounded-lg border p-3.5 transition-colors hover:border-brand-300"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <step.icon className="h-4 w-4 text-brand-500" />
                {step.label}
              </span>
              <Badge variant={step.done ? "success" : "muted"}>
                {step.done ? "Done" : "To do"}
              </Badge>
            </Link>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-1 font-semibold">Group sessions</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Host workshops and Q&As for students.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard/mentor/sessions">
              <Video className="h-4 w-4" /> Manage sessions
            </Link>
          </Button>
        </Card>
        {hasProfile && (
          <Card className="p-6">
            <h2 className="mb-1 font-semibold">Your public profile</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              This is what students see when they find you.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href={`/mentors/${profile!.id}`}>
                <BookOpen className="h-4 w-4" /> View profile
              </Link>
            </Button>
          </Card>
        )}
        {showSetup && (
          <Card className="border-brand-200 bg-brand-50 p-6">
            <h2 className="mb-1 font-semibold text-brand-700">Complete your profile</h2>
            <p className="mb-4 text-sm text-brand-600">
              Fill in all the steps to go live and start receiving bookings.
            </p>
            <Button asChild className="w-full">
              <Link href="/mentor-onboarding">
                <ArrowRight className="h-4 w-4" /> Continue setup
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
