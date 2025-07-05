"use client";

import { useQuery } from "@tanstack/react-query";
// Update the import path if the file is located elsewhere, for example:
import apiClient from "../../api/axiosConfig";
// Or, if the file does not exist, create 'axiosConfig.ts' in the correct folder with the following content:
// import axios from "axios";
// const apiClient = axios.create({ baseURL: "http://localhost:3000" });
// export default apiClient;

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
