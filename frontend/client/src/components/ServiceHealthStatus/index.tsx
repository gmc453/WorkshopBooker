'use client'
import React from 'react'
import useSWR from 'swr'
import axios from 'axios'

const fetcher = (url: string) => axios.get(url).then(r => r.data)

export const ServiceHealthStatus: React.FC<{ service: string }> = ({ service }) => {
  const { data, error, isLoading } = useSWR(`/api/${service}/health`, fetcher, { refreshInterval: 30000 })

  if (isLoading) return <div className="animate-pulse h-4 bg-gray-200 rounded w-20" />
  if (error) return <span className="text-red-500">offline</span>

  return <span className="text-green-600">{data?.status ?? 'online'}</span>
}

export default ServiceHealthStatus
