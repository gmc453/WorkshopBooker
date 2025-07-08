import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';

interface MonthlyRevenueProjection {
  month: string;
  predictedRevenue: number;
  minPrediction: number;
  maxPrediction: number;
  confidenceLevel: number;
}

interface RevenuePrediction {
  currentMonthRevenue: number;
  predictedNextMonthRevenue: number;
  growthPercentage: number;
  confidenceLevel: number;
  monthlyProjections: MonthlyRevenueProjection[];
}

interface BookingPrediction {
  currentMonthBookings: number;
  predictedNextMonthBookings: number;
  growthPercentage: number;
  confidenceLevel: number;
}

interface RecommendedTimeSlot {
  timeSlot: string;
  currentUtilization: number;
  recommendedCapacity: number;
  predictedDemand: number;
  recommendation: string;
  confidenceLevel: number;
}

interface SeasonalityPattern {
  patternType: string;
  period: string;
  averageBookings: number;
  peakMultiplier: number;
  lowMultiplier: number;
  trend: string;
}

interface AIRecommendation {
  category: string;
  title: string;
  description: string;
  impactScore: number;
  implementationDifficulty: number;
  priority: string;
  actionItems: string[];
}

interface PredictiveAnalytics {
  revenuePrediction: RevenuePrediction;
  bookingPrediction: BookingPrediction;
  recommendedTimeSlots: RecommendedTimeSlot[];
  seasonalityPatterns: SeasonalityPattern[];
  aiRecommendations: AIRecommendation[];
}

export const usePredictions = (workshopId: string) => {
  return useQuery({
    queryKey: ['predictions', workshopId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/analytics/predictions`);
      return response.data as PredictiveAnalytics;
    },
    staleTime: 10 * 60 * 1000, // 10 minut cache dla prognoz
    enabled: !!workshopId,
  });
}; 