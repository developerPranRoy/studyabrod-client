"use client";

import Link from "next/link";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StudentOverview } from "@/components/dashboard/student-overview";
import { MentorOverview } from "@/components/dashboard/mentor-overview";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const { user, isMentor } = useAuth();
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-brand-50 to-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {greeting()},{" "}
          <span className="font-script text-brand-600">
            {user?.fullName.split(" ")[0]}!
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isMentor
            ? "Share your profile so students can find and book you."
            : "Here's what's coming up on your study-abroad journey."}
        </p>
      </Card>

      {isMentor ? <MentorOverview /> : <StudentOverview />}
    </div>
  );
}
