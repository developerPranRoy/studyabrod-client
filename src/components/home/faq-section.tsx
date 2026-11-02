import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is AbroadMates?",
    a: "AbroadMates connects you with real students who already study at your dream school. Book a 20 or 40 minute call and get honest answers — no agencies, no bias.",
  },
  {
    q: "How do I book a call?",
    a: "Create a free account, browse mentors, pick a plan and a time. Your booking appears instantly on My Bookings — no page reload.",
  },
  {
    q: "How much does it cost?",
    a: "Mentors set their own prices. You see the exact amount before you book. Group sessions are always free.",
  },
  {
    q: "What are Group Sessions?",
    a: "Free live workshops and Q&As on scholarships, visas, and life abroad. Register with one click — closes automatically once the session date passes.",
  },
  {
    q: "How do I become a mentor?",
    a: "Register with a mentor account, complete your profile, upload a photo and CV, set your 20 and 40 min prices, and start helping students.",
  },
];

export function FaqSection() {
  return (
    <section style={{ background: "#fdf2f4", padding: "5rem 0" }}>
      <div className="container" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="mt-10 rounded-2xl border bg-white px-6 shadow-card"
        >
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
