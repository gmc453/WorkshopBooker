import React from 'react';
import { Target, TrendingUp, Calendar, Lightbulb, AlertTriangle, CheckCircle, BarChart3, LineChart } from 'lucide-react';
import { usePredictions } from '../../hooks/usePredictions';
import { safeFormatPrice } from '../../utils/safeAccess';

interface PredictionsTabProps {
  workshopId: string;
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ workshopId }) => {
  const { data: predictions, isLoading, error } = usePredictions(workshopId);

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
          <h3 className="text-lg font-semibold text-red-900">Błąd ładowania prognoz</h3>
        </div>
        <p className="text-red-700 mt-2">
          Nie udało się załadować prognoz AI. Spróbuj ponownie później.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prediction cards: Przychody/Rezerwacje następny miesiąc */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Przewidywane przychody</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeFormatPrice(predictions?.revenuePrediction?.predictedNextMonthRevenue || 0)}
              </p>
              <p className="text-sm text-gray-500">następny miesiąc</p>
              <p className={`text-xs font-medium ${
                (predictions?.revenuePrediction?.growthPercentage || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(predictions?.revenuePrediction?.growthPercentage ?? 0) >= 0 ? '+' : ''}
                {predictions?.revenuePrediction?.growthPercentage?.toFixed(1) || 0}% vs bieżący
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Przewidywane rezerwacje</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictions?.bookingPrediction?.predictedNextMonthBookings || 0}
              </p>
              <p className="text-sm text-gray-500">następny miesiąc</p>
              <p className={`text-xs font-medium ${
                (predictions?.bookingPrediction?.growthPercentage || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(predictions?.bookingPrediction?.growthPercentage ?? 0) >= 0 ? '+' : ''}
                {predictions?.bookingPrediction?.growthPercentage?.toFixed(1) || 0}% vs bieżący
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poziom pewności</p>
              <p className="text-2xl font-bold text-gray-900">
                {predictions?.revenuePrediction?.confidenceLevel?.toFixed(0) || 0}%
              </p>
              <p className="text-sm text-gray-500">dokładność prognoz</p>
              <p className="text-xs text-gray-500">
                Na podstawie {predictions?.seasonalityPatterns?.length || 0} wzorców
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recommended time slots (bar chart) */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rekomendowane godziny</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {predictions?.recommendedTimeSlots?.slice(0, 5).map((slot: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-900">{slot.timeSlot}</div>
                <div className="text-xs text-gray-500">
                  Wykorzystanie: {slot.currentUtilization}%
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  slot.recommendation === 'increase' 
                    ? 'bg-green-100 text-green-800' 
                    : slot.recommendation === 'decrease'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {slot.recommendation === 'increase' ? 'Zwiększ' : 
                   slot.recommendation === 'decrease' ? 'Zmniejsz' : 'Utrzymaj'}
                </span>
                <span className="text-xs text-gray-500">
                  {slot.confidenceLevel?.toFixed(0)}% pewności
                </span>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              Brak danych o rekomendowanych godzinach
            </div>
          )}
        </div>
      </div>

      {/* Trendy i wzorce (line chart) */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trendy i wzorce</h3>
          <LineChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Wzorce sezonowe</h4>
            <div className="space-y-2">
              {predictions?.seasonalityPatterns?.slice(0, 3).map((pattern: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium">{pattern.period}</div>
                    <div className="text-xs text-gray-500">{pattern.patternType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{pattern.averageBookings} rezerwacji</div>
                    <div className="text-xs text-gray-500">
                      {pattern.trend === 'increasing' ? '↗️ Rosnący' : 
                       pattern.trend === 'decreasing' ? '↘️ Spadający' : '→ Stabilny'}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  Brak danych o wzorcach
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Prognozy miesięczne</h4>
            <div className="space-y-2">
              {predictions?.revenuePrediction?.monthlyProjections?.slice(0, 3).map((projection: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="text-sm font-medium">{projection.month}</div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {safeFormatPrice(projection.predictedRevenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {projection.confidenceLevel?.toFixed(0)}% pewności
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  Brak danych o prognozach
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI recommendations jako alert boxes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rekomendacje AI</h3>
          <Lightbulb className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {predictions?.aiRecommendations?.map((recommendation: any, index: number) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              recommendation.priority === 'high' 
                ? 'bg-red-50 border-red-400' 
                : recommendation.priority === 'medium'
                ? 'bg-yellow-50 border-yellow-400'
                : 'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      recommendation.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : recommendation.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {recommendation.priority === 'high' ? 'Wysoki' : 
                       recommendation.priority === 'medium' ? 'Średni' : 'Niski'} priorytet
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Wpływ: {recommendation.impactScore}/100</span>
                    <span>Trudność: {recommendation.implementationDifficulty}/100</span>
                    <span>Kategoria: {recommendation.category}</span>
                  </div>
                  {recommendation.actionItems?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Akcje do wykonania:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {recommendation.actionItems.slice(0, 2).map((action: string, actionIndex: number) => (
                          <li key={actionIndex} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              Brak rekomendacji AI
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 