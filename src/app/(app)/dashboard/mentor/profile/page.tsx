"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth-store";
import { useCountries, usePrograms, useScholarships, useUniversities } from "@/hooks/use-lookups";
import {
  useDeleteMentorProfile,
  useMyMentorProfile,
  useSaveMentorProfile,
} from "@/hooks/use-mentors";
import { ApiError } from "@/lib/api/client";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { PhotoUploadCard } from "@/components/dashboard/photo-upload-card";
import { CvUploadCard } from "@/components/dashboard/cv-upload-card";

const NONE = "__none__";
const DURATIONS = [20, 40] as const;

const planSchema = z.object({
  durationMin: z.coerce.number().refine((v) => DURATIONS.includes(v as 20 | 40), "Pick 20 or 40"),
  price: z.coerce.number().positive("Price must be greater than 0").max(10000, "Price looks too high"),
});

const schema = z.object({
  headline: z.string().min(5, "Give your profile a short headline").max(120),
  bio: z.string().min(20, "Tell students a bit more (min 20 characters)").max(2000),
  countryId: z.coerce.number({ invalid_type_error: "Select a country" }).positive("Select a country"),
  universityName: z.string().min(2, "Select your university"),
  programId: z.coerce.number({ invalid_type_error: "Select a program" }).positive("Select a program"),
  scholarshipId: z.coerce.number().positive().nullable().or(z.literal(NONE)).transform((v) => (v === NONE ? null : v)),
  plans: z
    .array(planSchema)
    .min(1, "Add at least one plan")
    .max(2, "Only 20 and 40 minute plans are supported")
    .refine((plans) => new Set(plans.map((p) => p.durationMin)).size === plans.length, {
      message: "Each duration can only appear once",
    }),
});

type FormValues = z.input<typeof schema>;

export default function MentorProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const profileQuery = useMyMentorProfile(true);
  const profile = profileQuery.data;
  const profileExists = Boolean(profile?.id);

  const { data: countries } = useCountries();
  const { data: programs } = usePrograms();
  const { data: scholarships } = useScholarships();

  const save = useSaveMentorProfile();
  const remove = useDeleteMentorProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      headline: "",
      bio: "",
      countryId: undefined as unknown as number,
      universityName: "",
      programId: undefined as unknown as number,
      scholarshipId: NONE,
      plans: [{ durationMin: 20, price: 10 }],
    },
  });

  const { fields, append, remove: removePlan } = useFieldArray({
    control: form.control,
    name: "plans",
  });

  // University dropdown loads from the real universities API once a country is picked.
  const countryId = form.watch("countryId");
  const universitiesQuery = useUniversities(Number.isFinite(countryId) ? Number(countryId) : null);

  // Fill the form once the existing profile arrives.
  const hydratedFor = useRef<number | null>(null);
  useEffect(() => {
    if (profile && hydratedFor.current !== profile.id) {
      hydratedFor.current = profile.id;
      form.reset({
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        countryId: profile.country?.id ?? (undefined as unknown as number),
        universityName: profile.universityName ?? "",
        programId: profile.program?.id ?? (undefined as unknown as number),
        scholarshipId: profile.scholarship?.id ?? NONE,
        plans: profile.plans.length
          ? profile.plans.map((p) => ({ durationMin: p.durationMin, price: p.price }))
          : [{ durationMin: 20, price: 10 }],
      });
    }
  }, [profile, form]);

  const notFound =
    profileQuery.isError && (profileQuery.error as ApiError).status === 404;

  if (profileQuery.isError && !notFound) {
    return (
      <ErrorState
        title="Couldn't load your mentor profile"
        error={profileQuery.error}
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    const parsed = schema.parse(values);
    save.mutate({
      id: profileExists ? profile!.id : null,
      payload: {
        headline: parsed.headline,
        bio: parsed.bio,
        countryId: parsed.countryId,
        universityName: parsed.universityName,
        programId: parsed.programId,
        scholarshipId: parsed.scholarshipId,
        plans: parsed.plans.map((p) => ({ durationMin: p.durationMin, price: p.price })),
      },
    });
  };

  const universityOptions = universitiesQuery.data ?? [];
  const currentUniversity = form.watch("universityName");
  const universityChoices =
    currentUniversity && !universityOptions.includes(currentUniversity)
      ? [currentUniversity, ...universityOptions]
      : universityOptions;

  const usedDurations = fields.map((f) => Number(f.durationMin));
  const nextDuration = DURATIONS.find((d) => !usedDurations.includes(d));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My mentor profile</h1>
          <p className="mt-1 text-muted-foreground">
            Master–detail: your profile (master) with 20/40 min plans (detail). Everything saves
            instantly — no page reloads.
          </p>
        </div>
        {profileExists && (
          <ConfirmDialog
            title="Delete your mentor profile?"
            description="Students will no longer find you, and your plans will be removed. Your account stays active."
            confirmLabel="Delete profile"
            destructive
            onConfirm={() =>
              remove.mutate(profile!.id, { onSuccess: () => router.push("/dashboard") })
            }
            trigger={
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" /> Delete profile
              </Button>
            }
          />
        )}
      </div>

      {!profileExists && (
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="py-4 text-sm text-brand-800">
            You don&apos;t have a mentor profile yet — fill this in and hit{" "}
            <strong>Create profile</strong>. Photo and CV uploads unlock after the first save.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Master + detail form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>This is what students see on your mentor card.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline</FormLabel>
                      <FormControl>
                        <Input placeholder="Master's mentor at TU Berlin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="How can you help? Shortlisting, SOP feedback, visas, scholarships…"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(v) => {
                            field.onChange(Number(v));
                            // Country changed → the university list reloads, so clear the old pick.
                            form.setValue("universityName", "");
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(countries ?? []).map((country) => (
                              <SelectItem key={country.id} value={String(country.id)}>
                                {country.name}
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
                    name="universityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={!countryId || universitiesQuery.isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !countryId
                                    ? "Pick a country first"
                                    : universitiesQuery.isLoading
                                      ? "Loading universities…"
                                      : "Select university"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {universitiesQuery.isError ? (
                              <SelectItem value="__error" disabled>
                                Couldn&apos;t load universities — retry by re-picking the country
                              </SelectItem>
                            ) : universityChoices.length ? (
                              universityChoices.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="__empty" disabled>
                                No universities found for this country
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Loaded live from the universities API for the selected country.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="programId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(programs ?? []).map((program) => (
                              <SelectItem key={program.id} value={String(program.id)}>
                                {program.name}
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
                    name="scholarshipId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scholarship (optional)</FormLabel>
                        <Select
                          value={field.value == null ? NONE : String(field.value)}
                          onValueChange={(v) => field.onChange(v === NONE ? NONE : Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE}>None</SelectItem>
                            {(scholarships ?? []).map((scholarship) => (
                              <SelectItem key={scholarship.id} value={String(scholarship.id)}>
                                {scholarship.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Plans</CardTitle>
                  <CardDescription>
                    Detail rows — the 20 and 40 minute calls students can book, with your price.
                  </CardDescription>
                </div>
                {nextDuration && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ durationMin: nextDuration, price: nextDuration === 20 ? 10 : 18 })}
                  >
                    <Plus className="h-4 w-4" /> Add {nextDuration} min plan
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_1fr_auto] items-end gap-3 rounded-lg border p-3.5"
                  >
                    <FormField
                      control={form.control}
                      name={`plans.${index}.durationMin`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <Select value={String(f.value)} onValueChange={(v) => f.onChange(Number(v))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DURATIONS.map((d) => (
                                <SelectItem
                                  key={d}
                                  value={String(d)}
                                  disabled={usedDurations.includes(d) && Number(f.value) !== d}
                                >
                                  {d} min call
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
                      name={`plans.${index}.price`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.5" placeholder="12" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove plan"
                      disabled={fields.length === 1}
                      onClick={() => removePlan(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {form.formState.errors.plans?.root?.message ? (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.plans.root.message}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {profileExists ? "Save changes" : "Create profile"}
            </Button>
          </form>
        </Form>

        {/* Uploads */}
        <div className="space-y-6">
          <PhotoUploadCard
            mentorId={profile?.id ?? null}
            photoUrl={profile?.photoUrl ?? null}
            name={user?.fullName ?? ""}
            disabled={!profileExists}
          />
          <CvUploadCard
            mentorId={profile?.id ?? null}
            hasCv={Boolean(profile?.cvUrl)}
            disabled={!profileExists}
          />
        </div>
      </div>
    </div>
  );
}
