import { useState, useEffect } from 'react'
import type { Workshop } from '../../../types/workshop'

export const useWorkshopSelection = (workshops?: Workshop[]) => {
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null)

  // Wybierz pierwszy warsztat automatycznie
  useEffect(() => {
    if (workshops && workshops.length > 0 && !selectedWorkshopId) {
      setSelectedWorkshopId(workshops[0].id)
    }
  }, [workshops, selectedWorkshopId])

  return {
    selectedWorkshopId,
    setSelectedWorkshopId
  }
} 