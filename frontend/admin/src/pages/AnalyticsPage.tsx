// SKOPIUJ I ZASTĄP ZAWARTOŚĆ frontend/admin/src/pages/AnalyticsPage.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Star, Clock, Calendar, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';

interface AnalyticsData {
  workshopId: string;
  workshopName: string;
  monthlyRevenue: number;
  monthlyBookings: number;
  averageRating: number;
  totalReviews: number;
  averageServiceTime: number;
  revenueGrowth?: number;  // Opcjonalne pola
  bookingsGrowth?: number; // Opcjonalne pola
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
      
      // Validate and set defaults for missing data
      const data = response.data;
      setAnalytics({
        ...data,
        revenueGrowth: data.revenueGrowth ?? 0,
        bookingsGrowth: data.bookingsGrowth ?? 0,
        serviceDistribution: data.serviceDistribution ?? [],
        popularTimeSlots: data.popularTimeSlots ?? [],
        revenueOverTime: data.revenueOverTime ?? []
      });
      
      setError(null);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      if (err.response?.status === 404) {
        setError('Warsztat nie został znaleziony');
      } else if (err.response?.status === 401) {
        setError('Brak uprawnień do tego warsztatu');
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Backend API nie jest uruchomiony. Uruchom: dotnet run w folderze WorkshopBooker.Api');
      } else {
        setError(`Nie udało się pobrać danych analitycznych: ${err.message}`);
      }
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

  // 🔧 NAPRAWIONA FUNKCJA z null checking
  const formatPercentage = (value: number | undefined | null) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.0%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // 🔧 POMOCNICZA FUNKCJA dla bezpiecznych liczb
  const safeNumber = (value: number | undefined | null, defaultValue: number = 0): number => {
    return value ?? defaultValue;
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csvData = [
      ['Raport analityczny', analytics.workshopName, `Okres: ${timeRange} dni`],
      [''],
      ['KPI', 'Wartość', 'Wzrost'],
      ['Przychody', formatCurrency(analytics.monthlyRevenue), formatPercentage(analytics.revenueGrowth)],
      ['Rezerwacje', analytics.monthlyBookings.toString(), formatPercentage(analytics.bookingsGrowth)],
      ['Średnia ocena', safeNumber(analytics.averageRating).toFixed(1), `${analytics.totalReviews} recenzji`],
      ['Średni czas usługi', `${safeNumber(analytics.averageServiceTime).toFixed(1)}h`, 'na rezerwację'],
      [''],
      ['Popularne usługi', 'Rezerwacje', 'Przychody', 'Procent', 'Średnia ocena'],
      ...analytics.serviceDistribution.map(service => [
        service.serviceName,
        service.bookingCount.toString(),
        formatCurrency(service.totalRevenue),
        `${safeNumber(service.percentage).toFixed(1)}%`,
        safeNumber(service.averageRating).toFixed(1)
      ]),
      [''],
      ['Popularne godziny', 'Rezerwacje', 'Wykorzystanie'],
      ...analytics.popularTimeSlots.map(slot => [
        slot.timeSlot,
        slot.bookingCount.toString(),
        `${safeNumber(slot.utilizationRate).toFixed(1)}%`
      ]),
      [''],
      ['Trend przychodów (ostatnie 7 dni)', 'Data', 'Przychody', 'Rezerwacje'],
      ...analytics.revenueOverTime.slice(-7).map(point => [
        new Date(point.date).toLocaleDateString('pl-PL'),
        formatCurrency(point.revenue),
        point.bookings.toString()
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `raport-${analytics.workshopName}-${timeRange}dni.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Raport Analityczny', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`${analytics.workshopName}`, 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.text(`Okres: ${timeRange} dni`, 20, yPos);
    yPos += 15;

    // KPI Section
    doc.setFontSize(14);
    doc.text('Kluczowe wskaźniki (KPI)', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Przychody: ${formatCurrency(analytics.monthlyRevenue)} (${formatPercentage(analytics.revenueGrowth)})`, 20, yPos);
    yPos += 6;
    doc.text(`Rezerwacje: ${analytics.monthlyBookings} (${formatPercentage(analytics.bookingsGrowth)})`, 20, yPos);
    yPos += 6;
    doc.text(`Średnia ocena: ${safeNumber(analytics.averageRating).toFixed(1)} (${analytics.totalReviews} recenzji)`, 20, yPos);
    yPos += 6;
    doc.text(`Średni czas usługi: ${safeNumber(analytics.averageServiceTime).toFixed(1)}h`, 20, yPos);
    yPos += 15;

    // Popular Services
    doc.setFontSize(14);
    doc.text('Popularne usługi', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    analytics.serviceDistribution.slice(0, 5).forEach(service => {
      doc.text(`${service.serviceName}: ${service.bookingCount} rezerwacji, ${formatCurrency(service.totalRevenue)}`, 20, yPos);
      yPos += 6;
    });
    yPos += 10;

    // Popular Time Slots
    doc.setFontSize(14);
    doc.text('Popularne godziny', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    analytics.popularTimeSlots.slice(0, 5).forEach(slot => {
      doc.text(`${slot.timeSlot}: ${slot.bookingCount} rezerwacji, ${safeNumber(slot.utilizationRate).toFixed(1)}% wykorzystanie`, 20, yPos);
      yPos += 6;
    });

    // Save PDF
    doc.save(`raport-${analytics.workshopName}-${timeRange}dni.pdf`);
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
            <div className="mt-4 space-y-2">
              <Link to="/" className="inline-flex items-center text-blue-600 hover:underline">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Wróć do dashboard
              </Link>
              <button 
                onClick={fetchAnalytics}
                className="block mx-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Spróbuj ponownie
              </button>
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
            
            {/* Time Range Selector and Export Buttons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Okres:</label>
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">7 dni</option>
                  <option value="30">30 dni</option>
                  <option value="90">90 dni</option>
                  <option value="365">Rok</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Services */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popularne usługi</h3>
            {analytics.serviceDistribution.length > 0 ? (
              <div className="space-y-4">
                {analytics.serviceDistribution.slice(0, 5).map((service) => (
                  <div key={service.serviceId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{service.serviceName}</p>
                      <p className="text-sm text-gray-500">{service.bookingCount} rezerwacji</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(service.totalRevenue)}</p>
                      <p className="text-sm text-gray-500">{safeNumber(service.percentage).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Brak danych o usługach w tym okresie</p>
            )}
          </div>

          {/* Popular Time Slots */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popularne godziny</h3>
            {analytics.popularTimeSlots.length > 0 ? (
              <div className="space-y-4">
                {analytics.popularTimeSlots.slice(0, 5).map((slot, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
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
        </div>

        {/* Revenue Trend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend przychodów</h3>
          {analytics.revenueOverTime.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {analytics.revenueOverTime.slice(-7).map((point, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(point.revenue)}</p>
                  <p className="text-xs text-gray-500">{new Date(point.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}</p>
                  <p className="text-xs text-gray-400">{point.bookings} rezerwacji</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Brak danych o przychodach w tym okresie</p>
          )}
        </div>
      </div>
    </div>
  );
}