import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';

interface TopCustomer {
  customerEmail: string;
  customerName: string;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  firstBooking: string;
  lastBooking: string;
  customerType: string;
}

interface CustomerSegment {
  segmentName: string;
  description: string;
  customerCount: number;
  totalRevenue: number;
  averageRating: number;
  averageOrderValue: number;
  color: string;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageCustomerValue: number;
  customerLifetimeValue: number;
  topCustomers: TopCustomer[];
  customerSegments: CustomerSegment[];
}

export const useCustomerAnalytics = (workshopId: string) => {
  return useQuery({
    queryKey: ['customer-analytics', workshopId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/analytics/customers`);
      return response.data as CustomerAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minut cache
    enabled: !!workshopId,
  });
}; 