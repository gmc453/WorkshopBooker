import { useQuery } from '@tanstack/react-query'
import type { Workshop } from '../types/workshop'
import apiClient from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

/**
 * Hook do pobierania warsztatów zalogowanego użytkownika
 */
export const useMyWorkshops = () => {
  const { user } = useAuth()

  return useQuery<Workshop[]>({
    queryKey: ['my-workshops'],
    queryFn: async (): Promise<Workshop[]> => {
      const response = await apiClient.get<Workshop[]>('/api/workshops/my', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })
      return response.data
    }
  })
}