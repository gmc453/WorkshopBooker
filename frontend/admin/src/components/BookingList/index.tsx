import { useMemo, useState, useEffect } from 'react'
import type { FC } from 'react'
import { useWorkshopBookings } from '../../hooks/useWorkshopBookings'
import { useMyWorkshopBookings } from '../../hooks/useMyWorkshopBookings'
import { useMyWorkshops } from '../../hooks/useMyWorkshops'
import { BookingListHeader } from './BookingListHeader'
import { BookingListFilters } from './BookingListFilters'
import { BookingListTable } from './BookingListTable'
import { BookingListPagination } from './BookingListPagination'
import { BookingListSkeleton } from './BookingListSkeleton'
import { BookingListError } from './BookingListError'
import { BookingListNotifications } from './BookingListNotifications'
import { useBookingListState } from './useBookingListState'

import type { Booking } from '../../types/booking'

type BookingListProps = {
  workshopId: string | null
  statusFilter?: string
  searchQuery?: string
  onConfirm?: (bookingId: string) => void
  onComplete?: (bookingId: string) => void
  onCancel?: (bookingId: string) => void
}

export const BookingList: FC<BookingListProps> = (props) => {
  const { workshopId, statusFilter = 'all', searchQuery = '' } = props
  
  // Custom hook dla stanu listy rezerwacji
  const { 
    notifications, 
    processingBookings, 
    currentPage, 
    itemsPerPage,
    addNotification, 
    removeNotification,
    setProcessingBooking,
    setCurrentPage,
    setItemsPerPage
  } = useBookingListState()

  // Pobieramy dane o wszystkich warsztatach
  const { data: workshops } = useMyWorkshops()
  
  // Pobieramy rezerwacje w zależności od tego czy wybrano konkretny warsztat
  const { 
    data: workshopBookings, 
    isLoading: isLoadingWorkshopBookings, 
    isError: isWorkshopBookingsError, 
    refetch: refetchWorkshopBookings 
  } = useWorkshopBookings(workshopId)
  
  const { 
    data: myWorkshopBookings, 
    isLoading: isLoadingMyWorkshopBookings, 
    isError: isMyWorkshopBookingsError, 
    refetch: refetchMyWorkshopBookings 
  } = useMyWorkshopBookings()
    
  // Stan ładowania i błędów
  const isLoading = workshopId ? isLoadingWorkshopBookings : isLoadingMyWorkshopBookings
  const isError = workshopId ? isWorkshopBookingsError : isMyWorkshopBookingsError
  
  // Określamy, które dane mamy używać
  const bookingsData = workshopId ? workshopBookings : myWorkshopBookings
  
  // Funkcja odświeżenia listy rezerwacji
  const refreshBookings = () => {
    if (workshopId) {
      refetchWorkshopBookings();
    } else {
      refetchMyWorkshopBookings();
    }
  };
  
  // Znajdź nazwę wybranego warsztatu
  const selectedWorkshopName = useMemo(() => {
    if (!workshopId || !workshops) return null
    const workshop = workshops.find(w => w.id === workshopId)
    return workshop?.name || null
  }, [workshopId, workshops])
  
  // Filtrowanie i sortowanie rezerwacji
  const filteredBookings = useMemo(() => {
    if (!bookingsData) return []
    
    const filtered = bookingsData.filter(booking => {
      // Filtrowanie po statusie
      if (statusFilter !== 'all') {
        if (booking.status.toString() !== statusFilter) {
          return false
        }
      }
      
      // Filtrowanie po frazie wyszukiwania
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesService = booking.serviceName?.toLowerCase().includes(query)
        const matchesUser = booking.userName?.toLowerCase().includes(query)
        
        if (!matchesService && !matchesUser) {
          return false
        }
      }
      
      return true
    })
    
    // Sortowanie według daty - od najstarszej do najnowszej
    return filtered.sort((a, b) => {
      const dateA = new Date(a.slotStartTime)
      const dateB = new Date(b.slotStartTime)
      return dateA.getTime() - dateB.getTime()
    })
  }, [bookingsData, statusFilter, searchQuery])

  // Reset strony przy zmianie filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [workshopId, statusFilter, searchQuery, setCurrentPage]);

  // Paginacja rezerwacji
  const paginatedBookings = useMemo(() => {
    if (!filteredBookings) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, currentPage, itemsPerPage]);
  
  // Obliczanie całkowitej liczby stron
  const totalPages = useMemo(() => {
    if (!filteredBookings) return 0;
    return Math.ceil(filteredBookings.length / itemsPerPage);
  }, [filteredBookings, itemsPerPage]);

  if (isLoading) return <BookingListSkeleton />
  if (isError) return <BookingListError onRetry={refreshBookings} />
  
  return (
    <div className="space-y-4">
      <BookingListNotifications 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
      
      <BookingListHeader 
        selectedWorkshopName={selectedWorkshopName}
        totalBookings={filteredBookings.length}
      />
      
      <BookingListFilters 
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onStatusChange={(status) => {/* TODO: Implement */}}
        onSearchChange={(query) => {/* TODO: Implement */}}
      />
      
      <BookingListTable 
        bookings={paginatedBookings}
        processingBookings={processingBookings}
        onConfirm={props.onConfirm}
        onComplete={props.onComplete}
        onCancel={props.onCancel}
        onProcessingChange={setProcessingBooking}
        onNotification={addNotification}
      />
      
      <BookingListPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}; 