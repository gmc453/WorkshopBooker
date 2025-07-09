import React from 'react';
import { Users, UserPlus, Star, Clock, Award, PieChart, BarChart3 } from 'lucide-react';
import { useCustomerAnalytics } from '../../hooks/useCustomerAnalytics';
import { safeFormatPrice } from '../../utils/safeAccess';

interface CustomersTabProps {
  workshopId: string;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ workshopId }) => {
  const { data: customerData, isLoading, error } = useCustomerAnalytics(workshopId);

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
          <Clock className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-900">Błąd ładowania danych</h3>
        </div>
        <p className="text-red-700 mt-2">
          Nie udało się załadować danych o klientach. Spróbuj ponownie później.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI cards: Nowi klienci, Powracający, LTV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nowi klienci</p>
              <p className="text-2xl font-bold text-gray-900">
                {customerData?.newCustomers || 0}
              </p>
              <p className="text-sm text-gray-500">w tym miesiącu</p>
            </div>
            <UserPlus className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Powracający</p>
              <p className="text-2xl font-bold text-gray-900">
                {customerData?.returningCustomers || 0}
              </p>
              <p className="text-sm text-gray-500">klienci</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Średnia LTV</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeFormatPrice(customerData?.averageCustomerValue || 0)}
              </p>
              <p className="text-sm text-gray-500">wartość klienta</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Chart: Pie chart nowi vs powracający */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rozkład klientów</h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium">Nowi klienci</span>
              </div>
              <span className="font-bold text-green-600">
                {customerData?.newCustomers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium">Powracający</span>
              </div>
              <span className="font-bold text-blue-600">
                {customerData?.returningCustomers || 0}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {customerData?.totalCustomers || 0}
              </div>
              <div className="text-sm text-gray-500">Łącznie klientów</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Top klienci z liczbą rezerwacji */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Najlepsi klienci</h3>
          <Award className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rezerwacje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wartość
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customerData?.topCustomers?.slice(0, 5).map((customer: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.customerName || customer.customerEmail}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.totalBookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {safeFormatPrice(customer.totalSpent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ⭐ {customer.averageRating.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.customerType === 'returning' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {customer.customerType === 'returning' ? 'Powracający' : 'Nowy'}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Brak danych o klientach
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Segmentacja: karty z różnymi segmentami */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Segmentacja klientów</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerData?.customerSegments?.map((segment: any, index: number) => (
            <div key={index} className="border rounded-lg p-4" style={{ borderColor: segment.color }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{segment.segmentName}</h4>
                <div className="text-sm text-gray-500">{segment.customerCount} klientów</div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Przychody:</span>
                  <span className="font-medium">{safeFormatPrice(segment.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Średnia ocena:</span>
                  <span className="font-medium">⭐ {segment.averageRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Średnia wartość:</span>
                  <span className="font-medium">{safeFormatPrice(segment.averageOrderValue)}</span>
                </div>
              </div>
            </div>
          )) || (
            <div className="col-span-full text-center text-gray-500 py-8">
              Brak danych o segmentacji klientów
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 