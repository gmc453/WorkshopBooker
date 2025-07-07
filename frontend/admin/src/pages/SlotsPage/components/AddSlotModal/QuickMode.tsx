import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { TIME_TEMPLATES } from '../../constants/timeTemplates'
import { DURATION_OPTIONS } from '../../constants/durationOptions'
import type { SlotFormData } from '../../types'

interface QuickModeProps {
  formData: SlotFormData
  setFormData: (data: SlotFormData) => void
  slotManagement: any
  onSlotCreated: () => void
  onClose: () => void
}

export default function QuickMode({
  formData,
  setFormData,
  slotManagement,
  onSlotCreated,
  onClose
}: QuickModeProps) {

  const handleQuickCreate = async () => {
    if (!formData.date) return
    
    const success = await slotManagement.createSingleSlot(formData)
    if (success) {
      onSlotCreated()
    }
  }

  const handleTemplateCreate = async (template: any) => {
    if (!formData.date) return
    
    const success = await slotManagement.createSlotsFromTemplate(template, formData.date)
    if (success) {
      onSlotCreated()
    }
  }

  return (
    <div className="space-y-6">
      {/* Szybkie dodawanie pojedynczego terminu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
          <input
            type="date"
            value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const selectedDate = e.target.value ? new Date(e.target.value) : null
              setFormData({ ...formData, date: selectedDate })
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Godzina</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Czas trwania</label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {DURATION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Szablony terminów */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Lub wybierz szablon na cały dzień:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIME_TEMPLATES.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateCreate(template)}
              disabled={!formData.date || slotManagement.isCreating}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
              <div className="text-sm text-gray-600">
                {template.slots.map((slot, i) => (
                  <div key={i}>{slot.start} ({slot.duration}min)</div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Anuluj
        </button>
        <button
          onClick={handleQuickCreate}
          disabled={slotManagement.isCreating || !formData.date}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {slotManagement.isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Dodawanie...
            </>
          ) : (
            'Dodaj termin'
          )}
        </button>
      </div>
    </div>
  )
} 