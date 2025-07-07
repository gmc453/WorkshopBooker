import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Star, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface AnalyticsData {
  workshopId: string;
  workshopName: string;
  monthlyRevenue: number;
  monthlyBookings: number;
  averageRating: number;
  totalReviews: number;
  averageServiceTime: number;
  revenueGrowth: number;
  bookingsGrowth: number;
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

export default function AnalyticsPage() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // dni

  useEffect(() => {
    if (workshopId) {
      fetchAnalytics();
    }
  }, [workshopId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/workshops/${workshopId}/analytics/overview?startDate=${getStartDate()}&endDate=${new Date().toISOString()}`);
      setAnalytics(response.data);
      setError(null);
    } catch (err: any) {
      setError('Nie udało się pobrać danych analitycznych');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const days = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return startDate.toISOString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Ładowanie analityki...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error || 'Nie udało się załadować danych'}</p>
            <Link to="/" className="inline-flex items-center mt-4 text-blue-600 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Wróć do dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analityka</h1>
                <p className="text-gray-600">{analytics.workshopName}</p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Okres:</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">7 dni</option>
                <option value="30">30 dni</option>
                <option value="90">90 dni</option>
                <option value="365">1 rok</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Przychody</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.monthlyRevenue)}</p>
                <div className={`flex items-center text-sm ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {formatPercentage(analytics.revenueGrowth)}
                </div>
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rezerwacje</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.monthlyBookings}</p>
                <div className={`flex items-center text-sm ${analytics.bookingsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.bookingsGrowth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {formatPercentage(analytics.bookingsGrowth)}
                </div>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Średnia ocena</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-500">{analytics.totalReviews} recenzji</p>
              </div>
            </div>
          </div>

          {/* Service Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Średni czas usługi</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageServiceTime.toFixed(1)}h</p>
                <p className="text-sm text-gray-500">na rezerwację</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Services */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popularne usługi</h3>
            <div className="space-y-4">
              {analytics.serviceDistribution.slice(0, 5).map((service) => (
                <div key={service.serviceId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.serviceName}</p>
                    <p className="text-sm text-gray-500">{service.bookingCount} rezerwacji</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(service.totalRevenue)}</p>
                    <p className="text-sm text-gray-500">{service.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Time Slots */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popularne godziny</h3>
            <div className="space-y-4">
              {analytics.popularTimeSlots.slice(0, 5).map((slot, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{slot.timeSlot}</p>
                    <p className="text-sm text-gray-500">{slot.bookingCount} rezerwacji</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{slot.utilizationRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">wykorzystanie</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend przychodów</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {analytics.revenueOverTime.slice(-7).map((point, index) => (
              <div key={index} className="text-center">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(point.revenue)}</p>
                <p className="text-xs text-gray-500">{new Date(point.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}</p>
                <p className="text-xs text-gray-400">{point.bookings} rezerwacji</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 