"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users,
  Video,
  Wand2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { api } from "@/lib/api/client";

// ── Notification types ─────────────────────────────────────────────────────

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  items: Notification[];
  unreadCount: number;
}

// ── Navigation arrays ──────────────────────────────────────────────────────

const STUDENT_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/student/sessions", label: "My Bookings", icon: BookOpen },
  { href: "/mentors", label: "Find a Mentor", icon: Users },
  { href: "/student/group-sessions", label: "Group Sessions", icon: Video },
  { href: "/student/saved-mentors", label: "Saved Mentors", icon: Heart },
  { href: "/student/profile", label: "Profile", icon: UserRound },
];

const MENTOR_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/availability", label: "Availability", icon: CalendarDays },
  { href: "/mentor/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/mentor/sessions", label: "Sessions", icon: Video },
  { href: "/mentor-onboarding", label: "Onboarding Wizard", icon: Wand2 },
];

// ── NotificationsBell ──────────────────────────────────────────────────────

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationsResponse> => {
      const res = await api.get<{ success: boolean; data: unknown }>("/notifications", {
        params: { limit: 20 },
      });
      const d = res.data.data as Record<string, unknown>;
      const items = Array.isArray(d.notifications)
        ? d.notifications
        : Array.isArray(d)
        ? (d as unknown[])
        : [];
      const unreadCount = typeof d.unreadCount === "number" ? d.unreadCount : 0;
      return {
        items: (items as Record<string, unknown>[]).map((n) => ({
          id: typeof n.id === "number" ? n.id : 0,
          message:
            typeof n.message === "string"
              ? n.message
              : typeof n.body === "string"
              ? n.body
              : "",
          read: typeof n.read === "boolean" ? n.read : Boolean(n.isRead),
          createdAt: typeof n.createdAt === "string" ? n.createdAt : "",
        })),
        unreadCount,
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data?.unreadCount ?? 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-brand-600"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!data || data.items.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {data.items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b px-3 py-2.5 text-sm last:border-0",
                  !n.read && "bg-brand-50"
                )}
              >
                <p className={cn(!n.read && "font-medium")}>{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── DashboardShell ─────────────────────────────────────────────────────────

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
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

          <div className="ml-auto flex items-center gap-2">
            <NotificationsBell />

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
                <DropdownMenuLabel>
                  {isMentor ? "Mentor account" : "Student account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard /> Overview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
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
