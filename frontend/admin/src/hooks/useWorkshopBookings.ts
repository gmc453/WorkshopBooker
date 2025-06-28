import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useWorkshopBookings = (workshopId: string) =>
  useQuery({
    queryKey: ['bookings', workshopId],
    queryFn: async () => {
      const response = await axios.get(`/api/workshops/${workshopId}/bookings`)
      return response.data
    },
  })
