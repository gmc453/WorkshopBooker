"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/axiosConfig";

export type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  workshopId?: string;
  workshopName?: string;
  slotStartTime: string;
  slotEndTime: string;
  status: number;
  servicePrice: number;
  price?: number;
  durationInMinutes?: number;
};

export function useMyBookings() {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>("/api/bookings/my");
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("authToken")
  });
} 