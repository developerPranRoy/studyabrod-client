"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGoogleLogin } from "@/hooks/use-auth-actions";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  label?: string;
}

export function GoogleSignInButton({ label = "Continue with Google" }: GoogleSignInButtonProps) {
  const googleLogin = useGoogleLogin();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setNotConfigured(true);
      return;
    }

    // Load the Google Identity Services script once
    if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !GOOGLE_CLIENT_ID) return;

    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        googleLogin.mutate(response.credential);
      },
      cancel_on_tap_outside: true,
    });

    window.google?.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: containerRef.current.offsetWidth || 400,
      text: label === "Continue with Google" ? "continue_with" : "signin_with",
      shape: "pill",
    });
  }, [scriptLoaded, label, googleLogin]);

  if (notConfigured) return null;

  return (
    <div className="relative w-full">
      {googleLogin.isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-white/80">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
