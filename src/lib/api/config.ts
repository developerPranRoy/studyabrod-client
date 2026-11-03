const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://studyabrode.onrender.com/api/v1"
    : "http://localhost:5000/api/v1";

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const API_URL = trimTrailingSlashes(
  (process.env.NEXT_PUBLIC_API_URL ?? "").trim() || DEFAULT_API_URL
);

export const API_ORIGIN =
  trimTrailingSlashes((process.env.NEXT_PUBLIC_API_ORIGIN ?? "").trim()) ||
  API_URL.replace(/\/api\/v1$/, "");
