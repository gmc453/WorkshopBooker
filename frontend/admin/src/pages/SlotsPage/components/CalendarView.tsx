import { useState, useMemo } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import plLocale from '@fullcalendar/core/locales/pl'
import type { Workshop } from '../../../types/workshop'
import type { Slot } from '../../../types/slot'
import type { CalendarEvent } from '../types'

interface CalendarViewProps {
  workshopId: string
  workshops?: Workshop[]
  slots?: Slot[]
  isLoading: boolean
  selectedSlots: Set<string>
  onSelectSlot: (slots: Set<string>) => void
  onBulkDelete: () => void
  onAddSlot: () => void
  onDateClick: (date: Date) => void
}

export default function CalendarView({
  workshopId,
  workshops,
  slots,
  isLoading,
  selectedSlots,
  onSelectSlot,
  onBulkDelete,
  onAddSlot,
  onDateClick
}: CalendarViewProps) {
  const [calendarView, setCalendarView] = useState<'timeGridWeek' | 'dayGridMonth'>('timeGridWeek')

  // Konwersja slotów na wydarzenia kalendarza
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!slots) return []
    
    return slots.map(slot => ({
      id: `slot-${slot.id}`,
      title: 'Dostępny termin',
      start: slot.startTime,
      end: slot.endTime,
      backgroundColor: selectedSlots.has(slot.id) ? '#ef4444' : '#10b981', // red if selected, green if available
      borderColor: selectedSlots.has(slot.id) ? '#dc2626' : '#059669',
      extendedProps: {
        slotId: slot.id
      }
    }))
  }, [slots, selectedSlots])

  const handleDateClick = (info: any) => {
    const clickedDate = new Date(info.date)
    
    onDateClick(clickedDate)
  }

  const handleEventClick = (info: any) => {
    const slotId = info.event.extendedProps.slotId
    
    if (selectedSlots.has(slotId)) {
      const newSelected = new Set(selectedSlots)
      newSelected.delete(slotId)
      onSelectSlot(newSelected)
    } else {
      onSelectSlot(new Set([...selectedSlots, slotId]))
    }
  }

  const selectedWorkshop = workshops?.find(w => w.id === workshopId)

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
        
        <div className="flex space-x-2">
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setCalendarView('timeGridWeek')}
              className={`px-3 py-2 text-sm ${calendarView === 'timeGridWeek' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              Tydzień
            </button>
            <button
              onClick={() => setCalendarView('dayGridMonth')}
              className={`px-3 py-2 text-sm ${calendarView === 'dayGridMonth' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              Miesiąc
            </button>
          </div>
          <button
            onClick={onAddSlot}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Dodaj terminy
          </button>
        </div>
      </div>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>💡 <strong>Wskazówka:</strong> Kliknij datę aby szybko dodać termin, lub kliknij istniejący termin aby go zaznaczyć</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="calendar-container" style={{ height: 'calc(80vh - 200px)', minHeight: '500px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={calendarView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            locale={plLocale}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            nowIndicator={true}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            height="100%"
            slotDuration="00:15:00"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>
      )}
    </div>
  )
} 