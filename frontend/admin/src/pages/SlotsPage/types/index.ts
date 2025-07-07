export interface Workshop {
  id: string
  name: string
  description: string
  address?: string
}

export interface Slot {
  id: string
  startTime: string
  endTime: string
  status: number
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor?: string
  borderColor?: string
  extendedProps?: {
    slotId: string
  }
}

export interface SlotFormData {
  mode: 'quick' | 'advanced'
  date: Date | null
  startTime: string
  duration: number
  repeat: boolean
  repeatUntil: Date | null
  repeatDays: number[]
  repeatType?: 'single' | 'weekly' | 'multiple'
  multipleTimes?: string[]
  template?: string
}

export interface FeedbackMessage {
  message: string
  type: 'success' | 'error'
}

export interface WorkshopStats {
  totalSlots: number
  thisWeekSlots: number
  upcomingBookings: number
}

export interface TimeTemplate {
  name: string
  slots: Array<{
    start: string
    duration: number
  }>
}

export interface DurationOption {
  value: number
  label: string
}

export interface WeekDay {
  value: number
  label: string
}

export interface PreviewSlot {
  date: Date
  startTime: string
  endTime: string
} 