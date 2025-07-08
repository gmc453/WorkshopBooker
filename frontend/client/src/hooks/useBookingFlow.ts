import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';

export interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  status: number;
  serviceId: string;
  workshopId: string;
  isAvailable: boolean;
}

export interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export interface BookingFlowState {
  step: 'calendar' | 'form' | 'confirmation';
  selectedSlot: Slot | null;
  formData: BookingFormData;
  isProcessing: boolean;
  error: string | null;
  showRetry: boolean;
  retryCount: number;
}

// Helper function to convert technical errors to user-friendly messages
const getUserFriendlyError = (error: any): string => {
  if (error.response?.status === 409) {
    return 'Ten termin został już zarezerwowany. Wybierz inny termin.';
  }
  if (error.response?.status === 400) {
    return 'Nieprawidłowe dane rezerwacji. Sprawdź wprowadzone informacje.';
  }
  if (error.response?.status === 404) {
    return 'Usługa lub termin nie został znaleziony.';
  }
  if (error.response?.status >= 500) {
    return 'Problem z serwerem. Spróbuj ponownie za chwilę.';
  }
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return 'Problem z połączeniem internetowym. Sprawdź swoje połączenie.';
  }
  if (error.message?.includes('timeout')) {
    return 'Żądanie przekroczyło limit czasu. Spróbuj ponownie.';
  }
  return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub skontaktuj się z warsztatem.';
};

export const useBookingFlow = (workshopId: string, serviceId: string) => {
  const queryClient = useQueryClient();
  
  // State management
  const [state, setState] = useState<BookingFlowState>({
    step: 'calendar',
    selectedSlot: null,
    formData: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: ''
    },
    isProcessing: false,
    error: null,
    showRetry: false,
    retryCount: 0
  });

  // API queries
  const { data: availableSlots, isLoading: isLoadingSlots, error: slotsError } = useQuery({
    queryKey: ['available-slots', workshopId, serviceId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/services/${serviceId}/slots`);
      return response.data as Slot[];
    },
    enabled: !!workshopId && !!serviceId
  });

  const { data: nextAvailableSlot } = useQuery({
    queryKey: ['next-available', workshopId, serviceId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/services/${serviceId}/next-available`);
      return response.data as Slot;
    },
    enabled: !!workshopId && !!serviceId,
    select: (slot: Slot) => slot && slot.isAvailable ? slot : null
  });

  const { data: quickSlots } = useQuery({
    queryKey: ['quick-slots', workshopId, serviceId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/workshops/${workshopId}/services/${serviceId}/quick-slots?count=5`);
      return response.data as Slot[];
    },
    enabled: !!workshopId && !!serviceId,
    select: (slots: Slot[]) => slots.filter(s => s.isAvailable)
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: { slotId: string; formData: BookingFormData }) => {
      const response = await apiClient.post(`/api/services/${serviceId}/bookings`, {
        slotId: bookingData.slotId,
        customerName: bookingData.formData.customerName,
        customerEmail: bookingData.formData.customerEmail,
        customerPhone: bookingData.formData.customerPhone,
        notes: bookingData.formData.notes
      });
      return response.data;
    },
    retry: 3,
    retryDelay: 1000,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['available-slots', workshopId, serviceId] });
      queryClient.invalidateQueries({ queryKey: ['next-available', workshopId, serviceId] });
      queryClient.invalidateQueries({ queryKey: ['quick-slots', workshopId, serviceId] });
      
      // Move to confirmation step
      setState(prev => ({ 
        ...prev, 
        step: 'confirmation', 
        isProcessing: false,
        showRetry: false,
        retryCount: 0
      }));
    },
    onError: (error: any) => {
      const userFriendlyError = getUserFriendlyError(error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: userFriendlyError,
        showRetry: true,
        retryCount: prev.retryCount + 1
      }));
    }
  });

  // Actions
  const selectSlot = useCallback((slot: Slot) => {
    if (!slot.isAvailable) return;
    setState(prev => ({ ...prev, selectedSlot: slot, step: 'form', error: null }));
  }, []);

  const quickBook = useCallback(async () => {
    if (!nextAvailableSlot || !nextAvailableSlot.isAvailable) return;
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      await bookingMutation.mutateAsync({
        slotId: nextAvailableSlot.id,
        formData: state.formData
      });
    } catch (error) {
      // Error handling is done in mutation
    }
  }, [nextAvailableSlot, state.formData, bookingMutation]);

  const updateFormData = useCallback((field: keyof BookingFormData, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      error: null
    }));
  }, []);

  const submitBooking = useCallback(async () => {
    if (!state.selectedSlot) return;
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      await bookingMutation.mutateAsync({
        slotId: state.selectedSlot.id,
        formData: state.formData
      });
    } catch (error) {
      // Error handling is done in mutation
    }
  }, [state.selectedSlot, state.formData, bookingMutation]);

  const resetFlow = useCallback(() => {
    setState({
      step: 'calendar',
      selectedSlot: null,
      formData: {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        notes: ''
      },
      isProcessing: false,
      error: null,
      showRetry: false,
      retryCount: 0
    });
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.step === 'form') {
        return { ...prev, step: 'calendar', selectedSlot: null, error: null, showRetry: false };
      }
      return prev;
    });
  }, []);

  const retryBooking = useCallback(async () => {
    if (!state.selectedSlot) return;
    
    setState(prev => ({ ...prev, isProcessing: true, error: null, showRetry: false }));
    
    try {
      await bookingMutation.mutateAsync({
        slotId: state.selectedSlot.id,
        formData: state.formData
      });
    } catch (error) {
      // Error handling is done in mutation
    }
  }, [state.selectedSlot, state.formData, bookingMutation]);

  // Computed values
  const groupedSlots = useMemo(() => {
    if (!availableSlots) return {};
    
    return availableSlots.reduce((groups, slot) => {
      const date = new Date(slot.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, Slot[]>);
  }, [availableSlots]);

  const isFormValid = useMemo(() => {
    return state.formData.customerName.trim() !== '' && 
           state.formData.customerEmail.trim() !== '' &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.formData.customerEmail);
  }, [state.formData]);

  return {
    // State
    state,
    
    // Data
    availableSlots,
    nextAvailableSlot,
    quickSlots,
    groupedSlots,
    isLoadingSlots,
    slotsError,
    
    // Computed
    isFormValid,
    
    // Actions
    selectSlot,
    quickBook,
    updateFormData,
    submitBooking,
    resetFlow,
    goBack,
    retryBooking
  };
}; 