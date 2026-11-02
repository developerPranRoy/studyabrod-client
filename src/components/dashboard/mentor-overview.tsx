"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, FileText, UserRound, Video } from "lucide-react";
import { useMyMentorProfile } from "@/hooks/use-mentors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MentorOverview() {
  const { data: profile, isLoading } = useMyMentorProfile(true);

  const hasProfile = Boolean(profile && profile.id);
  const hasPlans = Boolean(profile?.plans.length);
  const hasPhoto = Boolean(profile?.photoUrl);
  const hasCv = Boolean(profile?.cvUrl);

  const steps = [
    { done: hasProfile, label: "Create your mentor profile", href: "/dashboard/mentor/profile", icon: UserRound },
    { done: hasPlans, label: "Add 20 / 40 min plans with prices", href: "/dashboard/mentor/profile", icon: CalendarDays },
    { done: hasPhoto, label: "Upload a profile photo", href: "/dashboard/mentor/profile", icon: UserRound },
    { done: hasCv, label: "Upload your CV (PDF)", href: "/dashboard/mentor/profile", icon: FileText },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Profile setup</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Checking your profile…" : `${doneCount} of ${steps.length} done`}
            </p>
          </div>
          <span className="text-2xl font-extrabold text-brand-600">
            {isLoading ? "…" : `${Math.round((doneCount / steps.length) * 100)}%`}
          </span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
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
              <Badge variant={step.done ? "success" : "muted"}>{step.done ? "Done" : "To do"}</Badge>
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
      </div>
    </div>
  );
}
