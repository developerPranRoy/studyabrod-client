import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1").replace(
  /\/$/,
  ""
);

/** Normalized error thrown by every API call. */
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && typeof (first as { message?: unknown }).message === "string") {
      return (first as { message: string }).message;
    }
  }
  return null;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const message =
      extractMessage(error.response?.data) ??
      (status === 0 ? "Cannot reach the API. Is the backend running?" : "Something went wrong. Please try again.");

    // Drop stale credentials when the API rejects them (but not on failed logins).
    const url = error.config?.url ?? "";
    if (status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(new ApiError(status, message, error.response?.data));
  }
);

/** Unwraps the standard `{ success, data }` envelope. */
export async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}
