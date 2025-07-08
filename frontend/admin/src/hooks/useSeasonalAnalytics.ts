import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';

interface DayOfWeekAnalytics {
  dayOfWeek: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  percentageOfTotal: number;
  trend: string;
  rank: number;
}

interface HourlyAnalytics {
  hour: number;
  timeSlot: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  percentageOfTotal: number;
  demandLevel: string;
  rank: number;
}

interface MonthlyAnalytics {
  month: string;
  year: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  utilizationRate: number;
  growthRate: number;
  season: string;
  rank: number;
}

interface YearOverYearComparison {
  period: string;
  currentYear: number;
  previousYear: number;
  currentYearBookings: number;
  previousYearBookings: number;
  currentYearRevenue: number;
  previousYearRevenue: number;
  bookingGrowth: number;
  revenueGrowth: number;
  trend: string;
}

interface PeakHours {
  peakHours: string[];
  offPeakHours: string[];
  deadHours: string[];
  peakHourUtilization: number;
  offPeakUtilization: number;
  deadHourUtilization: number;
  recommendedAction: string;
}

interface SeasonalTrends {
  bestSeason: string;
  worstSeason: string;
  seasonalVariation: number;
  recommendations: any[];
  seasonMultipliers: Record<string, number>;
}

interface SeasonalAnalytics {
  dayOfWeekAnalytics: DayOfWeekAnalytics[];
  hourlyAnalytics: HourlyAnalytics[];
  monthlyAnalytics: MonthlyAnalytics[];
  yearOverYearComparison: YearOverYearComparison[];
  peakHours: PeakHours;
  seasonalTrends: SeasonalTrends;
}

export const useSeasonalAnalytics = (workshopId: string) => {
  return useQuery({
    queryKey: ['seasonal-analytics', workshopId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/analytics/seasonal`);
      return response.data as SeasonalAnalytics;
    },
    staleTime: 15 * 60 * 1000, // 15 minut cache dla danych sezonowych
    enabled: !!workshopId,
  });
}; 