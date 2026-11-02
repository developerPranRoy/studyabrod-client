"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelBooking, createBooking, getMyBookings } from "@/lib/api/bookings";
import { qk } from "@/hooks/query-keys";

export function useMyBookings(enabled: boolean) {
  return useQuery({ queryKey: qk.myBookings, queryFn: getMyBookings, enabled });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.myBookings });
      toast.success("Call booked — see it under My Bookings");
    },
    onError: (error) => toast.error(error.message), // surfaces 409 slot conflicts
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.myBookings });
      toast.success("Booking cancelled");
    },
    onError: (error) => toast.error(error.message),
  });
}
