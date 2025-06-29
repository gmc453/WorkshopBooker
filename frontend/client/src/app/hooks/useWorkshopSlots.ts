"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig";

export type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  status: number;
};

export function useWorkshopSlots(workshopId: string) {
  return useQuery<Slot[]>({
    queryKey: ["slots", workshopId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/slots`);
      return response.data as Slot[];
    },
  });
}
