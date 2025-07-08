/**
 * Stałe dla query keys używanych w React Query
 * Zastępuje magic strings w całej aplikacji
 */
export const QueryKeys = {
  // Workshop related queries
  WORKSHOPS: 'workshops',
  MY_WORKSHOPS: 'my-workshops',
  WORKSHOP_DETAILS: 'workshop-details',
  
  // Slot related queries
  SLOTS: 'slots',
  AVAILABLE_SLOTS: 'available-slots',
  QUICK_SLOTS: 'quick-slots',
  WORKSHOP_SLOTS: 'workshop-slots',
  
  // Booking related queries
  BOOKINGS: 'bookings',
  MY_BOOKINGS: 'my-bookings',
  WORKSHOP_BOOKINGS: 'workshop-bookings',
  
  // Service related queries
  SERVICES: 'services',
  WORKSHOP_SERVICES: 'workshop-services',
  
  // Analytics related queries
  ANALYTICS: 'analytics',
  WORKSHOP_ANALYTICS: 'workshop-analytics',
  REVENUE_TREND: 'revenue-trend',
  TIME_SLOTS_POPULARITY: 'time-slots-popularity',
  
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
   * Generuje query key dla slotów warsztatu
   */
  workshopSlots: (workshopId: string) => [QueryKeys.WORKSHOP_SLOTS, workshopId],
  
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
  
  /**
   * Generuje query key dla rezerwacji warsztatu
   */
  workshopBookings: (workshopId: string) => [QueryKeys.WORKSHOP_BOOKINGS, workshopId],
  
  /**
   * Generuje query key dla analityki warsztatu
   */
  workshopAnalytics: (workshopId: string, startDate?: string, endDate?: string) => 
    [QueryKeys.WORKSHOP_ANALYTICS, workshopId, startDate, endDate],
} as const; 