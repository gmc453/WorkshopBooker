import { useMutation } from '@tanstack/react-query'
import apiClient from '../api/axiosConfig'

export const useDeleteSlot = () =>
  useMutation({
    mutationFn: async (slotId: string) => {
      await apiClient.delete(`/api/slots/${slotId}`)
    }
  })
