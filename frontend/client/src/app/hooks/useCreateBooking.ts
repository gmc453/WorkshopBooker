"use client";

import { useMutation } from "@tanstack/react-query";
import apiClient from "../../api/axiosConfig";
import { AxiosError } from "axios";

type CreateBookingParams = {
  serviceId: string;
  slotId: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    carBrand?: string;
    carModel?: string;
    notes?: string;
  };
};

export function useCreateBooking() {
  const mutation = useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      const { serviceId, slotId, customerInfo } = params;
      const response = await apiClient.post(`/api/services/${serviceId}/bookings`, { 
        slotId,
        customerName: customerInfo?.name,
        customerEmail: customerInfo?.email,
        customerPhone: customerInfo?.phone,
        carBrand: customerInfo?.carBrand,
        carModel: customerInfo?.carModel,
        notes: customerInfo?.notes
      });
      return response.data;
    },
    onError: (error: AxiosError) => {
      console.error("Błąd podczas tworzenia rezerwacji:", error);
    }
  });
  
  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
} 