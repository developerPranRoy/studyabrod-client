"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { useLogin } from "@/hooks/use-auth-actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
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
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const verify = searchParams.get("verify") === "1";
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Mentees and mentors use the same login to access their dashboard.
        </p>
      </div>

      {/* Verification banner — shown after register redirect */}
      {verify && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p>
            <span className="font-semibold">Check your inbox!</span> We sent you a verification
            link. Click it to activate your account, then log in here.
          </p>
        </div>
      )}

      {/* Google Sign-In */}
      <GoogleSignInButton label="Sign in with Google" />

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => login.mutate({ ...values, next }))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      autoComplete="current-password"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
            {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Log in
          </Button>
        </form>
      </Form>

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Sign up as a student
          </Link>
        </p>
        <p>
          Want to guide students?{" "}
          <Link href="/register?role=mentor" className="font-semibold text-brand-600 hover:underline">
            Join as a mentor
          </Link>
        </p>
      </div>
    </div>
  );
}
