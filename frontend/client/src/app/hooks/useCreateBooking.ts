"use client";

import { useMutation } from "@tanstack/react-query";
import apiClient from "../../api/axiosConfig";
import { AxiosError } from "axios";

type CreateBookingParams = {
  serviceId: string;
  bookingDateTime: string;
};

export function useCreateBooking() {
  const mutation = useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      const { serviceId, bookingDateTime } = params;
      const response = await apiClient.post(`/api/services/${serviceId}/bookings`, { bookingDateTime });
      return response.data;
    },
    onError: (error: AxiosError) => {
      console.error("Błąd podczas tworzenia rezerwacji:", error);
    }
  });
  
  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error
  };
} 