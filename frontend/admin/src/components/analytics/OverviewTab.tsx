import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Star, Clock, Calendar } from 'lucide-react';
import { RevenueChart } from '../charts/RevenueChart';
import { ServicesChart } from '../charts/ServicesChart';

interface AnalyticsData {
  workshopId: string;
  workshopName: string;
  monthlyRevenue: number;
  monthlyBookings: number;
  averageRating: number;
  totalReviews: number;
  averageServiceTime: number;
  revenueGrowth?: number;
  bookingsGrowth?: number;
  serviceDistribution: ServiceDistribution[];
  popularTimeSlots: TimeSlotAnalytics[];
  revenueOverTime: RevenueDataPoint[];
}

interface ServiceDistribution {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  totalRevenue: number;
  percentage: number;
  averageRating: number;
}

interface TimeSlotAnalytics {
  timeSlot: string;
  bookingCount: number;
  utilizationRate: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface OverviewTabProps {
  analytics: AnalyticsData | null;
  formatCurrency: (amount: number | undefined | null) => string;
  formatPercentage: (value: number | undefined | null) => string;
  safeNumber: (value: number | undefined | null, defaultValue?: number) => number;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ 
  analytics, 
  formatCurrency, 
  formatPercentage, 
  safeNumber 
}) => {
  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Ładowanie danych...</p>
      </div>
    );
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Przychody</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.monthlyRevenue)}</p>
              <div className="flex items-center mt-1">
                {safeNumber(analytics.revenueGrowth) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${safeNumber(analytics.revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.revenueGrowth)}
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Bookings Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rezerwacje</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.monthlyBookings}</p>
              <div className="flex items-center mt-1">
                {safeNumber(analytics.bookingsGrowth) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${safeNumber(analytics.bookingsGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.bookingsGrowth)}
                </span>
              </div>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Rating Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Średnia ocena</p>
              <p className="text-2xl font-bold text-gray-900">{safeNumber(analytics.averageRating).toFixed(1)}</p>
              <p className="text-sm text-gray-500">{analytics.totalReviews} recenzji</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Service Time Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Średni czas usługi</p>
              <p className="text-2xl font-bold text-gray-900">{safeNumber(analytics.averageServiceTime).toFixed(1)}h</p>
              <p className="text-sm text-gray-500">na rezerwację</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend przychodów</h3>
          {analytics.revenueOverTime.length > 0 ? (
            <RevenueChart data={analytics.revenueOverTime} />
          ) : (
            <p className="text-gray-500 text-center py-8">Brak danych o przychodach w tym okresie</p>
          )}
        </div>

        {/* Services Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popularne usługi</h3>
          {analytics.serviceDistribution.length > 0 ? (
            <ServicesChart data={analytics.serviceDistribution} />
          ) : (
            <p className="text-gray-500 text-center py-8">Brak danych o usługach w tym okresie</p>
          )}
        </div>
      </div>

      {/* Popular Time Slots */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popularne godziny</h3>
        {analytics.popularTimeSlots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.popularTimeSlots.slice(0, 6).map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{slot.timeSlot}</p>
                  <p className="text-sm text-gray-500">{slot.bookingCount} rezerwacji</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{safeNumber(slot.utilizationRate).toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">wykorzystanie</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Brak danych o slotach w tym okresie</p>
        )}
      </div>
    </>
  );
}; 