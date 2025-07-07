import { useState } from 'react'
import { X } from 'lucide-react'
import QuickMode from './QuickMode'
import AdvancedMode from './AdvancedMode'
import type { SlotFormData } from '../../types'

interface AddSlotModalProps {
  selectedWorkshopId: string | null
  onClose: () => void
  onSlotCreated: () => void
  slotManagement: any
  initialDate?: Date
}

export default function AddSlotModal({
  onClose,
  onSlotCreated,
  slotManagement,
  initialDate
}: AddSlotModalProps) {
  const [formData, setFormData] = useState<SlotFormData>({
    mode: 'quick',
    date: initialDate || null,
    startTime: '09:00',
    duration: 60,
    repeat: false,
    repeatUntil: null,
    repeatDays: [1, 2, 3, 4, 5],
    repeatType: 'single',
    multipleTimes: [],
  })

  const handleClose = () => {
    setFormData({
      mode: 'quick',
      date: null,
      startTime: '09:00',
      duration: 60,
      repeat: false,
      repeatUntil: null,
      repeatDays: [1, 2, 3, 4, 5],
      repeatType: 'single',
      multipleTimes: [],
    })
    onClose()
  }

  const handleSlotCreated = () => {
    onSlotCreated()
    handleClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Dodaj nowe terminy</h3>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Tryby dodawania */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setFormData({...formData, mode: 'quick'})}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                  formData.mode === 'quick' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Szybkie dodawanie
              </button>
              <button
                onClick={() => setFormData({...formData, mode: 'advanced'})}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                  formData.mode === 'advanced' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Zaawansowane
              </button>
            </div>
          </div>

          {formData.mode === 'quick' ? (
            <QuickMode
              formData={formData}
              setFormData={setFormData}
              slotManagement={slotManagement}
              onSlotCreated={handleSlotCreated}
              onClose={handleClose}
            />
          ) : (
            <AdvancedMode
              formData={formData}
              setFormData={setFormData}
              slotManagement={slotManagement}
              onSlotCreated={handleSlotCreated}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  )
} 