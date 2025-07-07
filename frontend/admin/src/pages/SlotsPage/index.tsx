import { useState } from 'react'
import Header from '../../components/Header'
import WorkshopCards from './components/WorkshopCards'
import CalendarView from './components/CalendarView'
import AddSlotModal from './components/AddSlotModal'
import FeedbackToast from './components/FeedbackToast'
import { useMyWorkshops } from '../../hooks/useMyWorkshops'
import { useWorkshopSelection } from './hooks/useWorkshopSelection'
import { useSlotManagement } from './hooks/useSlotManagement'
import { useWorkshopSlots } from '../../hooks/useWorkshopSlots'
import { Calendar, Loader2 } from 'lucide-react'


export default function SlotsPage() {
  const { data: workshops, isLoading: isLoadingWorkshops } = useMyWorkshops()
  const { selectedWorkshopId, setSelectedWorkshopId } = useWorkshopSelection(workshops)
  const { data: slots, refetch, isLoading: isLoadingSlots } = useWorkshopSlots(selectedWorkshopId ?? '')
  
  // State management
  const [showModal, setShowModal] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [initialModalDate, setInitialModalDate] = useState<Date | undefined>()
  
  // Business logic
  const slotManagement = useSlotManagement(selectedWorkshopId)

  const handleSlotCreated = () => {
    setShowModal(false)
    refetch()
  }

  const handleBulkDelete = async () => {
    if (selectedSlots.size === 0) return
    if (!confirm(`Czy na pewno chcesz usunąć ${selectedSlots.size} wybranych terminów?`)) return
    
    const success = await slotManagement.bulkDeleteSlots(Array.from(selectedSlots))
    if (success) {
      setSelectedSlots(new Set())
      refetch()
    }
  }

  const handleDateClick = (date: Date) => {
    setInitialModalDate(date)
    setShowModal(true)
  }

  if (isLoadingWorkshops) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Zarządzanie terminami</h2>
          <p className="text-gray-600">Twórz i zarządzaj dostępnymi terminami dla swoich warsztatów</p>
        </div>
        
        <FeedbackToast 
          feedback={slotManagement.feedback} 
          onClose={() => slotManagement.setFeedback(null)} 
        />

        <WorkshopCards 
          workshops={workshops}
          selectedWorkshopId={selectedWorkshopId}
          onSelectWorkshop={setSelectedWorkshopId}
        />
        
        {selectedWorkshopId ? (
          <CalendarView
            workshopId={selectedWorkshopId}
            workshops={workshops}
            slots={slots}
            isLoading={isLoadingSlots}
            selectedSlots={selectedSlots}
            onSelectSlot={setSelectedSlots}
            onBulkDelete={handleBulkDelete}
            onAddSlot={() => setShowModal(true)}
            onDateClick={handleDateClick}
          />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Wybierz warsztat</h3>
            <p className="text-gray-500">Kliknij na jedną z kart warsztatów powyżej, aby rozpocząć zarządzanie terminami.</p>
          </div>
        )}
      </main>
      
      {showModal && (
        <AddSlotModal
          selectedWorkshopId={selectedWorkshopId}
          onClose={() => {
            setShowModal(false)
            setInitialModalDate(undefined)
          }}
          onSlotCreated={handleSlotCreated}
          slotManagement={slotManagement}
          initialDate={initialModalDate}
        />
      )}
    </div>
  )
} 