import { useQuery } from '@tanstack/react-query'
import type { Workshop } from '../types/workshop'
import apiClient from '../api/axiosConfig'

/**
 * Hook do pobierania warsztatów zalogowanego użytkownika
 */
export const useMyWorkshops = () =>
  useQuery<Workshop[]>({
    queryKey: ['my-workshops'],
    queryFn: async (): Promise<Workshop[]> => {
      const response = await apiClient.get<Workshop[]>('/api/workshops/my')
      return response.data
    }
  }) 