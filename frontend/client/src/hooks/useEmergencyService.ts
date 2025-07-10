import { useMutation, useQuery } from '@tanstack/react-query'
import apiClient from '../api/axiosConfig'

type EmergencyRequest = {
  description: string
  location: string
}

interface EmergencyOperator {
  id: string
  name: string
  [key: string]: unknown
}

export const useEmergencyService = () => {
  const operators = useQuery({
    queryKey: ['emergency-operators'],
    queryFn: async () => {
      const res = await apiClient.get('/api/emergency/operators')
      return res.data as EmergencyOperator[]
    }
  })

  const requestAssist = useMutation({
    mutationFn: (payload: EmergencyRequest) =>
      apiClient.post('/api/emergency/requests', payload)
  })

  return { operators, requestAssist }
}
