"use client";

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUploadMentorPhoto } from "@/hooks/use-mentors";
import { initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PhotoUploadCard({
  mentorId,
  photoUrl,
  name,
  disabled,
}: {
  mentorId: number | null;
  photoUrl: string | null;
  name: string;
  disabled: boolean;
}) {
  const upload = useUploadMentorPhoto();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (file: File | undefined) => {
    if (!file || !mentorId) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose a JPG or PNG image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    upload.mutate({ id: mentorId, file });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile photo</CardTitle>
        <CardDescription>JPG or PNG, shown on your mentor card.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-brand-100">
          <AvatarImage src={photoUrl ?? undefined} alt={name} />
          <AvatarFallback className="text-xl">{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              onPick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {photoUrl ? "Change photo" : "Upload photo"}
          </Button>
          {disabled && (
            <p className="text-xs text-muted-foreground">Save your profile first to upload.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
