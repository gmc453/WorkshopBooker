"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { CalendarView } from './booking/CalendarView';
import { FormView } from './booking/FormView';
import { ConfirmationView } from './booking/ConfirmationView';

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopId: string;
  serviceId: string;
  serviceName: string;
  onGoHome?: () => void;
}

export const EnhancedBookingModal: React.FC<EnhancedBookingModalProps> = ({
  isOpen,
  onClose,
  workshopId,
  serviceId,
  serviceName,
  onGoHome
}) => {
  const {
    state,
    availableSlots,
    nextAvailableSlot,
    quickSlots,
    isLoadingSlots,
    slotsError,
    isFormValid,
    selectSlot,
    quickBook,
    updateFormData,
    submitBooking,
    resetFlow,
    goBack
  } = useBookingFlow(workshopId, serviceId);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('EnhancedBookingModal Debug:', {
        workshopId,
        serviceId,
        serviceName,
        state,
        availableSlots,
        nextAvailableSlot,
        quickSlots,
        isLoadingSlots,
        slotsError
      });
    }
  }, [isOpen, workshopId, serviceId, serviceName, state, availableSlots, nextAvailableSlot, quickSlots, isLoadingSlots, slotsError]);

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    }
    onClose();
  };

  const handleReset = () => {
    resetFlow();
  };

  const getStepTitle = () => {
    switch (state.step) {
      case 'calendar':
        return 'Wybierz termin';
      case 'form':
        return 'Dane rezerwacji';
      case 'confirmation':
        return 'Potwierdzenie';
      default:
        return 'Rezerwacja';
    }
  };

  const getStepNumber = () => {
    switch (state.step) {
      case 'calendar':
        return 1;
      case 'form':
        return 2;
      case 'confirmation':
        return 3;
      default:
        return 1;
    }
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Background overlay */}
    <div 
      className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      onClick={onClose}
    />
    
    {/* Modal panel */}
    <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepNumber() >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-8 h-1 ${
                  getStepNumber() >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepNumber() >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className={`w-8 h-1 ${
                  getStepNumber() >= 3 ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepNumber() >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getStepTitle()}
              </h3>
              <p className="text-sm text-gray-600">
                {serviceName}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Debug info - temporary */}
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <strong>Debug Info:</strong>
              <div>Step: {state.step}</div>
              <div>Loading: {isLoadingSlots ? 'Yes' : 'No'}</div>
              <div>Error: {slotsError ? 'Yes' : 'No'}</div>
              <div>Available Slots: {availableSlots?.length || 0}</div>
              <div>Next Available: {nextAvailableSlot ? 'Yes' : 'No'}</div>
              <div>Quick Slots: {quickSlots?.length || 0}</div>
            </div>

            {slotsError ? (
              <div className="text-center py-12">
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Błąd ładowania terminów</h3>
                <p className="text-gray-600 mb-4">
                  Nie udało się załadować dostępnych terminów. Spróbuj ponownie.
                </p>
                <div className="text-sm text-red-600 mb-4">
                  Error: {slotsError?.message || 'Unknown error'}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Odśwież stronę
                </button>
              </div>
            ) : (
              <>
                {state.step === 'calendar' && (
                  <>
                    {isLoadingSlots ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Ładowanie dostępnych terminów...</p>
                      </div>
                    ) : (
                      <CalendarView
                        availableSlots={availableSlots || []}
                        nextAvailableSlot={nextAvailableSlot || null}
                        quickSlots={quickSlots || []}
                        isLoadingSlots={isLoadingSlots}
                        onSelectSlot={selectSlot}
                        onQuickBook={quickBook}
                      />
                    )}
                  </>
                )}

                {state.step === 'form' && state.selectedSlot && (
                  <FormView
                    selectedSlot={state.selectedSlot}
                    formData={state.formData}
                    isFormValid={isFormValid}
                    isProcessing={state.isProcessing}
                    error={state.error}
                    onUpdateFormData={updateFormData}
                    onSubmit={submitBooking}
                    onGoBack={goBack}
                  />
                )}

                {state.step === 'confirmation' && state.selectedSlot && (
                  <ConfirmationView
                    selectedSlot={state.selectedSlot}
                    formData={state.formData}
                    onReset={handleReset}
                    onGoHome={handleGoHome}
                  />
                )}
              </>
            )}

            {/* Fallback content if nothing is rendered */}
            {!slotsError && !isLoadingSlots && state.step === 'calendar' && (!availableSlots || availableSlots.length === 0) && (
              <div className="text-center py-12">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Brak dostępnych terminów</h3>
                <p className="text-gray-600 mb-4">
                  Obecnie nie ma dostępnych terminów dla tej usługi. Sprawdź ponownie później.
                </p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Zamknij
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}; 