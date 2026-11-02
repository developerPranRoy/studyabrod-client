"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMentors } from "@/hooks/use-mentors";
import { initials } from "@/lib/utils";

const STATIC_MENTORS = [
  { name: "Sabihatun Nowrin", uni: "Macquarie University" },
  { name: "Sancharee Adhikary", uni: "Edith Cowan University" },
  { name: "Tabib Wasit Khan", uni: "Memorial University of Newfoundland" },
  { name: "Sakib Khan", uni: "University of Pécs" },
  { name: "Ariful Islam", uni: "TU Berlin" },
  { name: "Nusrat Jahan", uni: "University of Toronto" },
  { name: "Rakib Hossain", uni: "Uppsala University" },
  { name: "Maliha Chowdhury", uni: "Monash University" },
];

export function MentorShowcaseSection() {
  const { data: mentors, isLoading } = useMentors({
    sort: "top_rated",
    page: 1,
    limit: 8,
  });
  const mentorList =
    !isLoading && mentors && mentors.items.length > 0 ? mentors.items : null;
  const displayList = [
    ...(mentorList ?? STATIC_MENTORS),
    ...(mentorList ?? STATIC_MENTORS),
  ];

  return (
    <section style={{ background: "#fdf2f4", padding: "5rem 0" }}>
      <div className="container text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Meet the Mates Behind AbroadMates
        </h2>
        <p className="font-accent mt-2 text-2xl font-bold text-brand-600">
          Join Our Super Squad of Abroadmates
        </p>
      </div>

      <div
        style={{
          overflow: "hidden",
          marginTop: "2.5rem",
          paddingBottom: "0.5rem",
        }}
      >
        <div
          className="animate-marquee"
          style={{ display: "flex", gap: 16, width: "max-content" }}
        >
          {displayList.map((mentor, i) => {
            const name = "fullName" in mentor ? mentor.fullName : mentor.name;
            const uni =
              "universityName" in mentor
                ? (mentor.universityName ?? "—")
                : mentor.uni;
            const photoUrl = "photoUrl" in mentor ? mentor.photoUrl : null;
            const id = "id" in mentor ? mentor.id : null;
            const rating = "rating" in mentor ? mentor.rating : null;

            const card = (
              <div
                style={{
                  width: 176,
                  flexShrink: 0,
                  background: "#fff",
                  borderRadius: 20,
                  padding: "1.5rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #fdf2f4",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "#fdf2f4",
                      border: "3px solid #f9c6d2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      color: "#C1113F",
                    }}
                  >
                    {initials(name)}
                  </div>
                )}
                {rating != null && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#d97706",
                    }}
                  >
                    <Star
                      style={{
                        width: 12,
                        height: 12,
                        fill: "#fbbf24",
                        color: "#fbbf24",
                      }}
                    />
                    {(rating as number).toFixed(1)}
                  </div>
                )}
                <p
                  style={{
                    marginTop: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {name}
                </p>
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: "#888",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {uni}
                </p>
              </div>
            );

            return id ? (
              <Link key={`ml-${i}`} href={`/mentors/${id}`}>
                {card}
              </Link>
            ) : (
              <div key={`ms-${i}`}>{card}</div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full border-brand-600 px-10 text-brand-600 hover:bg-brand-50"
        >
          <Link href="/register?role=mentor">Become an AbroadMate</Link>
        </Button>
      </div>
    </section>
  );
}
