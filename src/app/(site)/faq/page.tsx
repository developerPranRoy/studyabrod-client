import type { Metadata } from "next";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about AbroadMates mentors, bookings, and group sessions.",
};

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is AbroadMates?",
    a: "AbroadMates connects you with real students and alumni who already study at the universities you're aiming for. Instead of paying an agency, you book short 1:1 calls with mentors who have first-hand experience with applications, visas, budgets, and scholarships.",
  },
  {
    q: "How do I book a call with a mentor?",
    a: "Create a free student account, open any mentor's profile, pick a 20 or 40 minute plan, and choose a time. The booking appears immediately on your My Bookings page — no page reloads, no waiting.",
  },
  {
    q: "How much does a call cost?",
    a: "Mentors set their own prices per plan, so you'll always see the exact price on their profile before you book. Group sessions are free.",
  },
  {
    q: "What's the difference between 20 and 40 minute calls?",
    a: "A 20 minute call is great for focused questions (shortlisting, quick reviews). A 40 minute call gives you time for deeper topics like SOP feedback, scholarship strategy, or a full application walkthrough.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. Open My Bookings and cancel any upcoming booking with one click — it updates instantly.",
  },
  {
    q: "What are group sessions?",
    a: "Group sessions are free live events hosted by mentors: workshops, Q&As, and scholarship deep-dives. Register with one click. Registration closes automatically once the session date has passed.",
  },
  {
    q: "How do I become a mentor?",
    a: "Register with a mentor account, then complete your profile: headline, bio, the country and university you study at, your program, any scholarship you won, and your plans (20/40 min calls with prices). You can also upload a profile photo and your CV.",
  },
  {
    q: "Can I export the mentor list?",
    a: "Yes — signed-in users can export the current mentor list (including active filters) to Excel or PDF from the Find a Mentor page.",
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="bg-brand-50 border-b">
        <div className="container py-14 text-center">
          <h1 className="font-script text-5xl sm:text-6xl text-brand-600">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Everything students and mentors ask us most often.
          </p>
        </div>
      </section>

      <div className="container max-w-3xl py-12">
        <Accordion type="single" collapsible className="rounded-xl border bg-card px-5">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 rounded-xl bg-brand-50 p-6 text-center">
          <p className="font-semibold">Still have questions?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The fastest way to get an answer is to ask a mentor directly.
          </p>
          <Button asChild className="mt-4">
            <Link href="/mentors">Find a mentor</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
