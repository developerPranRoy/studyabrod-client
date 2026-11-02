import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const FOOTER_SECTIONS: Array<{
  title: string;
  links: Array<{ href: string; label: string }>;
}> = [
  {
    title: "Platform",
    links: [
      { href: "/mentors", label: "Find a Mentor" },
      { href: "/sessions", label: "Group Sessions" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/register?role=mentor", label: "Become a Mentor" },
    ],
  },
  {
    title: "Students",
    links: [
      { href: "/register", label: "Create account" },
      { href: "/bookings", label: "My Bookings" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/faq", label: "Help Center" },
      { href: "/", label: "About Us" },
      { href: "/", label: "Contact" },
      { href: "/", label: "Privacy Policy" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-brand-950 text-white">
      {/* Main footer content */}
      <div className="container grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* Brand column */}
        <div className="space-y-5">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            Skip the agencies. Talk to real students who already study where you want to go — and
            get honest guidance on universities, budgets, visas, and scholarships.
          </p>
          {/* Social links */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-white/50 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              {section.title}
            </h4>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} AbroadMates. All rights reserved.</p>
          <p className="hidden sm:block">
            Built with Next.js · TanStack Query · shadcn/ui
          </p>
        </div>
      </div>
    </footer>
  );
}
