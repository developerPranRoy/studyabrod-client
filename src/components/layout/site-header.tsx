"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth-actions";
import { SearchWizard } from "@/components/shared/search-wizard";

/* ── Nav links — exact match to real abroadmates.com ── */
const NAV_LINKS = [
  { href: "/",          label: "Home",               exact: true  },
  { href: "/mentors",   label: "Talk to Abroadmates", exact: false },
  { href: "/sessions",  label: "Group Sessions",      exact: false },
  { href: "/faq",       label: "Our Manifesto",       exact: false },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Desktop header
───────────────────────────────────────────────────────────────────────────── */
export function SiteHeader() {
  const pathname  = usePathname();
  const { isAuthenticated, isMentor, user, hasHydrated } = useAuth();
  const logout    = useLogout();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [wizardOpen, setWizardOpen]   = useState(false);

  const active = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {wizardOpen && <SearchWizard onClose={() => setWizardOpen(false)} />}

      {/* Floating search button — visible on ALL pages on mobile */}
      <button
        aria-label="Search mentors"
        onClick={() => setWizardOpen(true)}
        className="lg:hidden"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 49,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#C1113F",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(193,17,63,0.4)",
        }}
      >
        <Search style={{ width: 22, height: 22, color: "#fff" }} />
      </button>

      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" aria-label="AbroadMates home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  active(link.href, link.exact)
                    ? "font-semibold text-brand-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-2 lg:flex">
            {!hasHydrated ? (
              <Skeleton className="h-9 w-36" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3 outline-none transition-colors hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={user.fullName} />
                    <AvatarFallback className="bg-brand-100 text-xs font-semibold text-brand-700">
                      {initials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[9rem] truncate text-sm font-medium">
                    {user.fullName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {isMentor ? "Mentor account" : "Student account"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {!isMentor && (
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> My Bookings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isMentor && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/mentor/profile" className="flex items-center gap-2">
                          <Users className="h-4 w-4" /> My Mentor Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/mentor/sessions" className="flex items-center gap-2">
                          <Video className="h-4 w-4" /> My Sessions
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700"
                >
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer — matches real site exactly ── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        onSearchOpen={() => { setMobileOpen(false); setWizardOpen(true); }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Mobile full-screen drawer — pixel-matched to the real abroadmates.com
───────────────────────────────────────────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
  pathname,
  onSearchOpen,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  onSearchOpen: () => void;
}) {
  const { isAuthenticated, isMentor, user, hasHydrated } = useAuth();
  const logout = useLogout();

  const active = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(85vw, 340px)",
          background: "#fff",
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Top row: close button only (top-right), no logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "1rem 1rem 0",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#374151",
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ padding: "1.25rem 1.5rem 0" }}>
          {NAV_LINKS.map((link) => {
            const isActive = active(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                style={{
                  display: "block",
                  padding: "0.65rem 0",
                  fontSize: "1rem",
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#C1113F" : "#111827",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Extra links for logged-in users */}
          {hasHydrated && isAuthenticated && user && (
            <>
              <div style={{ height: 1, background: "#f3f4f6", margin: "1rem 0" }} />
              <Link href="/dashboard" onClick={onClose}
                style={{ display: "block", padding: "0.65rem 0", fontSize: "1rem", color: "#111827", textDecoration: "none" }}>
                Dashboard
              </Link>
              {!isMentor && (
                <Link href="/bookings" onClick={onClose}
                  style={{ display: "block", padding: "0.65rem 0", fontSize: "1rem", color: "#111827", textDecoration: "none" }}>
                  My Bookings
                </Link>
              )}
              {isMentor && (
                <Link href="/dashboard/mentor/profile" onClick={onClose}
                  style={{ display: "block", padding: "0.65rem 0", fontSize: "1rem", color: "#111827", textDecoration: "none" }}>
                  My Mentor Profile
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth buttons — directly below nav links */}
        <div style={{ padding: "1.25rem 1.5rem 0" }}>
          {!hasHydrated ? (
            <div style={{ height: 96, background: "#f3f4f6", borderRadius: 12 }} />
          ) : isAuthenticated && user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f9fafb", borderRadius: 12, padding: "0.75rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fdf2f4", border: "2px solid #f9c6d2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#C1113F", flexShrink: 0 }}>
                  {initials(user.fullName)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.fullName}
                  </p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>{isMentor ? "Mentor" : "Student"}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); onClose(); }}
                style={{ width: "100%", padding: "0.75rem", borderRadius: 999, border: "1.5px solid #e5e7eb", background: "#fff", color: "#dc2626", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Log In — outlined pill */}
              <Link
                href="/login"
                onClick={onClose}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: 999,
                  border: "1.5px solid #d1d5db",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textAlign: "center",
                  textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                Log In
              </Link>
              {/* Sign Up — solid red pill */}
              <Link
                href="/register"
                onClick={onClose}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: 999,
                  background: "#C1113F",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textAlign: "center",
                  textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Floating red search button — bottom-right corner, visible over the drawer */}
      <button
        aria-label="Search mentors"
        onClick={onSearchOpen}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 52,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#C1113F",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(193,17,63,0.4)",
        }}
      >
        <Search style={{ width: 22, height: 22, color: "#fff" }} />
      </button>
    </>
  );
}
