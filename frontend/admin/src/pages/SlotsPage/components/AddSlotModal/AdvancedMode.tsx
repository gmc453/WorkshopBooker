import { Loader2, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { DURATION_OPTIONS } from '../../constants/durationOptions'
import { WEEK_DAYS } from '../../constants/weekDays'
import type { SlotFormData } from '../../types'

interface AdvancedModeProps {
  formData: SlotFormData
  setFormData: (data: SlotFormData) => void
  slotManagement: any
  onSlotCreated: () => void
  onClose: () => void
}

export default function AdvancedMode({
  formData,
  setFormData,
  slotManagement,
  onSlotCreated,
  onClose
}: AdvancedModeProps) {

  const handleAdvancedCreate = async () => {
    const success = await slotManagement.createMultipleSlots(formData)
    if (success) {
      onSlotCreated()
    }
  }

  const getPreviewSlots = () => {
    return slotManagement.generatePreviewSlots(formData)
  }

  const generateTimeSlots = (startHour = 8, endHour = 20) => {
    return Array.from({ length: endHour - startHour }, (_, i) => {
      const hour = startHour + i
      return `${hour.toString().padStart(2, '0')}:00`
    })
  }

  return (
    <div className="space-y-6">
      {/* Krok 1: Wybór typu powtarzania */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Jak chcesz utworzyć terminy?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormData({...formData, repeat: false, repeatType: 'single'})}
            className={`p-4 text-left border-2 rounded-lg ${
              (!formData.repeat || formData.repeatType === 'single')
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-medium text-gray-800">Jeden termin</h4>
            <p className="text-sm text-gray-600 mt-1">Dodaj pojedynczy termin</p>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData({...formData, repeat: true, repeatType: 'weekly'})}
            className={`p-4 text-left border-2 rounded-lg ${
              formData.repeat && formData.repeatType === 'weekly'
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-medium text-gray-800">Powtarzaj co tydzień</h4>
            <p className="text-sm text-gray-600 mt-1">Terminy w wybrane dni tygodnia</p>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData({...formData, repeat: true, repeatType: 'multiple'})}
            className={`p-4 text-left border-2 rounded-lg ${
              formData.repeat && formData.repeatType === 'multiple'
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-medium text-gray-800">Wiele terminów dziennie</h4>
            <p className="text-sm text-gray-600 mt-1">Kilka terminów w jednym dniu</p>
          </button>
        </div>
      </div>

      {/* Krok 2: Podstawowe ustawienia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.repeat ? 'Data rozpoczęcia' : 'Data terminu'}
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Czas trwania terminu</label>
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

      {/* Krok 3: Szczegóły w zależności od typu */}
      {(!formData.repeat || formData.repeatType === 'single') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Godzina terminu</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 md:w-1/2"
          />
        </div>
      )}

      {formData.repeat && formData.repeatType === 'weekly' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Godzina rozpoczęcia</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 md:w-1/2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Dni tygodnia</label>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => {
                    const isSelected = formData.repeatDays.includes(day.value)
                    const newDays = isSelected 
                      ? formData.repeatDays.filter(d => d !== day.value) 
                      : [...formData.repeatDays, day.value]
                    
                    setFormData({
                      ...formData,
                      repeatDays: newDays
                    })
                  }}
                  className={`px-4 py-2 text-sm rounded-lg font-medium ${
                    formData.repeatDays.includes(day.value)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Powtarzaj do</label>
            <input
              type="date"
              value={formData.repeatUntil ? format(formData.repeatUntil, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null
                setFormData({ ...formData, repeatUntil: date })
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 md:w-1/2"
              required={formData.repeat}
            />
          </div>
        </div>
      )}

      {formData.repeat && formData.repeatType === 'multiple' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Godziny terminów (kliknij aby dodać/usunąć)
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {generateTimeSlots().map(timeStr => {
                const isSelected = formData.multipleTimes?.includes(timeStr) || false
                
                return (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => {
                      const currentTimes = formData.multipleTimes || []
                      const newTimes = isSelected
                        ? currentTimes.filter(t => t !== timeStr)
                        : [...currentTimes, timeStr].sort()
                      
                      setFormData({
                        ...formData,
                        multipleTimes: newTimes
                      })
                    }}
                    className={`p-2 text-sm rounded-md font-medium ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {timeStr}
                  </button>
                )
              })}
            </div>
            {formData.multipleTimes && formData.multipleTimes.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Wybrano: {formData.multipleTimes.length} terminów
              </p>
            )}
          </div>
        </div>
      )}

      {/* Podgląd terminów */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Podgląd terminów do utworzenia
        </h4>
        <div className="max-h-32 overflow-y-auto">
          {getPreviewSlots().length === 0 ? (
            <p className="text-sm text-gray-500">Wypełnij formularz aby zobaczyć podgląd</p>
          ) : (
            <div className="space-y-1">
              {getPreviewSlots().slice(0, 10).map((slot: any, index: number) => (
                <div key={index} className="text-sm text-gray-700">
                  📅 {format(slot.date, 'dd.MM.yyyy (EEEE)', { locale: pl })} 
                  o {slot.startTime} - {slot.endTime}
                </div>
              ))}
              {getPreviewSlots().length > 10 && (
                <div className="text-sm text-gray-500">
                  ... i {getPreviewSlots().length - 10} więcej
                </div>
              )}
              <div className="text-sm font-medium text-blue-600 mt-2">
                Łącznie: {getPreviewSlots().length} terminów
              </div>
            </div>
          )}
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
          onClick={handleAdvancedCreate}
          disabled={slotManagement.isCreating || getPreviewSlots().length === 0}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {slotManagement.isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Tworzenie {getPreviewSlots().length} terminów...
            </>
          ) : (
            `Utwórz ${getPreviewSlots().length} terminów`
          )}
        </button>
      </div>
    </div>
  )
} 