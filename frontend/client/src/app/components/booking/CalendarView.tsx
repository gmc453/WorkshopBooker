"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Zap, Star, Tag } from 'lucide-react';
import { Slot } from '../../../hooks/useBookingFlow';
import { SkeletonCalendar } from '../SkeletonCalendar';

interface CalendarViewProps {
  availableSlots: Slot[];
  nextAvailableSlot: Slot | null;
  quickSlots: Slot[];
  isLoadingSlots: boolean;
  onSelectSlot: (slot: Slot) => void;
  onQuickBook: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  availableSlots,
  nextAvailableSlot,
  quickSlots,
  isLoadingSlots,
  onSelectSlot,
  onQuickBook
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Jutro';
    } else {
      return date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const groupSlotsByDate = (slots: Slot[]) => {
    return slots.reduce((groups, slot) => {
      const date = new Date(slot.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, Slot[]>);
  };

  const handleSlotSelect = (slot: Slot) => {
    if (!slot.isAvailable) return;
    setSelectedSlotId(slot.id);
    onSelectSlot(slot);
  };

  const available = availableSlots.filter(s => s.isAvailable);
  const groupedSlots = groupSlotsByDate(available);

  // Find earliest available slot for badge
  const earliestSlot = available.length > 0 ? available[0] : null;

  if (isLoadingSlots) {
    return <SkeletonCalendar />;
  }

  return (
    <div className="space-y-6">
      {/* Quick Booking Section */}
      {nextAvailableSlot && nextAvailableSlot.isAvailable && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Szybka rezerwacja</h3>
                <p className="text-sm text-gray-600">
                  Najbliższy dostępny termin: {formatDate(nextAvailableSlot.startTime)} o {formatTime(nextAvailableSlot.startTime)}
                </p>
              </div>
            </div>
            <button
              onClick={onQuickBook}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Zap className="h-4 w-4" />
              <span>Zarezerwuj teraz</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Slots */}
      {quickSlots && quickSlots.filter(s => s.isAvailable).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Najbliższe terminy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickSlots.filter(s => s.isAvailable).map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleSlotSelect(slot)}
                className={`bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all text-left transform hover:scale-105 ${
                  selectedSlotId === slot.id 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {formatDate(slot.startTime)}
                  </div>
                  {slot.id === earliestSlot?.id && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Star className="w-3 h-3 mr-1" />
                      Najwcześniejszy
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Tag className="w-4 h-4 mr-1" />
                  <span>Od 150 zł</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Kalendarz terminów
        </h3>
        
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak dostępnych terminów</h3>
            <p className="text-gray-600">Sprawdź ponownie później lub skontaktuj się z warsztatem.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">
                    {formatDate(slots[0].startTime)}
                  </h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const isEarliest = slot.id === earliestSlot?.id;
                      
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotSelect(slot)}
                          className={`
                            relative rounded-lg p-3 transition-all text-center transform hover:scale-105
                            ${isSelected 
                              ? 'bg-blue-500 border-2 border-blue-600 text-white shadow-lg' 
                              : slot.isAvailable
                                ? 'bg-green-100 hover:bg-green-200 border-2 border-green-300 hover:border-green-400 text-green-800'
                                : 'bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                            }
                          `}
                          disabled={!slot.isAvailable}
                          title={!slot.isAvailable ? 'Termin niedostępny' : 'Kliknij aby wybrać'}
                        >
                          {isEarliest && slot.isAvailable && (
                            <div className="absolute -top-2 -right-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                                <Star className="w-3 h-3" />
                              </span>
                            </div>
                          )}
                          
                          <div className={`font-medium ${isSelected ? 'text-white' : ''}`}>
                            {formatTime(slot.startTime)}
                          </div>
                          <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                            {formatTime(slot.endTime)}
                          </div>
                          
                          {slot.isAvailable && (
                            <div className={`text-xs mt-2 font-medium ${isSelected ? 'text-blue-100' : 'text-green-700'}`}>
                              Od 150 zł
                            </div>
                          )}
                          
                          {!slot.isAvailable && (
                            <div className="text-xs text-red-500 mt-2">Niedostępny</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 