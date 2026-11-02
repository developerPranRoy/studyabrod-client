"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth-actions";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const STUDENT_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/bookings", label: "My Bookings", icon: BookOpen },
  { href: "/mentors", label: "Find a Mentor", icon: Users },
  { href: "/sessions", label: "Group Sessions", icon: Video },
];

const MENTOR_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/mentor/profile", label: "My Profile", icon: UserRound },
  { href: "/dashboard/mentor/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/mentors", label: "Browse Mentors", icon: Users },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Shell>{children}</Shell>
    </RequireAuth>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isMentor } = useAuth();
  const logout = useLogout();
  const nav = isMentor ? MENTOR_NAV : STUDENT_NAV;

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex h-16 items-center border-b px-5">
        <Logo />
        <span className="ml-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isMentor ? "Mentor Panel" : "Student Panel"}
        </span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground">
          <Link href="/">
            <Home className="h-4 w-4" /> Back to site
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background lg:block">
        {sidebar}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              {sidebar}
            </SheetContent>
          </Sheet>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials(user?.fullName)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">
                  {user?.fullName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{isMentor ? "Mentor account" : "Student account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard /> Overview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
