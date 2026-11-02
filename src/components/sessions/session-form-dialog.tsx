"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { GroupSession } from "@/lib/api/types";
import { toDateTimeLocalValue } from "@/lib/utils";
import { useSaveSession } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["WORKSHOP", "QA", "SCHOLARSHIPS", "WEBINAR", "GENERAL"] as const;

const schema = z
  .object({
    title: z.string().min(3, "Give the session a title"),
    description: z.string().min(10, "Add a short description"),
    category: z.string().min(1, "Pick a category"),
    location: z.string().min(2, "Add a location (e.g. Online)"),
    startsAt: z.string().min(1, "Pick a start time"),
    endsAt: z.string().min(1, "Pick an end time"),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    path: ["endsAt"],
    message: "End must be after the start",
  });

type FormValues = z.infer<typeof schema>;

export function SessionFormDialog({
  open,
  onOpenChange,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: GroupSession | null; // null → create mode
}) {
  const save = useSaveSession();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "WORKSHOP",
      location: "Online",
      startsAt: "",
      endsAt: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: session?.title ?? "",
        description: session?.description ?? "",
        category: session?.category ?? "WORKSHOP",
        location: session?.location ?? "Online",
        startsAt: session?.startsAt ? toDateTimeLocalValue(new Date(session.startsAt)) : "",
        endsAt: session?.endsAt ? toDateTimeLocalValue(new Date(session.endsAt)) : "",
      });
    }
  }, [open, session, form]);

  const onSubmit = (values: FormValues) => {
    save.mutate(
      {
        id: session?.id ?? null,
        payload: {
          title: values.title,
          description: values.description,
          category: values.category,
          location: values.location,
          startsAt: new Date(values.startsAt).toISOString(),
          endsAt: new Date(values.endsAt).toISOString(),
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{session ? "Edit group session" : "Create group session"}</DialogTitle>
          <DialogDescription>
            Sessions show up on the Group Sessions page; students can register until the start time.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Scholarship Q&A with mentors" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What will students get out of this session?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Online" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts at</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends at</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {session ? "Save changes" : "Create session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
