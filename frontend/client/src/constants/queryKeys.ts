/**
 * Stałe dla query keys używanych w React Query
 * Zastępuje magic strings w całej aplikacji
 */
export const QueryKeys = {
  // Workshop related queries
  WORKSHOPS: 'workshops',
  WORKSHOP_DETAILS: 'workshop-details',
  
  // Slot related queries
  AVAILABLE_SLOTS: 'available-slots',
  QUICK_SLOTS: 'quick-slots',
  
  // Booking related queries
  MY_BOOKINGS: 'my-bookings',
  
  // Service related queries
  WORKSHOP_SERVICES: 'workshop-services',
  
  // User related queries
  USER_PROFILE: 'user-profile',
  AUTH_STATUS: 'auth-status',
} as const;

/**
 * Helper functions do generowania query keys z parametrami
 */
export const QueryKeyFactory = {
  /**
   * Generuje query key dla konkretnego warsztatu
   */
  workshop: (workshopId: string) => [QueryKeys.WORKSHOP_DETAILS, workshopId],
  
  /**
   * Generuje query key dla dostępnych slotów
   */
  availableSlots: (workshopId: string, serviceId?: string) => 
    serviceId 
      ? [QueryKeys.AVAILABLE_SLOTS, workshopId, serviceId]
      : [QueryKeys.AVAILABLE_SLOTS, workshopId],
  
  /**
   * Generuje query key dla szybkich slotów
   */
  quickSlots: (workshopId: string, serviceId?: string) =>
    serviceId
      ? [QueryKeys.QUICK_SLOTS, workshopId, serviceId]
      : [QueryKeys.QUICK_SLOTS, workshopId],
  
  /**
   * Generuje query key dla usług warsztatu
   */
  workshopServices: (workshopId: string) => [QueryKeys.WORKSHOP_SERVICES, workshopId],
} as const; 