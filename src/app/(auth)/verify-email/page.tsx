"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Suspense } from "react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
      })
      .catch((err: { message?: string }) => {
        setStatus("error");
        setMessage(err.message ?? "This link is invalid or has already been used.");
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {status === "loading" && (
        <>
          <Loader2 className="h-16 w-16 animate-spin text-brand-600" />
          <h1 className="text-2xl font-extrabold">Verifying your email…</h1>
          <p className="text-muted-foreground">Just a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold">Email verified!</h1>
          <p className="text-muted-foreground">
            Your account is active. You can now log in and start your journey.
          </p>
          <Button asChild size="lg" className="rounded-full bg-brand-600 px-10 hover:bg-brand-700">
            <Link href="/login">Log in to AbroadMates</Link>
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-extrabold">Verification failed</h1>
          <p className="text-muted-foreground">
            {message || "This link is invalid or has already been used."}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Button asChild size="lg" className="rounded-full bg-brand-600 px-10 hover:bg-brand-700">
              <Link href="/login">Go to login</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/verify-email-sent">Resend verification email</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="rounded-full">
              <Link href="/register">Create a new account</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-600" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
