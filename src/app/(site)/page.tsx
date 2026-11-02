import { HeroSection }           from "@/components/home/hero-section";
import { WhatIsSection }         from "@/components/home/what-is-section";
import { StatsSection }          from "@/components/home/stats-section";
import { ComparisonSection }     from "@/components/home/comparison-section";
import { BookingPlansSection }   from "@/components/home/booking-plans-section";
import { ExploreSection }        from "@/components/home/explore-section";
import { MentorShowcaseSection } from "@/components/home/mentor-showcase-section";
import { DestinationsSection }   from "@/components/home/destinations-section";
import { FaqSection }            from "@/components/home/faq-section";
import { CtaBannerSection }      from "@/components/home/cta-banner-section";

export default function HomePage() {
  return (
    <div style={{ overflowX: "hidden" }}>
      <HeroSection />           {/* 1 — Full-viewport hero with photo cards */}
      <WhatIsSection />         {/* 2 — What is AbroadMates */}
      <StatsSection />          {/* 3 — 4.8★ / 93% stats */}
      <ComparisonSection />     {/* 4 — Stop Taking Random Advice table */}
      <BookingPlansSection />   {/* 5 — 20 min / 40 min call cards */}
      <ExploreSection />        {/* 6 — Countries / Scholarships / Help / Sessions grid */}
      <MentorShowcaseSection /> {/* 7 — Auto-scrolling mentor strip */}
      <DestinationsSection />   {/* 8 — Countries & Scholarships lists */}
      <FaqSection />            {/* 9 — FAQ accordion */}
      <CtaBannerSection />      {/* 10 — Final CTA banner */}
    </div>
  );
}
