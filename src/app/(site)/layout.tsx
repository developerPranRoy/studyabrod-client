import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MentorPopup } from "@/components/shared/mentor-popup";

/** Shared chrome for the public marketing/browsing pages. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Auto-opens after 10s — find your perfect mentor popup */}
      <MentorPopup />
    </div>
  );
}
