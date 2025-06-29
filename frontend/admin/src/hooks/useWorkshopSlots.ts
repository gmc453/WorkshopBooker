import { useQuery } from '@tanstack/react-query'
import type { Slot } from '../types/slot'
import apiClient from '../api/axiosConfig'

export const useWorkshopSlots = (workshopId: string) =>
  useQuery<Slot[]>({
    queryKey: ['slots', workshopId],
    queryFn: async (): Promise<Slot[]> => {
      const response = await apiClient.get<Slot[]>(`/api/workshops/${workshopId}/slots`)
      return response.data
    }
  })
