"use client";
import React, { useState } from 'react'
import { SmartLoadingState } from '../app/components/SmartLoadingState'
import { useEmergencyService } from '../../hooks/useEmergencyService'

export default function EmergencyBooking() {
  const { requestAssist } = useEmergencyService()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await requestAssist.mutateAsync({ description, location })
    setDescription('')
    setLocation('')
  }

  return (
    <SmartLoadingState
      isLoading={requestAssist.isLoading}
      error={requestAssist.error as Error | null}
      isRateLimited={false}
      rateLimitInfo={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
        <input
          className="w-full border rounded p-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Opis problemu"
          required
        />
        <input
          className="w-full border rounded p-2"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Lokalizacja"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Wezwij pomoc
        </button>
      </form>
    </SmartLoadingState>
  )
}
