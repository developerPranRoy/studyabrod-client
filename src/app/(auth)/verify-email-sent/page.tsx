"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const COOLDOWN_SECONDS = 60;

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mutation = useMutation({
    mutationFn: resendVerification,
    onSettled: () => {
      // Always show success regardless of outcome
      setResent(true);
      setCountdown(COOLDOWN_SECONDS);
    },
  });

  useEffect(() => {
    if (countdown <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [countdown]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailParam },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Check your inbox!</h1>
        <p className="text-muted-foreground">
          We sent a verification link to{" "}
          {emailParam ? (
            <span className="font-semibold text-foreground">{emailParam}</span>
          ) : (
            "your email address"
          )}
          . Click the link to activate your account.
        </p>
      </div>

      {resent && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p>Verification email sent! Check your spam folder too.</p>
        </div>
      )}

      <Link
        href="/login"
        className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Go to login
      </Link>

      <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-4">
        <p className="text-sm font-semibold">Didn&apos;t receive it?</p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={mutation.isPending || countdown > 0}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend verification email"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailSentContent />
    </Suspense>
  );
}
