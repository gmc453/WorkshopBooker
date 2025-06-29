import { useState } from 'react'
import BookingList from '../components/BookingList'
import MyBookingsList from '../components/MyBookingsList'
import Header from '../components/Header'
import '../App.css'
import type { FC } from 'react'
import { useMyWorkshops } from '../hooks/useMyWorkshops'
import { Loader2, Building, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

const DashboardPage: FC = () => {
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')
  const { data: workshops, isLoading: isLoadingWorkshops, isError: isWorkshopsError } = useMyWorkshops()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Zarządzanie rezerwacjami</h2>
          <p className="text-gray-600">Przeglądaj i zarządzaj rezerwacjami w systemie</p>
        </div>

        {/* Skróty do najważniejszych funkcji */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4 text-blue-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">Rezerwacje</h3>
              <p className="text-sm text-gray-500">Zarządzaj rezerwacjami</p>
            </div>
          </Link>
          <Link to="/slots" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4 text-green-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">Dostępne terminy</h3>
              <p className="text-sm text-gray-500">Zarządzaj slotami czasowymi</p>
            </div>
          </Link>
        </div>

        {/* Wybór warsztatu */}
        <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Wybierz warsztat</h3>
          
          {isLoadingWorkshops ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Ładowanie warsztatów...</span>
            </div>
          ) : isWorkshopsError ? (
            <div className="text-red-600">
              Wystąpił błąd podczas ładowania warsztatów. Odśwież stronę.
            </div>
          ) : !workshops || workshops.length === 0 ? (
            <div className="text-gray-600">
              Nie masz jeszcze żadnych warsztatów. Skontaktuj się z administratorem.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {workshops.map(workshop => (
                <button
                  key={workshop.id}
                  onClick={() => setSelectedWorkshopId(workshop.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedWorkshopId === workshop.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Building className={`w-5 h-5 mt-0.5 ${
                      selectedWorkshopId === workshop.id ? 'text-blue-500' : 'text-gray-500'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        selectedWorkshopId === workshop.id ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {workshop.name}
                      </h4>
                      {workshop.address && (
                        <p className="text-sm text-gray-500 mt-1">{workshop.address}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Moje rezerwacje
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wszystkie rezerwacje
            </button>
          </nav>
        </div>
        
        {activeTab === 'my' ? (
          <MyBookingsList />
        ) : (
          selectedWorkshopId ? (
            <BookingList workshopId={selectedWorkshopId} />
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Wybierz warsztat</h3>
              <p className="text-gray-500">Aby zobaczyć rezerwacje, wybierz warsztat z listy powyżej.</p>
            </div>
          )
        )}
      </main>
    </div>
  )
}

export default DashboardPage 