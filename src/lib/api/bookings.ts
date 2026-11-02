import { api } from "@/lib/api/client";
import { asArray, toBooking } from "@/lib/api/dto";
import type { ApiEnvelope, Booking } from "@/lib/api/types";

export async function createBooking(input: {
  planId: number;
  scheduledAt: string;
}): Promise<Booking> {
  const res = await api.post<ApiEnvelope<unknown>>("/bookings", input);
  return toBooking(res.data.data);
}

export async function getMyBookings(): Promise<Booking[]> {
  const res = await api.get<ApiEnvelope<unknown[]>>("/bookings/my");
  return asArray(res.data.data, (b) => b).map(toBooking);
}

export async function withdrawBooking(id: number): Promise<Booking> {
  const res = await api.patch<ApiEnvelope<unknown>>(`/bookings/${id}/withdraw`);
  return toBooking(res.data.data);
}

export const cancelBooking = withdrawBooking;
