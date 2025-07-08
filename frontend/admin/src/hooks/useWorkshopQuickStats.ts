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
    staleTime: 5 * 60 * 1000, // 5 minut cache
    enabled: !!workshopId,
  });
}; 