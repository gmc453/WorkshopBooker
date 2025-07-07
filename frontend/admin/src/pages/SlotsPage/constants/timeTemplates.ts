import type { TimeTemplate } from '../types'

export const TIME_TEMPLATES: TimeTemplate[] = [
  {
    name: "Standardowy dzień pracy",
    slots: [
      { start: "09:00", duration: 60 },
      { start: "10:30", duration: 60 },
      { start: "12:00", duration: 60 },
      { start: "14:00", duration: 60 },
      { start: "15:30", duration: 60 }
    ]
  },
  {
    name: "Sesje popołudniowe",
    slots: [
      { start: "14:00", duration: 90 },
      { start: "16:00", duration: 90 },
      { start: "18:00", duration: 60 }
    ]
  },
  {
    name: "Krótkie sesje",
    slots: [
      { start: "09:00", duration: 30 },
      { start: "09:45", duration: 30 },
      { start: "10:30", duration: 30 },
      { start: "11:15", duration: 30 }
    ]
  }
] as const 