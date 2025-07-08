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
    staleTime: 2 * 60 * 1000, // 2 minuty cache
  });
};

export const useWorkshopsComparison = () => {
  return useQuery({
    queryKey: ['workshops-comparison'],
    queryFn: async () => {
      const response = await apiClient.get('/api/analytics/global/workshops-comparison');
      return response.data;
    },
  });
}; 