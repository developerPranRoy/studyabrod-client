"use client";

import { Suspense } from "react";
import { FindMentor } from "@/components/mentors/find-mentor";

export default function FindMentorPage() {
  return (
    <>
      <section className="bg-brand-50 border-b">
        <div className="container py-14 text-center">
          <h1 className="font-script text-5xl sm:text-6xl text-brand-600">Find Your AbroadMate</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Filter by country, program, service, or scholarship. Search by name or university.
          </p>
        </div>
      </section>
      <Suspense>
        <FindMentor />
      </Suspense>
    </>
  );
}
