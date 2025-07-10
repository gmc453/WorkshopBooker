import { useMutation, useQuery } from '@tanstack/react-query'
import apiClient from '../api/axiosConfig'

type EmergencyRequest = {
  description: string
  location: string
}

export const useEmergencyService = () => {
  const operators = useQuery(['emergency-operators'], async () => {
    const res = await apiClient.get('/api/emergency/operators')
    return res.data as any[]
  })

  const requestAssist = useMutation((payload: EmergencyRequest) =>
    apiClient.post('/api/emergency/requests', payload)
  )

  return { operators, requestAssist }
}
