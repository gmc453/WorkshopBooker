import React from 'react';
import { Users, UserPlus, Star, Clock } from 'lucide-react';

interface CustomersTabProps {
  workshopId: string;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ workshopId: _workshopId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-900">Analityka klientów</h3>
        </div>
        <p className="text-blue-700 mt-2">
          Ta funkcja będzie dostępna w następnej wersji. Będzie zawierać analizę nowych vs powracających klientów, 
          średnią wartość klienta (LTV) i segmentację klientów.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nowi klienci</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">w tym miesiącu</p>
            </div>
            <UserPlus className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Powracający</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">klienci</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Średnia LTV</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">wartość klienta</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planowane funkcje</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Analiza nowych vs powracających klientów</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Średnia wartość klienta (LTV)</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Najpopularniejsi klienci</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Segmentacja klientów</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 