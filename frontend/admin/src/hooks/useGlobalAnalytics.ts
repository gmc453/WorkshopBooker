import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';

interface GlobalAnalyticsData {
  totalWorkshops: number;
  totalRevenue: number;
  totalBookings: number;
  averageRating: number;
  revenueGrowth: number;
  bookingsGrowth: number;
  topWorkshops: WorkshopPerformance[];
  workshopComparison: WorkshopComparison[];
}

interface TodayStatsData {
  todaysBookings: number;
  pendingBookings: number;
  completedBookings: number;
  canceledBookings: number;
  weeklyRevenue: number;
  activeWorkshops: number;
  avgRating: number;
}

interface WorkshopPerformance {
  workshopId: string;
  workshopName: string;
  revenue: number;
  bookings: number;
  averageRating: number;
  revenuePerBooking: number;
  utilizationRate: number;
}

interface WorkshopComparison {
  workshopId: string;
  workshopName: string;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  growthPercentage: number;
  performanceCategory: string;
}

export const useGlobalAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['global-analytics', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiClient.get(`/api/analytics/global/overview?${params}`);
      return response.data as GlobalAnalyticsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minut cache - zwiększamy aby zmniejszyć miganie
    gcTime: 10 * 60 * 1000, // 10 minut garbage collection
    refetchOnWindowFocus: false, // Wyłączamy refetch przy focusie okna
    refetchOnMount: false, // Wyłączamy refetch przy montowaniu
    refetchOnReconnect: false, // Wyłączamy refetch przy ponownym połączeniu
    retry: 1, // Maksymalnie 1 retry
    retryDelay: 1000, // 1 sekunda delay
  });
};

export const useTodayStats = () => {
  return useQuery({
    queryKey: ['today-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/api/analytics/global/today-stats');
      return response.data as TodayStatsData;
    },
    staleTime: 1 * 60 * 1000, // 1 minuta cache - częściej odświeżane
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useWorkshopsComparison = () => {
  return useQuery({
    queryKey: ['workshops-comparison'],
    queryFn: async () => {
      const response = await apiClient.get('/api/analytics/global/workshops-comparison');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000,
  });
}; 