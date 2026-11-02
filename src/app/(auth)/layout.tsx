import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Compass, HeartHandshake, ShieldCheck } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: "Find your direction",
    text: "Turn broad ambitions into a clear study-abroad plan.",
  },
  {
    icon: HeartHandshake,
    title: "Learn from real journeys",
    text: "Connect with mentors who already walked the path.",
  },
  {
    icon: ShieldCheck,
    title: "Move with confidence",
    text: "Make each application decision with the right support.",
  },
];

/** Split-screen auth chrome: brand panel left, form right — mirrors abroadmates.com. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-600 p-10 text-white lg:flex">
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full border-[3rem] border-white/10" />
        <Link href="/" aria-label="AbroadMates home">
          <Logo light />
        </Link>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
            Your next chapter
            <span className="font-script block text-amber-300">
              starts right here.
            </span>
          </h1>
          <p className="max-w-md text-white/85">
            From choosing the right country to submitting a strong application,
            build your journey with guidance from people who have done it
            before.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
            >
              <h.icon className="mb-2 h-5 w-5 text-amber-300" />
              <p className="text-sm font-semibold">{h.title}</p>
              <p className="mt-1 text-xs text-white/75">{h.text}</p>
            </div>
          ))}
        </div>
      </aside>
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
