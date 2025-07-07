"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/axiosConfig";
import { Service } from "../types/workshop";

export function useWorkshopServices(workshopId: string) {
  return useQuery<Service[]>({
    queryKey: ["services", workshopId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/services`);
      return response.data as Service[];
    },
    enabled: !!workshopId,
  });
} 