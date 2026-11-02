"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground" role="status">
      <Loader2 className={cn("h-5 w-5 animate-spin text-brand-600", className)} />
      {label ? <span className="text-sm">{label}</span> : <span className="sr-only">Loading</span>}
    </div>
  );
}
