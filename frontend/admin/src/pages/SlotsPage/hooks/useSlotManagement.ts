import { useState } from 'react'
import { useCreateSlot } from '../../../hooks/useCreateSlot'
import { useDeleteSlot } from '../../../hooks/useDeleteSlot'
import { format, addMinutes, addDays } from 'date-fns'
import type { SlotFormData, PreviewSlot, FeedbackMessage } from '../types'

export const useSlotManagement = (selectedWorkshopId: string | null) => {
  const createSlot = useCreateSlot(selectedWorkshopId ?? '')
  const deleteSlot = useDeleteSlot()
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)

  const generatePreviewSlots = (formData: SlotFormData): PreviewSlot[] => {
    if (!formData.date) return []
    
    const preview: PreviewSlot[] = []
    
    const addSlotForDateTime = (date: Date, timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const start = new Date(date)
      start.setHours(hours, minutes, 0, 0)
      const end = addMinutes(start, formData.duration)
      
      preview.push({
        date: start,
        startTime: format(start, "HH:mm"),
        endTime: format(end, "HH:mm")
      })
    }
    
    if (!formData.repeat || formData.repeatType === 'single') {
      addSlotForDateTime(formData.date, formData.startTime)
    } else if (formData.repeatType === 'weekly') {
      if (!formData.repeatUntil || formData.repeatDays.length === 0) return []
      
      let currentDate = new Date(formData.date)
      const lastDate = new Date(formData.repeatUntil)
      
      while (currentDate <= lastDate) {
        const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay()
        if (formData.repeatDays.includes(dayOfWeek)) {
          addSlotForDateTime(currentDate, formData.startTime)
        }
        currentDate = addDays(currentDate, 1)
      }
    } else if (formData.repeatType === 'multiple') {
      if (!formData.multipleTimes || formData.multipleTimes.length === 0) return []
      for (const timeStr of formData.multipleTimes) {
        addSlotForDateTime(formData.date, timeStr)
      }
    }
    
    return preview.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const createSingleSlot = async (formData: SlotFormData): Promise<boolean> => {
    if (!selectedWorkshopId || !formData.date) return false

    try {
      const [hours, minutes] = formData.startTime.split(':').map(Number)
      const startDateTime = new Date(formData.date)
      startDateTime.setHours(hours, minutes, 0, 0)
      const endDateTime = addMinutes(startDateTime, formData.duration)
      
      await createSlot.mutateAsync({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      })
      
      setFeedback({
        message: 'Termin został dodany pomyślnie',
        type: 'success'
      })
      return true
    } catch (error: any) {
      console.error('Błąd podczas tworzenia terminu:', error)
      
      // Sprawdzamy czy to błąd nakładających się terminów
      if (error.response?.status === 409) {
        setFeedback({
          message: 'Termin nakłada się z już istniejącym terminem. Wybierz inny czas.',
          type: 'error'
        })
      } else {
        setFeedback({
          message: error.response?.data?.details || 'Wystąpił błąd podczas dodawania terminu',
          type: 'error'
        })
      }
      return false
    }
  }

  const createMultipleSlots = async (formData: SlotFormData): Promise<boolean> => {
    if (!selectedWorkshopId) return false
    
    const slotsToCreate = generatePreviewSlots(formData)
    if (slotsToCreate.length === 0) return false
    
    try {
      let createdCount = 0
      let overlapErrors = 0
      
      for (const slot of slotsToCreate) {
        const [hours, minutes] = slot.startTime.split(':').map(Number)
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number)
        
        const startDateTime = new Date(slot.date)
        startDateTime.setHours(hours, minutes, 0, 0)
        const endDateTime = new Date(slot.date)
        endDateTime.setHours(endHours, endMinutes, 0, 0)
        
        try {
          await createSlot.mutateAsync({
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString()
          })
          createdCount++
        } catch (error: any) {
          if (error.response?.status === 409) {
            overlapErrors++
          } else {
            throw error // Rzucamy inne błędy
          }
        }
      }
      
      if (createdCount > 0) {
        const termText = createdCount === 1 ? 'termin' : (createdCount < 5 ? 'terminy' : 'terminów')
        let message = `Utworzono pomyślnie ${createdCount} ${termText}`
        
        if (overlapErrors > 0) {
          const overlapText = overlapErrors === 1 ? 'termin' : (overlapErrors < 5 ? 'terminy' : 'terminów')
          message += `. ${overlapErrors} ${overlapText} pominięto (nakładanie się z istniejącymi terminami)`
        }
        
        setFeedback({
          message,
          type: 'success'
        })
        return true
      } else if (overlapErrors > 0) {
        setFeedback({
          message: 'Wszystkie terminy nakładają się z już istniejącymi terminami',
          type: 'error'
        })
        return false
      } else {
        setFeedback({
          message: 'Wystąpił błąd podczas tworzenia terminów',
          type: 'error'
        })
        return false
      }
    } catch (error: any) {
      console.error('Błąd podczas tworzenia terminów:', error)
      setFeedback({
        message: error.response?.data?.details || 'Wystąpił błąd podczas tworzenia terminów',
        type: 'error'
      })
      return false
    }
  }

  const createSlotsFromTemplate = async (template: any, date: Date): Promise<boolean> => {
    if (!selectedWorkshopId || !date) return false
    
    try {
      let createdCount = 0
      let overlapErrors = 0
      
      for (const slot of template.slots) {
        const [hours, minutes] = slot.start.split(':').map(Number)
        
        const startDateTime = new Date(date)
        startDateTime.setHours(hours, minutes, 0, 0)
        
        const endDateTime = addMinutes(startDateTime, slot.duration)
        
        try {
          await createSlot.mutateAsync({
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString()
          })
          createdCount++
        } catch (error: any) {
          if (error.response?.status === 409) {
            overlapErrors++
          } else {
            throw error // Rzucamy inne błędy
          }
        }
      }
      
      if (createdCount > 0) {
        let message = `Utworzono ${createdCount} terminów z szablonu "${template.name}"`
        
        if (overlapErrors > 0) {
          const overlapText = overlapErrors === 1 ? 'termin' : (overlapErrors < 5 ? 'terminy' : 'terminów')
          message += `. ${overlapErrors} ${overlapText} pominięto (nakładanie się z istniejącymi terminami)`
        }
        
        setFeedback({
          message,
          type: 'success'
        })
        return true
      } else if (overlapErrors > 0) {
        setFeedback({
          message: 'Wszystkie terminy z szablonu nakładają się z już istniejącymi terminami',
          type: 'error'
        })
        return false
      } else {
        setFeedback({
          message: 'Wystąpił błąd podczas tworzenia terminów',
          type: 'error'
        })
        return false
      }
    } catch (error: any) {
      console.error('Błąd podczas tworzenia terminów z szablonu:', error)
      setFeedback({
        message: error.response?.data?.details || 'Wystąpił błąd podczas tworzenia terminów',
        type: 'error'
      })
      return false
    }
  }

  const bulkDeleteSlots = async (slotIds: string[]): Promise<boolean> => {
    if (slotIds.length === 0) return false
    
    try {
      let deletedCount = 0
      let errors = 0
      
      for (const slotId of slotIds) {
        try {
          await deleteSlot.mutateAsync(slotId)
          deletedCount++
        } catch (error: any) {
          console.error('Błąd podczas usuwania terminu:', error)
          errors++
        }
      }
      
      if (deletedCount > 0) {
        const termText = deletedCount === 1 ? 'termin' : (deletedCount < 5 ? 'terminy' : 'terminów')
        let message = `Usunięto ${deletedCount} ${termText}`
        
        if (errors > 0) {
          const errorText = errors === 1 ? 'termin' : (errors < 5 ? 'terminy' : 'terminów')
          message += `. ${errors} ${errorText} nie udało się usunąć`
        }
        
        setFeedback({
          message,
          type: 'success'
        })
        return true
      } else {
        setFeedback({
          message: 'Nie udało się usunąć żadnego terminu',
          type: 'error'
        })
        return false
      }
    } catch (error: any) {
      console.error('Błąd podczas usuwania terminów:', error)
      setFeedback({
        message: error.response?.data?.details || 'Wystąpił błąd podczas usuwania terminów',
        type: 'error'
      })
      return false
    }
  }

  return {
    createSingleSlot,
    createMultipleSlots,
    createSlotsFromTemplate,
    bulkDeleteSlots,
    generatePreviewSlots,
    feedback,
    setFeedback,
    isCreating: createSlot.isPending,
    isDeleting: deleteSlot.isPending
  }
} 