import { useState } from 'react'
import { useMyWorkshops } from '../hooks/useMyWorkshops'
import { useWorkshopSlots } from '../hooks/useWorkshopSlots'
import { useCreateSlot } from '../hooks/useCreateSlot'
import { useDeleteSlot } from '../hooks/useDeleteSlot'
import Header from '../components/Header'
import { Loader2, Plus, Trash2, Calendar, Clock } from 'lucide-react'

export default function SlotsPage() {
  const { data: workshops, isLoading: isLoadingWorkshops } = useMyWorkshops()
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null)
  const { data: slots, refetch, isLoading: isLoadingSlots } = useWorkshopSlots(selectedWorkshopId ?? '')
  const createSlot = useCreateSlot(selectedWorkshopId ?? '')
  const deleteSlot = useDeleteSlot()
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [showForm, setShowForm] = useState(false)
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const handleCreate = async () => {
    if (!startDate || !startTime || !duration) {
      setFeedback({
        message: 'Wypełnij wszystkie pola formularza',
        type: 'error'
      })
      return
    }

    try {
      // Combine date and time into ISO string
      const startDateTime = new Date(`${startDate}T${startTime}:00`)
      
      // Calculate end time based on duration in minutes
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000)
      
      await createSlot.mutateAsync({ 
        startTime: startDateTime.toISOString(), 
        endTime: endDateTime.toISOString() 
      })
      
      setFeedback({
        message: 'Slot został pomyślnie utworzony',
        type: 'success'
      })
      
      // Reset form
      setStartDate('')
      setStartTime('')
      setDuration('60')
      setShowForm(false)
      
      // Refresh slots
      refetch()
    } catch (error) {
      setFeedback({
        message: 'Wystąpił błąd podczas tworzenia slotu',
        type: 'error'
      })
      console.error(error)
    }
  }

  const handleDelete = async (slotId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten slot? Ta operacja jest nieodwracalna.')) {
      return
    }

    try {
      await deleteSlot.mutateAsync(slotId)
      setFeedback({
        message: 'Slot został usunięty',
        type: 'success'
      })
      refetch()
    } catch (error) {
      setFeedback({
        message: 'Wystąpił błąd podczas usuwania slotu',
        type: 'error'
      })
      console.error(error)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pl-PL'),
      time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Zarządzanie slotami czasowymi</h2>
          <p className="text-gray-600">Dodawaj i zarządzaj dostępnymi terminami dla klientów</p>
        </div>
        
        {feedback && (
          <div className={`p-4 mb-6 rounded-lg ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {feedback.message}
            <button 
              className="ml-2 text-sm" 
              onClick={() => setFeedback(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Wybierz warsztat</h3>
          {isLoadingWorkshops ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              <span>Ładowanie warsztatów...</span>
            </div>
          ) : (
            <select 
              value={selectedWorkshopId ?? ''} 
              onChange={e => setSelectedWorkshopId(e.target.value || null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Wybierz warsztat</option>
              {workshops?.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          )}
        </div>
        
        {selectedWorkshopId && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Dostępne sloty</h3>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj slot
                </button>
              </div>
              
              {showForm && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-md font-medium mb-4">Nowy slot</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Godzina rozpoczęcia</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Czas trwania (minuty)</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="15">15 minut</option>
                        <option value="30">30 minut</option>
                        <option value="45">45 minut</option>
                        <option value="60">1 godzina</option>
                        <option value="90">1,5 godziny</option>
                        <option value="120">2 godziny</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={createSlot.isPending}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {createSlot.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Utwórz slot
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isLoadingSlots ? (
                <div className="flex items-center space-x-2 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  <span>Ładowanie slotów...</span>
                </div>
              ) : slots?.length === 0 ? (
                <p className="text-gray-500 py-4">Brak dostępnych slotów. Dodaj pierwszy slot, aby klienci mogli rezerwować terminy.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {slots?.map(s => {
                    const { date: startDate, time: startTime } = formatDateTime(s.startTime)
                    const { time: endTime } = formatDateTime(s.endTime)
                    return (
                      <div key={s.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 rounded-lg p-2 text-blue-700">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{startDate}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{startTime} - {endTime}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                          title="Usuń slot"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {!selectedWorkshopId && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Wybierz warsztat</h3>
            <p className="text-gray-500">Aby zarządzać slotami, wybierz warsztat z listy powyżej.</p>
          </div>
        )}
      </main>
    </div>
  )
}
