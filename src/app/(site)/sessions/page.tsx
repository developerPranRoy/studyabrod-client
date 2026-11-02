"use client";

import { Suspense } from "react";
import { GroupSessionsList } from "@/components/sessions/group-sessions-list";

export default function GroupSessionsPage() {
  return (
    <>
      <section className="bg-brand-50 border-b">
        <div className="container py-14 text-center">
          <h1 className="font-script text-5xl sm:text-6xl text-brand-600">Group Sessions</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Free live workshops and Q&amp;As with mentors — scholarships, applications, visas, and
            life abroad. Registration closes automatically once a session starts.
          </p>
        </div>
      </section>
      <Suspense>
        <GroupSessionsList />
      </Suspense>
    </>
  );
}
