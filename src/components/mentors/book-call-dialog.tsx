"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Loader2 } from "lucide-react";
import type { Mentor } from "@/lib/api/types";
import { formatPrice, toDateTimeLocalValue } from "@/lib/utils";
import { useAuth } from "@/store/auth-store";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

/** Book a 20 or 40 min call with a mentor. Handles auth + role gating inline. */
export function BookCallDialog({ mentor, trigger }: { mentor: Mentor; trigger?: React.ReactNode }) {
  const { isAuthenticated, isStudent, hasHydrated } = useAuth();
  const createBooking = useCreateBooking();
  const [open, setOpen] = useState(false);

  const [planId, setPlanId] = useState<string>(String(mentor.plans[0]?.id ?? ""));
  const [when, setWhen] = useState(() =>
    toDateTimeLocalValue(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  );

  const selectedPlan = useMemo(
    () => mentor.plans.find((p) => String(p.id) === planId) ?? mentor.plans[0],
    [mentor.plans, planId]
  );

  if (!hasHydrated) return null;

  // Students only — mentors get guidance, guests get sent to login.
  if (!isAuthenticated) {
    return (
      <Button asChild>
        <Link href={`/login?next=/mentors/${mentor.id}`}>Sign in to book</Link>
      </Button>
    );
  }
  if (!isStudent) {
    return (
      <Button disabled variant="secondary" title="Only students can book calls">
        Bookings are for students
      </Button>
    );
  }
  if (!mentor.plans.length) {
    return (
      <Button disabled variant="secondary">
        No bookable plans
      </Button>
    );
  }

  const submit = () => {
    if (!selectedPlan || !when) return;
    createBooking.mutate(
      { planId: selectedPlan.id, scheduledAt: new Date(when).toISOString() },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Book a call</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a call with {mentor.fullName}</DialogTitle>
          <DialogDescription>
            Pick a plan and a time. You'll see the booking under My Bookings right away.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Session length</Label>
            <RadioGroup value={planId} onValueChange={setPlanId} className="grid gap-2 sm:grid-cols-2">
              {mentor.plans.map((plan) => (
                <Label
                  key={plan.id}
                  htmlFor={`plan-${plan.id}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    String(plan.id) === planId
                      ? "border-brand-500 bg-brand-50"
                      : "hover:border-brand-200"
                  )}
                >
                  <RadioGroupItem value={String(plan.id)} id={`plan-${plan.id}`} />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{plan.durationMin} min call</span>
                    <span className="block text-sm text-brand-600">{formatPrice(plan.price)}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-when">Date &amp; time</Label>
            <Input
              id="booking-when"
              type="datetime-local"
              value={when}
              min={toDateTimeLocalValue(new Date())}
              onChange={(e) => setWhen(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={createBooking.isPending || !when || !selectedPlan}>
            {createBooking.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarClock className="h-4 w-4" />
            )}
            Confirm booking{selectedPlan ? ` · ${formatPrice(selectedPlan.price)}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
