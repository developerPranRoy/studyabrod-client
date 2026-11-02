"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { mentorsExportUrl } from "@/lib/api/mentors";
import { downloadFile } from "@/lib/download";
import { useAuth } from "@/store/auth-store";
import type { MentorFilters } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Exports the current mentor list (respecting active filters) as Excel or PDF. */
export function ExportMentorsButton({ filters }: { filters: MentorFilters }) {
  const { isAuthenticated, hasHydrated } = useAuth();
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);

  if (!hasHydrated || !isAuthenticated) return null;

  const run = async (format: "excel" | "pdf") => {
    setBusy(format);
    try {
      await downloadFile(
        mentorsExportUrl(format, filters),
        format === "excel" ? "mentors.xlsx" : "mentors.pdf"
      );
      toast.success(`${format === "excel" ? "Excel" : "PDF"} export downloaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={busy !== null}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => run("excel")}>
          <FileSpreadsheet className="text-emerald-600" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("pdf")}>
          <FileDown className="text-brand-600" /> PDF (.pdf)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
