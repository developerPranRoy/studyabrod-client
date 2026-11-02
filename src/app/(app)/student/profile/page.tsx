"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { useStudentMe, useUpdateStudentMe } from "@/hooks/use-students";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileSkeleton() {
  return (
    <Card className="max-w-lg space-y-5 p-6">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-24" />
    </Card>
  );
}

export default function StudentProfilePage() {
  const { data, isLoading, isError, error, refetch } = useStudentMe();
  const update = useUpdateStudentMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "" },
  });

  useEffect(() => {
    if (data) {
      reset({ firstName: data.firstName, lastName: data.lastName ?? "" });
    }
  }, [data, reset]);

  function onSubmit(values: ProfileFormValues) {
    update.mutate({
      firstName: values.firstName,
      lastName: values.lastName ?? "",
      onboarding: {},
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Update your name and personal details.</p>
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <ProfileSkeleton />
      ) : (
        <Card className="max-w-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">
                  {data?.firstName} {data?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">Student</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="Your first name"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                {...register("firstName")}
              />
              {errors.firstName ? (
                <p id="firstName-error" role="alert" className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Your last name"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                {...register("lastName")}
              />
              {errors.lastName ? (
                <p id="lastName-error" role="alert" className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={update.isPending || !isDirty}>
              {update.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
