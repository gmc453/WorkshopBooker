import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';

interface QuickStats {
  monthlyRevenue: number;
  monthlyBookings: number;
  averageRating: number;
  revenueGrowth: number;
}

export const useWorkshopQuickStats = (workshopId: string) => {
  return useQuery({
    queryKey: ['workshop-quick-stats', workshopId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/analytics/quick-stats`);
      return response.data as QuickStats;
    },
    staleTime: 10 * 60 * 1000, // 10 minut cache - zwiększamy aby zmniejszyć miganie
    gcTime: 15 * 60 * 1000, // 15 minut garbage collection
    refetchOnWindowFocus: false, // Wyłączamy refetch przy focusie okna
    refetchOnMount: false, // Wyłączamy refetch przy montowaniu
    refetchOnReconnect: false, // Wyłączamy refetch przy ponownym połączeniu
    enabled: !!workshopId,
    retry: 1, // Maksymalnie 1 retry
    retryDelay: 1000, // 1 sekunda delay
  });
}; 