import Link from "next/link";
import { Button } from "@/components/ui/button";

export function WhatIsSection() {
  return (
    <section style={{ background: "#fff", padding: "5rem 0" }}>
      <div className="container" style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <h2 className="text-3xl font-extrabold sm:text-4xl">What is AbroadMates</h2>
        <p className="mt-3 text-lg font-semibold text-brand-600">
          We replace study abroad agencies (read scams) with real students and their guidance.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          AbroadMates is the all-in-one mentorship platform for study abroad. Study abroad
          agencies are scams. We help you apply without study abroad agencies. You book a 20 or
          40 minute call with a mentor who went to your dream school.
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Ask anything: Am I choosing the right country? Does my essay suck? Visa questions?
          Cultural shock tips? They&apos;ll tell you the truth. Even the ugly parts.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="rounded-full bg-brand-600 px-10 text-white hover:bg-brand-700">
            <Link href="/mentors">Start NOW</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
