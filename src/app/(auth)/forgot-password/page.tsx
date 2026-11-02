"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/api/auth";
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

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSettled: () => {
      // Always show success regardless of outcome — never reveal whether email exists
      setSubmitted(true);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Check your inbox</h1>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p>
            If that email is registered, a reset link is on its way. Check your spam folder if you
            don&apos;t see it within a few minutes.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Forgot your password?</h1>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
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
            className="w-full"
            size="lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send reset link
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
