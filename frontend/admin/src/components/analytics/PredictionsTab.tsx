import React from 'react';
import { Target, TrendingUp, Calendar, Lightbulb } from 'lucide-react';

interface PredictionsTabProps {
  workshopId: string;
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ workshopId: _workshopId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <Target className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-purple-900">Prognozy AI</h3>
        </div>
        <p className="text-purple-700 mt-2">
          Ta funkcja będzie dostępna w następnej wersji. Będzie zawierać przewidywania przychodów, 
          optymalne godziny dla nowych slotów i rekomendacje biznesowe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Przewidywane przychody</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">następny miesiąc</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Przewidywane rezerwacje</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">następny miesiąc</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Optymalne godziny</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">dla nowych slotów</p>
            </div>
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planowane funkcje AI</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Przewidywania przychodów na podstawie historycznych danych</span>
          </div>
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Optymalne godziny dla nowych slotów czasowych</span>
          </div>
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Rekomendacje cenowe dla usług</span>
          </div>
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Analiza sezonowości i trendów</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 