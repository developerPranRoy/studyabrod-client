export function StatsSection() {
  return (
    <section style={{ background: "#fdf2f4", padding: "4rem 0" }}>
      <div className="container">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-10 text-center sm:grid-cols-2">
          <div>
            <p className="text-6xl font-black text-brand-600">4.8★</p>
            <p className="mt-2 text-lg font-bold">Average Session Rating</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Students love us for clear answers, real support, and results that matter.
            </p>
          </div>
          <div>
            <p className="text-6xl font-black text-brand-600">93%</p>
            <p className="mt-2 text-lg font-bold">come back for round two.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mentorship that builds lasting relationships.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
