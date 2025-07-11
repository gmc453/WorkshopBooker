import { useState, useCallback } from 'react'

// Typ powiadomienia
export type Notification = {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  bookingId?: string;
}

export const useBookingListState = () => {
  // Stan dla powiadomień
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Stan dla śledzenia aktualnie procesowanych rezerwacji
  const [processingBookings, setProcessingBookings] = useState<{[key: string]: boolean}>({});
  
  // Stan dla paginacji
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // Funkcja do dodawania powiadomień
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    // Automatyczne usuwanie powiadomień po 5 sekundach
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);
  
  // Usuwanie powiadomienia
  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Ustawianie stanu procesowania rezerwacji
  const setProcessingBooking = useCallback((bookingId: string, isProcessing: boolean) => {
    setProcessingBookings(prev => ({
      ...prev,
      [bookingId]: isProcessing
    }));
  }, []);
  
  return {
    notifications,
    processingBookings,
    currentPage,
    itemsPerPage,
    addNotification,
    removeNotification,
    setProcessingBooking,
    setCurrentPage,
    setItemsPerPage
  };
}; 