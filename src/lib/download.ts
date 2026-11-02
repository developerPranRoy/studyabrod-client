import { useAuthStore } from "@/store/auth-store";

/**
 * Authenticated file download: fetches a protected endpoint as a blob and
 * triggers a browser download. Used for the mentor CV and Excel/PDF exports.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const token = useAuthStore.getState().token;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    let message = "Download failed. Please try again.";
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition");
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = match?.[1] ?? filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
