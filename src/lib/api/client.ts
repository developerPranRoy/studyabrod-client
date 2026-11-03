import axios, { AxiosError } from "axios";
import { API_URL } from "@/lib/api/config";
import { useAuthStore } from "@/store/auth-store";

export { API_URL };

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.code = code;
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
  timeout: 60_000,
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
    const body = error.response?.data;
    const url = error.config?.url ?? "";
    const code =
      body && typeof body === "object" && typeof (body as { code?: unknown }).code === "string"
        ? (body as { code: string }).code
        : undefined;

    let message =
      extractMessage(body) ??
      (status === 0
        ? "Cannot reach the API. It may be waking up — please try again in a moment."
        : "Something went wrong. Please try again.");

    if (status === 409 && url.includes("/auth/register")) {
      message = "This email is already registered. Please log in instead.";
    }

    if (status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(new ApiError(status, message, body, code));
  }
);

export async function unwrap<T>(promise: Promise<{ data: { data: T } }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const details = error.details;
    if (details && typeof details === "object" && Array.isArray((details as { errors?: unknown }).errors)) {
      const first = (details as { errors: unknown[] }).errors.find(
        (item): item is { field?: unknown; message?: unknown } =>
          typeof item === "object" && item !== null
      );
      if (first && typeof first.field === "string" && typeof first.message === "string") {
        return `${first.field}: ${first.message}`;
      }
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
