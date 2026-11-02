"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Briefcase, GraduationCap, HandHeart, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { isObj, num, str } from "@/lib/api/dto";
import { useAllCountries } from "@/hooks/use-lookups";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// ================================================================== types ==

type ExperienceKind = "WORK" | "ACADEMIC" | "VOLUNTEER";

interface ExperienceItem {
  kind: ExperienceKind;
  title: string;
  organization?: string;
  startYear: number;
  endYear?: number;
}

interface MentorProfileDetail {
  firstName: string;
  middleName?: string;
  lastName: string;
  nationalityId?: number;
  sellingPoint?: string;
  phone?: string;
  experiences?: ExperienceItem[];
}

// ================================================================== query keys ==

const PROFILE_DETAIL_KEY = ["mentors", "me", "profile-detail"] as const;

// ================================================================== API helpers ==

function parseMentorProfileDetail(raw: unknown): MentorProfileDetail {
  if (!isObj(raw)) return { firstName: "", lastName: "" };
  return {
    firstName: str(raw.firstName) ?? str(raw.first_name) ?? "",
    middleName: str(raw.middleName) ?? str(raw.middle_name) ?? undefined,
    lastName: str(raw.lastName) ?? str(raw.last_name) ?? "",
    nationalityId: num(raw.nationalityId) ?? num(raw.nationality_id) ?? undefined,
    sellingPoint: str(raw.sellingPoint) ?? str(raw.selling_point) ?? undefined,
    phone: str(raw.phone) ?? undefined,
    experiences: parseExperiences(raw.experiences),
  };
}

function parseExperienceKind(v: unknown): ExperienceKind {
  if (v === "WORK" || v === "ACADEMIC" || v === "VOLUNTEER") return v;
  return "WORK";
}

function parseExperiences(raw: unknown): ExperienceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isObj)
    .map((r) => ({
      kind: parseExperienceKind(r.kind),
      title: str(r.title) ?? "",
      organization: str(r.organization) ?? undefined,
      startYear: num(r.startYear) ?? num(r.start_year) ?? new Date().getFullYear(),
      endYear: num(r.endYear) ?? num(r.end_year) ?? undefined,
    }))
    .filter((e) => e.title.length > 0);
}

// ================================================================== schemas ==

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  nationalityId: z.number({ invalid_type_error: "Select a nationality" }).positive("Select a nationality"),
  sellingPoint: z.string().min(10, "At least 10 characters").max(500, "Max 500 characters"),
  phone: z.string().min(1, "Phone number is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const experienceSchema = z.object({
  kind: z.enum(["WORK", "ACADEMIC", "VOLUNTEER"]),
  title: z.string().min(1, "Title is required"),
  organization: z.string().optional(),
  startYear: z.coerce
    .number({ invalid_type_error: "Enter a year" })
    .int()
    .min(1950, "Year must be 1950 or later")
    .max(new Date().getFullYear() + 5, "Year is too far in the future"),
  endYear: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 5)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

// ================================================================== KIND icons / labels ==

const KIND_CONFIG: Record<ExperienceKind, { label: string; icon: React.ElementType }> = {
  WORK: { label: "Work", icon: Briefcase },
  ACADEMIC: { label: "Academic", icon: GraduationCap },
  VOLUNTEER: { label: "Volunteer", icon: HandHeart },
};

// ================================================================== ProfileInfoTab ==

function ProfileInfoTab({ profile }: { profile: MentorProfileDetail | undefined }) {
  const qc = useQueryClient();
  const { data: countries } = useAllCountries();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      nationalityId: undefined as unknown as number,
      sellingPoint: "",
      phone: "",
    },
  });

  // Hydrate once the profile data arrives
  const hydratedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!profile) return;
    const key = `${profile.firstName}|${profile.lastName}`;
    if (hydratedFor.current === key) return;
    hydratedFor.current = key;
    form.reset({
      firstName: profile.firstName,
      middleName: profile.middleName ?? "",
      lastName: profile.lastName,
      nationalityId: profile.nationalityId ?? (undefined as unknown as number),
      sellingPoint: profile.sellingPoint ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile, form]);

  const updateProfile = useMutation({
    mutationFn: (input: ProfileFormValues) =>
      api.put("/mentors/me/profile", input).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PROFILE_DETAIL_KEY });
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(e.message),
  });

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="Rahim" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle name <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Uddin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+880 1XXX-XXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nationalityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your nationality" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(countries ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
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
          name="sellingPoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selling point</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="What makes you the right mentor? Min 10, max 500 characters."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </Form>
  );
}

// ================================================================== ExperienceDialog ==

interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ExperienceFormValues | null;
  onSubmit: (values: ExperienceFormValues) => void;
  isPending: boolean;
}

function ExperienceDialog({ open, onOpenChange, initial, onSubmit, isPending }: ExperienceDialogProps) {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      kind: "WORK",
      title: "",
      organization: "",
      startYear: new Date().getFullYear(),
      endYear: undefined,
    },
  });

  // Reset form when dialog opens/closes or the initial values change
  useEffect(() => {
    if (open) {
      form.reset(
        initial
          ? {
              kind: initial.kind,
              title: initial.title,
              organization: initial.organization ?? "",
              startYear: initial.startYear,
              endYear: initial.endYear,
            }
          : {
              kind: "WORK",
              title: "",
              organization: "",
              startYear: new Date().getFullYear(),
              endYear: undefined,
            }
      );
    }
  }, [open, initial, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit experience" : "Add experience"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="experience-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WORK">Work</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Company / University" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End year <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Present"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button form="experience-form" type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? "Save changes" : "Add experience"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ================================================================== ExperiencesTab ==

function ExperiencesTab({ profile }: { profile: MentorProfileDetail | undefined }) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const experiences = profile?.experiences ?? [];

  const updateExperiences = useMutation({
    mutationFn: (items: ExperienceItem[]) =>
      api.put("/mentors/me/experiences", { experiences: items }).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PROFILE_DETAIL_KEY });
      toast.success("Experiences updated");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleAdd(values: ExperienceFormValues) {
    const newItem: ExperienceItem = {
      kind: values.kind,
      title: values.title,
      organization: values.organization || undefined,
      startYear: values.startYear,
      endYear: values.endYear,
    };
    updateExperiences.mutate([...experiences, newItem], {
      onSuccess: () => setDialogOpen(false),
    });
  }

  function handleEdit(values: ExperienceFormValues) {
    if (editIndex === null) return;
    const updated = experiences.map((exp, i) =>
      i === editIndex
        ? {
            kind: values.kind,
            title: values.title,
            organization: values.organization || undefined,
            startYear: values.startYear,
            endYear: values.endYear,
          }
        : exp
    );
    updateExperiences.mutate(updated, {
      onSuccess: () => {
        setDialogOpen(false);
        setEditIndex(null);
      },
    });
  }

  function handleDelete(index: number) {
    const confirmed = window.confirm("Delete this experience?");
    if (!confirmed) return;
    updateExperiences.mutate(experiences.filter((_, i) => i !== index));
  }

  function openAddDialog() {
    setEditIndex(null);
    setDialogOpen(true);
  }

  function openEditDialog(index: number) {
    setEditIndex(index);
    setDialogOpen(true);
  }

  const editingValues =
    editIndex !== null && experiences[editIndex]
      ? {
          kind: experiences[editIndex].kind,
          title: experiences[editIndex].title,
          organization: experiences[editIndex].organization ?? "",
          startYear: experiences[editIndex].startYear,
          endYear: experiences[editIndex].endYear,
        }
      : null;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Work, academic and volunteer experiences shown on your public profile.
        </p>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experiences added yet"
          description="Add your work, academic or volunteer experiences to strengthen your profile."
          action={
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Add experience
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3" aria-label="Experiences list">
          {experiences.map((exp, i) => {
            const config = KIND_CONFIG[exp.kind];
            const Icon = config.icon;
            return (
              <li
                key={i}
                className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{exp.title}</p>
                    {exp.organization && (
                      <p className="text-sm text-muted-foreground">{exp.organization}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="mr-2 rounded-full bg-muted px-2 py-0.5 font-medium">
                        {config.label}
                      </span>
                      {exp.startYear}
                      {exp.endYear ? ` – ${exp.endYear}` : " – Present"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${exp.title}`}
                    onClick={() => openEditDialog(i)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${exp.title}`}
                    className="text-destructive hover:text-destructive"
                    disabled={updateExperiences.isPending}
                    onClick={() => handleDelete(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ExperienceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditIndex(null);
        }}
        initial={editingValues}
        onSubmit={editIndex !== null ? handleEdit : handleAdd}
        isPending={updateExperiences.isPending}
      />
    </div>
  );
}

// ================================================================== page ==

export default function MentorProfilePage() {
  const { data: raw, isLoading, isError, error, refetch } = useQuery({
    queryKey: PROFILE_DETAIL_KEY,
    queryFn: () => api.get("/mentors/me").then((r) => r.data.data),
  });

  const profile = raw !== undefined ? parseMentorProfileDetail(raw) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mentor Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details and experiences.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading profile">
          <Skeleton className="h-10 w-72" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load your profile"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : (
        <Tabs defaultValue="profile">
          <TabsList aria-label="Profile sections">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="experiences">Experiences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Info</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileInfoTab profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experiences">
            <Card>
              <CardHeader>
                <CardTitle>Experiences</CardTitle>
              </CardHeader>
              <CardContent>
                <ExperiencesTab profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
