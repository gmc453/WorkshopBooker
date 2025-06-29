import { useMutation } from '@tanstack/react-query'
import apiClient from '../api/axiosConfig'

export const useCreateSlot = (workshopId: string) =>
  useMutation({
    mutationFn: async (params: { startTime: string; endTime: string }) => {
      const response = await apiClient.post(`/api/workshops/${workshopId}/slots`, params)
      return response.data
    }
  })
