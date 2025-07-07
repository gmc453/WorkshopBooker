import { useQuery } from '@tanstack/react-query'
import type { Booking } from '../types/booking'
import apiClient from '../api/axiosConfig'

export const useWorkshopBookings = (workshopId: string | null) =>
  useQuery<Booking[]>({
    queryKey: ['bookings', workshopId],
    queryFn: async (): Promise<Booking[]> => {
      if (!workshopId) {
        throw new Error('Workshop ID is required')
      }
      const response = await apiClient.get<Booking[]>(`/api/workshops/${workshopId}/bookings`)
      return response.data 
    },
    enabled: !!workshopId, // Query nie będzie wykonywany jeśli workshopId jest null/undefined
  })
