// SKOPIUJ I ZASTĄP ZAWARTOŚĆ frontend/admin/src/pages/AnalyticsPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Download, FileText, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useMyWorkshops } from '../hooks/useMyWorkshops';

import { OverviewTab } from '../components/analytics/OverviewTab';
import { CustomersTab } from '../components/analytics/CustomersTab';
import { PredictionsTab } from '../components/analytics/PredictionsTab';
import { SeasonalTab } from '../components/analytics/SeasonalTab';

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
  const navigate = useNavigate();
  const { data: allWorkshops } = useMyWorkshops();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // dni
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'predictions' | 'seasonal'>('overview');

  useEffect(() => {
    if (workshopId) {
      fetchAnalytics();
    }
  }, [workshopId, timeRange]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && workshopId) {
        fetchAnalytics(); // Odśwież dane co 5 minut gdy tab jest aktywny
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [workshopId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case '1': setActiveTab('overview'); break;
          case '2': setActiveTab('customers'); break;
          case '3': setActiveTab('predictions'); break;
          case '4': setActiveTab('seasonal'); break;
          case 'e': exportToCSV(); break;
          case 'r': fetchAnalytics(); break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

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
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
            <span className="text-gray-400">›</span>
            <Link to="/analytics/global" className="text-gray-500 hover:text-gray-700">Analityka</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{analytics?.workshopName}</span>
          </nav>
        </div>
      </div>

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
                <p className="text-gray-600">{analytics?.workshopName}</p>
              </div>
            </div>
            
            {/* Workshop Switcher and Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Warsztat:</label>
                <select 
                  value={workshopId} 
                  onChange={(e) => navigate(`/analytics/${e.target.value}`)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {allWorkshops?.map(workshop => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name}
                    </option>
                  ))}
                </select>
              </div>

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

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Przegląd', icon: TrendingUp },
              { id: 'customers', name: 'Klienci', icon: Users },
              { id: 'predictions', name: 'Prognozy', icon: Target },
              { id: 'seasonal', name: 'Sezonowość', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Render content based on active tab */}
        {activeTab === 'overview' && <OverviewTab analytics={analytics} formatCurrency={formatCurrency} formatPercentage={formatPercentage} safeNumber={safeNumber} />}
        {activeTab === 'customers' && workshopId && <CustomersTab workshopId={workshopId} />}
        {activeTab === 'predictions' && workshopId && <PredictionsTab workshopId={workshopId} />}
        {activeTab === 'seasonal' && workshopId && <SeasonalTab workshopId={workshopId} />}
      </div>
    </div>
  );
}