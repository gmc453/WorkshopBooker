"use client";
import React from 'react'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { useMicroserviceHealth } from '../../hooks/useMicroserviceHealth'

interface Props {
  service: string
}

export default function ServiceHealthStatus({ service }: Props) {
  const { data, isLoading } = useMicroserviceHealth(service)

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
  }

  return (
    <div className="inline-flex items-center space-x-1">
      {data ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-red-600" />
      )}
      <span className="text-sm">{service}</span>
    </div>
  )
}
