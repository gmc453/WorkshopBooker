import { useState } from 'react'
import BookingList from '../components/BookingList'
import Header from '../components/Header'
import '../App.css'
import type { FC } from 'react'

const DashboardPage: FC = () => {
  const [workshopId] = useState('616c7175-d74e-4b40-91f5-7630b64ee801')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Zarządzanie rezerwacjami</h2>
          <p className="text-gray-600">Przeglądaj i zarządzaj rezerwacjami w systemie</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <BookingList workshopId={workshopId} />
        </div>
      </main>
    </div>
  )
}

export default DashboardPage 