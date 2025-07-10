'use client'
import React, { useState } from 'react'
import axios from 'axios'

export const EmergencyBooking: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const requestHelp = async () => {
    setLoading(true)
    setError('')
    try {
      await axios.post('/api/emergency/request')
      setSuccess(true)
    } catch (err) {
      setError('Service unavailable')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="animate-pulse h-10 bg-gray-200 rounded" />
  if (success) return <p className="text-green-600">Request sent!</p>

  return (
    <div className="space-y-2">
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={requestHelp} className="px-4 py-2 bg-blue-600 text-white rounded">
        Call Emergency Service
      </button>
    </div>
  )
}
export default EmergencyBooking
