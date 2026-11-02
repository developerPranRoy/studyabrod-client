import Link from "next/link";

export function CtaBannerSection() {
  return (
    <section style={{ background: "#fff", padding: "4rem 0" }}>
      <div className="container">
        <div style={{ background: "#C1113F", borderRadius: 24, padding: "4rem 2rem", textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60,  right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: -80, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <h2 className="font-accent relative" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, lineHeight: 1.2 }}>
            Your next chapter starts with one conversation.
          </h2>
          <p style={{ position: "relative", marginTop: 12, opacity: 0.85, maxWidth: 480, margin: "12px auto 0" }}>
            Create a free account, book a call, and get answers no brochure will tell you.
          </p>
          <div style={{ position: "relative", marginTop: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            <Link href="/register" style={{ background: "#fff", color: "#C1113F", borderRadius: 999, padding: "0.75rem 2rem", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              Join as a student
            </Link>
            <Link href="/register?role=mentor" style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.6)", borderRadius: 999, padding: "0.75rem 2rem", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              Become a mentor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
