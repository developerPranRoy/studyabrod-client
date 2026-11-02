"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { mentorCvUrl } from "@/lib/api/mentors";
import { downloadFile } from "@/lib/download";
import { Button } from "@/components/ui/button";

export function CvDownloadButton({ mentorId, disabled }: { mentorId: number; disabled: boolean }) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={disabled || busy}
      title={disabled ? "Sign in to download" : undefined}
      onClick={async () => {
        setBusy(true);
        try {
          await downloadFile(mentorCvUrl(mentorId), `mentor-${mentorId}-cv.pdf`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Download failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {disabled ? "Sign in to download CV" : "Download CV (PDF)"}
    </Button>
  );
}
