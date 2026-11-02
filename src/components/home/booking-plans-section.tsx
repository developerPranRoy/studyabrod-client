import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingPlansSection() {
  return (
    <section style={{ background: "#fdf2f4", padding: "5rem 0" }}>
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Book Your Ultra-Personalized Call
          </h2>
          <p className="mt-2 text-muted-foreground">
            Honest advice. No fluff. Get exactly what you need.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* 20 min */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1.5px solid #e5e7eb",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                color: "#C1113F",
                lineHeight: 1,
              }}
            >
              20 minutes
            </p>
            <p className="mt-2 font-semibold text-gray-800">
              Fast, focused, and straight to the point
            </p>
            <span
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignSelf: "flex-start",
                background: "#fdf2f4",
                color: "#C1113F",
                border: "1px solid #f9c6d2",
                borderRadius: 999,
                padding: "3px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Focused
            </span>
            <ul
              style={{
                marginTop: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}
            >
              {[
                `Ask: "Am I choosing the right country?"`,
                "Shortlist the right schools/programs",
                "Visa interview checklists",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <CheckCircle2
                    style={{
                      color: "#C1113F",
                      width: 16,
                      height: 16,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: "1.5rem", fontSize: 12, color: "#aaa" }}>
              Instant confirmation. Secure payment. Cancel anytime, no awkward
              questions.
            </p>
            <Button
              asChild
              className="mt-4 rounded-full bg-brand-600 text-white hover:bg-brand-700"
            >
              <Link href="/mentors">Book a 20 min call</Link>
            </Button>
          </div>

          {/* 40 min */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "2.5px solid #C1113F",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 24px rgba(193,17,63,0.18)",
            }}
          >
            <p
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                color: "#C1113F",
                lineHeight: 1,
              }}
            >
              40 minutes
            </p>
            <p className="mt-2 font-semibold text-gray-800">
              Go deep. Fix it all in one call.
            </p>
            <span
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignSelf: "flex-start",
                background: "#C1113F",
                color: "#fff",
                borderRadius: 999,
                padding: "3px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Deep-Dive
            </span>
            <ul
              style={{
                marginTop: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}
            >
              {[
                "Personal profile review. No sugar-coating",
                "Essay/SOP outline feedback that helps",
                "Scholarship & visa roadmap you can act on",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <CheckCircle2
                    style={{
                      color: "#C1113F",
                      width: 16,
                      height: 16,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: "1.5rem", fontSize: 12, color: "#aaa" }}>
              Instant confirmation. Secure payment. Cancel anytime, no awkward
              questions.
            </p>
            <Button
              asChild
              className="mt-4 rounded-full bg-brand-600 text-white hover:bg-brand-700"
            >
              <Link href="/mentors">Book a 40 min call</Link>
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Planning your full journey?{" "}
          <Link
            href="/mentors"
            className="font-semibold text-brand-600 hover:underline"
          >
            Save with our mentor bundle →
          </Link>
        </p>
      </div>
    </section>
  );
}
