import { useQuery } from '@tanstack/react-query'
import type { Booking } from '../types/booking'
import apiClient from '../api/axiosConfig'

export const useWorkshopBookings = (workshopId: string) =>
  useQuery<Booking[]>({
    queryKey: ['bookings', workshopId],
    queryFn: async (): Promise<Booking[]> => {
      const response = await apiClient.get<Booking[]>(`/api/workshops/${workshopId}/bookings`)
      return response.data 
    },
  })
