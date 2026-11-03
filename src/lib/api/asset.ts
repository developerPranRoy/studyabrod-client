import { API_ORIGIN } from "@/lib/api/config";

export function assetUrl(path: string | null | undefined): string | null {
  const value = path?.trim();
  if (!value) return null;
  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  if (!API_ORIGIN) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
}
