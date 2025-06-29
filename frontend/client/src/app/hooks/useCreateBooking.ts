"use client";

import { useMutation } from "@tanstack/react-query";
import apiClient from "../../api/axiosConfig";
import { AxiosError } from "axios";

type CreateBookingParams = {
  serviceId: string;
  bookingDateTime: string;
};

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      const response = await apiClient.post("/api/bookings", params);
      return response.data;
    },
    onError: (error: AxiosError) => {
      console.error("Błąd podczas tworzenia rezerwacji:", error);
    }
  });
} 