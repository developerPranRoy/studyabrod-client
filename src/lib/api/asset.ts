import { API_ORIGIN } from "@/lib/api/config";

/**
 * Public asset URLs (mentor photos, CVs) are returned by the API as relative
 * paths such as "/uploads/photos/abc.jpg". Prefix them with the API origin so
 * they work on the deployed client, which runs on a different host.
 */
export function assetUrl(path: string | null | undefined): string | null {
  const value = path?.trim();
  if (!value) return null;
  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  if (!API_ORIGIN) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
}
