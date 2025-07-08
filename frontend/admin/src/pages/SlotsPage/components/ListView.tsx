import { useState, useMemo } from 'react'
import { Loader2, Plus, Trash2, Calendar, Clock, Edit, CheckSquare, Square } from 'lucide-react'
import type { Workshop } from '../../../types/workshop'
import type { Slot } from '../../../types/slot'

interface ListViewProps {
  workshopId: string
  workshops?: Workshop[]
  slots?: Slot[]
  isLoading: boolean
  selectedSlots: Set<string>
  onSelectSlot: (slots: Set<string>) => void
  onBulkDelete: () => void
  onAddSlot: () => void
  onEditSlot: (slotId: string) => void
}

export default function ListView({
  workshopId,
  workshops,
  slots,
  isLoading,
  selectedSlots,
  onSelectSlot,
  onBulkDelete,
  onAddSlot,
  onEditSlot
}: ListViewProps) {
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'duration'>('date')
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'booked'>('all')

  const selectedWorkshop = workshops?.find(w => w.id === workshopId)

  // Sortowanie i filtrowanie slotów
  const sortedAndFilteredSlots = useMemo(() => {
    if (!slots) return []

    let filtered = slots

    // Filtrowanie
    if (filterStatus === 'available') {
      filtered = filtered.filter(slot => slot.status === 0)
    } else if (filterStatus === 'booked') {
      filtered = filtered.filter(slot => slot.status > 0)
    }

    // Sortowanie
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        case 'time':
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        case 'duration':
          const durationA = new Date(a.endTime).getTime() - new Date(a.startTime).getTime()
          const durationB = new Date(b.endTime).getTime() - new Date(b.startTime).getTime()
          return durationA - durationB
        default:
          return 0
      }
    })
  }, [slots, sortBy, filterStatus])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`
    }
    return `${diffMinutes}min`
  }

  const handleSelectAll = () => {
    if (selectedSlots.size === sortedAndFilteredSlots.length) {
      onSelectSlot(new Set())
    } else {
      onSelectSlot(new Set(sortedAndFilteredSlots.map(slot => slot.id)))
    }
  }

  const handleSelectSlot = (slotId: string) => {
    const newSelected = new Set(selectedSlots)
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId)
    } else {
      newSelected.add(slotId)
    }
    onSelectSlot(newSelected)
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedWorkshop?.name}
          </h3>
          {selectedSlots.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Wybrano: {selectedSlots.size}
              </span>
              <button
                onClick={onBulkDelete}
                className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Usuń wybrane
              </button>
              <button
                onClick={() => onSelectSlot(new Set())}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Anuluj
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={onAddSlot}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Dodaj terminy
        </button>
      </div>

      {/* Filtry i sortowanie */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sortuj według:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'time' | 'duration')}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="date">Data</option>
            <option value="time">Czas</option>
            <option value="duration">Czas trwania</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'booked')}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="all">Wszystkie</option>
            <option value="available">Dostępne</option>
            <option value="booked">Zarezerwowane</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            {selectedSlots.size === sortedAndFilteredSlots.length && sortedAndFilteredSlots.length > 0 ? (
              <CheckSquare className="h-4 w-4 mr-1" />
            ) : (
              <Square className="h-4 w-4 mr-1" />
            )}
            {selectedSlots.size === sortedAndFilteredSlots.length && sortedAndFilteredSlots.length > 0 
              ? 'Odznacz wszystkie' 
              : 'Zaznacz wszystkie'
            }
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : sortedAndFilteredSlots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Brak terminów</h3>
          <p className="text-gray-500 mb-4">
            {filterStatus === 'all' 
              ? 'Nie ma jeszcze żadnych terminów dla tego warsztatu.' 
              : `Nie ma terminów ze statusem "${filterStatus === 'available' ? 'dostępne' : 'zarezerwowane'}"`
            }
          </p>
          <button
            onClick={onAddSlot}
            className="flex items-center mx-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Dodaj pierwszy termin
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSlots.size === sortedAndFilteredSlots.length && sortedAndFilteredSlots.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Czas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Czas trwania
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSlots.has(slot.id)}
                      onChange={() => handleSelectSlot(slot.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(slot.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(slot.startTime, slot.endTime)}
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                       slot.status > 0 
                         ? 'bg-red-100 text-red-800' 
                         : 'bg-green-100 text-green-800'
                     }`}>
                       {slot.status > 0 ? 'Zarezerwowany' : 'Dostępny'}
                     </span>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEditSlot(slot.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edytuj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 