"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useUploadMentorCv } from "@/hooks/use-mentors";
import { mentorCvUrl } from "@/lib/api/mentors";
import { downloadFile } from "@/lib/download";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CvUploadCard({
  mentorId,
  hasCv,
  disabled,
}: {
  mentorId: number | null;
  hasCv: boolean;
  disabled: boolean;
}) {
  const upload = useUploadMentorCv();
  const inputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);

  const onPick = (file: File | undefined) => {
    if (!file || !mentorId) return;
    if (file.type !== "application/pdf") return toast.error("Please choose a PDF file");
    if (file.size > 10 * 1024 * 1024) return toast.error("PDF must be under 10 MB");
    upload.mutate({ id: mentorId, file });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">CV (PDF)</CardTitle>
        <CardDescription>Students can download it from your profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            onPick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border p-3 text-sm",
            hasCv ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "text-muted-foreground"
          )}
        >
          <FileText className="h-5 w-5 shrink-0" />
          {hasCv ? "A CV is currently attached." : "No CV uploaded yet."}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {hasCv ? "Replace CV" : "Upload CV"}
          </Button>
          {hasCv && mentorId && (
            <Button
              type="button"
              variant="ghost"
              disabled={downloading}
              onClick={async () => {
                setDownloading(true);
                try {
                  await downloadFile(mentorCvUrl(mentorId), "my-cv.pdf");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Download failed");
                } finally {
                  setDownloading(false);
                }
              }}
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Download
            </Button>
          )}
        </div>
        {disabled && (
          <p className="text-xs text-muted-foreground">Save your profile first to upload.</p>
        )}
      </CardContent>
    </Card>
  );
}
