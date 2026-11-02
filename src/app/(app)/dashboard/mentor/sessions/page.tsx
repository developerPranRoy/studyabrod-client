"use client";

import { useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2, Users } from "lucide-react";
import type { GroupSession } from "@/lib/api/types";
import { useDeleteSession, useSessions } from "@/hooks/use-sessions";
import { categoryLabel } from "@/components/sessions/session-card";
import { SessionFormDialog } from "@/components/sessions/session-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDateTime, isPast } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mentor: create / edit / delete group sessions. Ownership is enforced by the API (403). */
export default function MentorSessionsPage() {
  const { data: upcoming, isLoading, isError, error, refetch } = useSessions("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GroupSession | null>(null);
  const remove = useDeleteSession();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (session: GroupSession) => {
    setEditing(session);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Group sessions</h1>
          <p className="mt-1 text-muted-foreground">
            Host live workshops and Q&As. Students register until the session starts.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New session
        </Button>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : upcoming && upcoming.length ? (
        <div className="space-y-3">
          {upcoming.map((session) => (
            <Card key={session.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{session.title}</p>
                  <Badge variant="secondary">{categoryLabel(session.category)}</Badge>
                  {isPast(session.startsAt) && <Badge variant="muted">Closed</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatDateTime(session.startsAt)} · {session.location ?? "Online"}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {session.registeredCount} registered
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(session)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <ConfirmDialog
                  title="Delete this session?"
                  description={`"${session.title}" and its registrations will be removed.`}
                  confirmLabel="Delete session"
                  destructive
                  onConfirm={() => remove.mutate(session.id)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={remove.isPending}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  }
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming sessions"
          description="Create your first session and students can register right away."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New session
            </Button>
          }
        />
      )}

      <SessionFormDialog open={formOpen} onOpenChange={setFormOpen} session={editing} />
    </div>
  );
}
