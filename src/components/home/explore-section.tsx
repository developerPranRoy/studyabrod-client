import Link from "next/link";
import {
  Globe2,
  GraduationCap,
  Users,
  CalendarCheck2,
  ArrowRight,
} from "lucide-react";

const CARDS = [
  {
    href: "/mentors",
    label: "AbroadMates by",
    title: "Countries",
    desc: "Find mentor from your destination. NOW.",
    bg: "#C1113F",
    Icon: Globe2,
  },
  {
    href: "/scholarships",
    label: "AbroadMates by",
    title: "Scholarships",
    desc: "Connect with mentors who received leading global scholarships.",
    bg: "#111",
    Icon: GraduationCap,
  },
  {
    href: "/mentors",
    label: "AbroadMates by",
    title: "Help",
    desc: "Your perfect study buddy, for every step of the journey.",
    bg: "linear-gradient(135deg,#7c3aed,#C1113F)",
    Icon: Users,
  },
  {
    href: "/sessions",
    label: "AbroadMates",
    title: "Group Sessions",
    desc: "Live group sessions with mentors and scholarship winners.",
    bg: "#065f46",
    Icon: CalendarCheck2,
  },
];

export function ExploreSection() {
  return (
    <section style={{ background: "#fff", padding: "5rem 0" }}>
      <div className="container">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <Link key={card.title} href={card.href} className="group block">
              <div
                style={{
                  background: card.bg,
                  borderRadius: 20,
                  padding: "1.75rem",
                  color: "#fff",
                  height: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                className="group-hover:-translate-y-1 group-hover:shadow-xl"
              >
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    padding: 8,
                  }}
                >
                  <card.Icon style={{ width: 22, height: 22 }} />
                </div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    opacity: 0.75,
                    textTransform: "uppercase",
                  }}
                >
                  {card.label}
                </p>
                <h3
                  style={{ fontSize: "1.25rem", fontWeight: 900, marginTop: 4 }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
                  {card.desc}
                </p>
                <ArrowRight
                  style={{
                    width: 16,
                    height: 16,
                    marginTop: 10,
                    transition: "transform 0.2s",
                  }}
                  className="group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
