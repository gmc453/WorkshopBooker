import React from 'react';
import { TrendingUp, Clock, BarChart3, AlertTriangle, Activity, MapPin, Target } from 'lucide-react';
import { useSeasonalAnalytics } from '../../hooks/useSeasonalAnalytics';
import { safeFormatPrice } from '../../utils/safeAccess';

interface SeasonalTabProps {
  workshopId: string;
}

export const SeasonalTab: React.FC<SeasonalTabProps> = ({ workshopId }) => {
  const { data: seasonal, isLoading, error } = useSeasonalAnalytics(workshopId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-900">Błąd ładowania danych sezonowych</h3>
        </div>
        <p className="text-red-700 mt-2">
          Nie udało się załadować analizy sezonowej. Spróbuj ponownie później.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heatmap dni tygodnia */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aktywność w dni tygodnia</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map((day) => {
                         const dayData = seasonal?.dayOfWeekAnalytics?.find((d: any) => d.dayOfWeek === day);
            const intensity = dayData ? Math.min(dayData.percentageOfTotal / 20, 1) : 0;
            return (
              <div key={day} className="text-center">
                <div className="text-xs font-medium text-gray-600 mb-1">{day}</div>
                <div 
                  className="h-16 rounded-lg flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                    color: intensity > 0.5 ? 'white' : 'rgb(55, 65, 81)'
                  }}
                >
                  {dayData ? (
                    <div className="text-center">
                      <div className="font-bold">{dayData.totalBookings}</div>
                      <div className="text-xs opacity-75">{dayData.percentageOfTotal.toFixed(1)}%</div>
                    </div>
                  ) : (
                    <div className="text-gray-400">0</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
            <span>Niska aktywność</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-300 rounded mr-1"></div>
            <span>Średnia aktywność</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span>Wysoka aktywność</span>
          </div>
        </div>
      </div>

      {/* Bar chart godzin dnia */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aktywność w godzinach dnia</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i + 8; // 8:00 - 19:00
                         const hourData = seasonal?.hourlyAnalytics?.find((h: any) => h.hour === hour);
            const height = hourData ? Math.max(hourData.percentageOfTotal * 2, 20) : 20;
            return (
              <div key={hour} className="text-center">
                <div 
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${height}px` }}
                ></div>
                <div className="text-xs text-gray-600 mt-1">{hour}:00</div>
                <div className="text-xs text-gray-500">
                  {hourData ? hourData.totalBookings : 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Line chart trendów miesięcznych */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trendy miesięczne</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {seasonal?.monthlyAnalytics?.slice(0, 6).map((month: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">{month.month}</div>
                <div className="text-xs text-gray-500">{month.season}</div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm font-medium">{month.totalBookings} rezerwacji</div>
                  <div className="text-xs text-gray-500">
                    {safeFormatPrice(month.totalRevenue)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    month.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {month.growthRate >= 0 ? '+' : ''}{month.growthRate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">wzrost</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">⭐ {month.averageRating?.toFixed(1) || 0}</div>
                  <div className="text-xs text-gray-500">ocena</div>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              Brak danych o trendach miesięcznych
            </div>
          )}
        </div>
      </div>

      {/* Rok do roku comparison */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Porównanie rok do roku</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {seasonal?.yearOverYearComparison?.slice(0, 4).map((comparison: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{comparison.period}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  comparison.trend === 'improving' 
                    ? 'bg-green-100 text-green-800' 
                    : comparison.trend === 'declining'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {comparison.trend === 'improving' ? 'Poprawa' : 
                   comparison.trend === 'declining' ? 'Spadek' : 'Stabilny'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Rezerwacje</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{comparison.currentYearBookings}</span>
                    <span className="text-sm text-gray-500">vs {comparison.previousYearBookings}</span>
                    <span className={`text-xs font-medium ${
                      comparison.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comparison.bookingGrowth >= 0 ? '+' : ''}{comparison.bookingGrowth?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Przychody</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{safeFormatPrice(comparison.currentYearRevenue)}</span>
                    <span className="text-sm text-gray-500">vs {safeFormatPrice(comparison.previousYearRevenue)}</span>
                    <span className={`text-xs font-medium ${
                      comparison.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comparison.revenueGrowth >= 0 ? '+' : ''}{comparison.revenueGrowth?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              Brak danych o porównaniu rok do roku
            </div>
          )}
        </div>
      </div>

      {/* Peak hours analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Analiza godzin szczytu</h3>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Godziny szczytu</h4>
            <div className="space-y-1">
              {seasonal?.peakHours?.peakHours?.map((hour: string, index: number) => (
                <div key={index} className="text-sm text-green-700">{hour}</div>
              )) || (
                <div className="text-sm text-green-700">Brak danych</div>
              )}
            </div>
            <div className="text-xs text-green-600 mt-2">
              Wykorzystanie: {seasonal?.peakHours?.peakHourUtilization?.toFixed(1) || 0}%
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Godziny średnie</h4>
            <div className="space-y-1">
              {seasonal?.peakHours?.offPeakHours?.map((hour: string, index: number) => (
                <div key={index} className="text-sm text-yellow-700">{hour}</div>
              )) || (
                <div className="text-sm text-yellow-700">Brak danych</div>
              )}
            </div>
            <div className="text-xs text-yellow-600 mt-2">
              Wykorzystanie: {seasonal?.peakHours?.offPeakUtilization?.toFixed(1) || 0}%
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Godziny martwe</h4>
            <div className="space-y-1">
              {seasonal?.peakHours?.deadHours?.map((hour: string, index: number) => (
                <div key={index} className="text-sm text-red-700">{hour}</div>
              )) || (
                <div className="text-sm text-red-700">Brak danych</div>
              )}
            </div>
            <div className="text-xs text-red-600 mt-2">
              Wykorzystanie: {seasonal?.peakHours?.deadHourUtilization?.toFixed(1) || 0}%
            </div>
          </div>
        </div>
        {seasonal?.peakHours?.recommendedAction && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Rekomendacja:</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">{seasonal.peakHours.recommendedAction}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 