const COMPARE = [
  {
    them: "Forums & Reddit",
    problem: "Slow replies, conflicting opinions, no accountability",
    us: "Book verified students and get a clear plan in one call",
  },
  {
    them: "Cold DMs",
    problem: "Low response rates, awkward asks, scattered advice",
    us: "One‑click booking with prepared mentors who want to help",
  },
  {
    them: "Agencies",
    problem: "Biased towards partner schools, expensive packages",
    us: "Student‑first, unbiased guidance with transparent pricing",
  },
  {
    them: "YouTube / Blogs",
    problem: "Generic content, not tailored to you",
    us: "Advice for your exact profile, country, and goals",
  },
];

export function ComparisonSection() {
  return (
    <section style={{ background: "#fff", padding: "5rem 0" }}>
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Stop Taking Random Advice
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Why we&apos;re not the rest.
          </p>
        </div>

        <div
          className="mx-auto"
          style={{
            maxWidth: 800,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid #eee",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "#f9fafb",
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#666" }}>
              The Alternative
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#C1113F" }}>
              AbroadMates ✓
            </span>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                padding: "1.25rem 1.5rem",
                borderBottom:
                  i < COMPARE.length - 1 ? "1px solid #f0f0f0" : "none",
                background: i % 2 === 0 ? "#fff" : "#fafafa",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontWeight: 700, fontSize: 14, color: "#111" }}
                  >
                    {row.them}
                  </span>
                  <span
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Problem
                  </span>
                </div>
                <p style={{ marginTop: 6, fontSize: 13, color: "#777" }}>
                  {row.problem}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                  {row.us}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
