import React from 'react';
import { Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';

interface SeasonalTabProps {
  workshopId: string;
}

export const SeasonalTab: React.FC<SeasonalTabProps> = ({ workshopId: _workshopId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-green-900">Analityka sezonowa</h3>
        </div>
        <p className="text-green-700 mt-2">
          Ta funkcja będzie dostępna w następnej wersji. Będzie zawierać trendy miesięczne/tygodniowe, 
          dni tygodnia z największą aktywnością i porównanie rok do roku.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Najlepszy dzień</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">tygodnia</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Godziny szczytu</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">największa aktywność</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wzrost rok do roku</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">porównanie</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planowane funkcje sezonowe</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Trendy miesięczne/tygodniowe</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Dni tygodnia z największą aktywnością</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Godziny szczytu</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Porównanie rok do roku</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 