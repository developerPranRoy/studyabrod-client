"use client";

import Link from "next/link";
import { CalendarClock, Loader2 } from "lucide-react";
import { useCancelBooking } from "@/hooks/use-bookings";
import { formatDateTime, formatPrice, initials, isPast } from "@/lib/utils";
import type { Booking } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const STATUS_VARIANT: Record<string, "success" | "warning" | "muted" | "destructive"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELLED: "muted",
  COMPLETED: "muted",
};

export function BookingRow({ booking }: { booking: Booking }) {
  const cancel = useCancelBooking();
  const cancellable = !isPast(booking.scheduledAt) && booking.status !== "CANCELLED";

  return (
    <Card className="flex flex-wrap items-center gap-4 p-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={booking.mentorPhotoUrl ?? undefined} alt={booking.mentorName} />
        <AvatarFallback>{initials(booking.mentorName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {booking.durationMin ? `${booking.durationMin} min call` : "Call"} with {booking.mentorName}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          {formatDateTime(booking.scheduledAt)}
          {booking.price != null && <span>· {formatPrice(booking.price)}</span>}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[booking.status] ?? "muted"}>{booking.status.toLowerCase()}</Badge>
      {cancellable && (
        <ConfirmDialog
          title="Cancel this booking?"
          description={`Your ${booking.durationMin ?? ""} min call with ${booking.mentorName} will be cancelled. This can't be undone.`}
          confirmLabel="Cancel booking"
          destructive
          onConfirm={() => cancel.mutate(booking.id)}
          trigger={
            <Button variant="outline" size="sm" disabled={cancel.isPending}>
              {cancel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Cancel
            </Button>
          }
        />
      )}
      {booking.mentorId != null && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/mentors/${booking.mentorId}`}>View mentor</Link>
        </Button>
      )}
    </Card>
  );
}
