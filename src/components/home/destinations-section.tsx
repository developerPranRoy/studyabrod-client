"use client";

import Link from "next/link";
import { Globe2, GraduationCap, ArrowRight } from "lucide-react";
import { useCountries, useScholarships } from "@/hooks/use-lookups";

export function DestinationsSection() {
  const { data: countries    } = useCountries();
  const { data: scholarships } = useScholarships();

  return (
    <section style={{ background: "#fff", padding: "5rem 0" }}>
      <div className="container">
        <div className="grid gap-16 lg:grid-cols-2">

          {/* Countries */}
          <div>
            <h2 className="text-2xl font-extrabold">
              Study <span className="font-accent text-brand-600">Destinations</span>
            </h2>
            <p className="mt-1 text-muted-foreground">Explore mentors from your target country.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {(countries ?? []).slice(0, 8).map((c) => (
                <Link key={c.id} href={`/countries/${c.slug}`} className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lifted">
                  <span className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-brand-500" />
                    <span className="text-sm font-semibold">{c.name}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
              {!countries?.length && ["Australia","Canada","Germany","UK","USA","Netherlands"].map((c) => (
                <div key={c} className="flex items-center gap-2 rounded-xl border bg-gray-50 p-4">
                  <Globe2 className="h-4 w-4 text-brand-300" />
                  <span className="text-sm font-semibold text-gray-400">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scholarships */}
          <div>
            <h2 className="text-2xl font-extrabold">
              Top <span className="font-accent text-brand-600">Scholarships</span>
            </h2>
            <p className="mt-1 text-muted-foreground">Mentors who actually won the funding you&apos;re chasing.</p>
            <div className="mt-6 space-y-3">
              {(scholarships ?? []).slice(0, 6).map((s) => (
                <Link key={s.id} href={`/scholarships/${s.slug}`} className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lifted">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-brand-500" />
                    <span className="text-sm font-semibold">{s.name}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
              {!scholarships?.length && ["Chevening","DAAD","Fulbright","Erasmus+","Gates Cambridge"].map((s) => (
                <div key={s} className="flex items-center gap-2 rounded-xl border bg-gray-50 p-4">
                  <GraduationCap className="h-4 w-4 text-brand-300" />
                  <span className="text-sm font-semibold text-gray-400">{s}</span>
                </div>
              ))}
              <Link href="/scholarships" className="inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand-600 hover:underline">
                All scholarships <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
