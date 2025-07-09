import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Building, DollarSign, Users, Star, ArrowRight } from 'lucide-react';
import axios from 'axios';

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

export default function GlobalAnalyticsPage() {
  const [analytics, setAnalytics] = useState<GlobalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchGlobalAnalytics();
  }, [timeRange]);

  const fetchGlobalAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/global/overview?startDate=${getStartDate()}&endDate=${new Date().toISOString()}`);
      setAnalytics(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Global analytics fetch error:', err);
      setError(`Nie udało się pobrać globalnych danych analitycznych: ${err.message}`);
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

  const formatCurrency = (amount: number | undefined | null) => {
    const value = amount ?? 0;
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(value);
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.0%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Ładowanie globalnej analityki...</p>
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
            <div className="mt-4">
              <Link to="/" className="inline-flex items-center text-blue-600 hover:underline">
                <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                Wróć do dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analityka Globalna</h1>
              <p className="text-gray-600">Przegląd wszystkich warsztatów</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time range selector */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setTimeRange('7')}
                  className={`px-3 py-1 text-xs rounded ${timeRange === '7' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  7d
                </button>
                <button 
                  onClick={() => setTimeRange('30')}
                  className={`px-3 py-1 text-xs rounded ${timeRange === '30' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  30d
                </button>
                <button 
                  onClick={() => setTimeRange('90')}
                  className={`px-3 py-1 text-xs rounded ${timeRange === '90' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                >
                  90d
                </button>
              </div>
              {analytics.topWorkshops?.length > 0 && (
                <Link 
                  to={`/analytics/${analytics.topWorkshops[0]?.workshopId}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Szczegóły →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Łączne przychody</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{formatPercentage(analytics.revenueGrowth)}</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wszystkie warsztaty</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalWorkshops ?? 0}</p>
                <p className="text-sm text-gray-500">aktywnych</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Łączne rezerwacje</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings ?? 0}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{formatPercentage(analytics.bookingsGrowth)}</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Średnia ocena</p>
                <p className="text-2xl font-bold text-gray-900">{(analytics.averageRating ?? 0).toFixed(1)}</p>
                <p className="text-sm text-gray-500">wszystkich warsztatów</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Workshop Performance Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top warsztaty</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warsztat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Przychody</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezerwacje</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Średnia/rezerwacja</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocena</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topWorkshops?.map((workshop, index) => (
                  <tr key={workshop.workshopId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{workshop.workshopName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(workshop.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {workshop.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(workshop.revenuePerBooking)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{workshop.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link 
                        to={`/analytics/${workshop.workshopId}`}
                        className="text-purple-600 hover:text-purple-900 flex items-center"
                      >
                        Szczegóły <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workshop Comparison Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Porównanie wydajności</h3>
            {/* Chart component lub prosty bar chart */}
            <div className="space-y-3">
              {analytics.workshopComparison?.slice(0, 5).map((workshop) => (
                <div key={workshop.workshopId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{workshop.workshopName}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(workshop.currentMonthRevenue)}</p>
                  </div>
                  <div className={`text-sm font-medium ${
                    workshop.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(workshop.growthPercentage)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  💡 <strong>Najlepsza wydajność:</strong> Warsztat "{analytics.topWorkshops?.[0]?.workshopName ?? 'Brak danych'}" ma najwyższy wzrost przychodów ({formatPercentage(analytics.revenueGrowth)}) w tym miesiącu.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Wymaga uwagi:</strong> Sprawdź warsztaty z najniższymi przychodami i rozważ optymalizację slotów czasowych.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📈 <strong>Rekomendacja:</strong> Średnia ocena {(analytics.averageRating ?? 0).toFixed(1)} wskazuje na dobrą jakość usług. Rozważ program lojalnościowy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 