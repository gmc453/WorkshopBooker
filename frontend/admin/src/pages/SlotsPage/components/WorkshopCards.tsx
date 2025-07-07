import { useMemo } from 'react'
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react'
import type { Workshop } from '../../../types/workshop'
import type { WorkshopStats } from '../types'

interface WorkshopCardsProps {
  workshops?: Workshop[]
  selectedWorkshopId: string | null
  onSelectWorkshop: (id: string) => void
}

export default function WorkshopCards({ 
  workshops, 
  selectedWorkshopId, 
  onSelectWorkshop 
}: WorkshopCardsProps) {
  
  // Mock data - w rzeczywistej aplikacji dane pochodziłyby z API
  const workshopStats = useMemo(() => {
    if (!workshops) return {}
    
    return workshops.reduce((acc, workshop) => {
      acc[workshop.id] = {
        totalSlots: Math.floor(Math.random() * 20),
        thisWeekSlots: Math.floor(Math.random() * 8),
        upcomingBookings: Math.floor(Math.random() * 5)
      }
      return acc
    }, {} as Record<string, WorkshopStats>)
  }, [workshops])

  if (!workshops?.length) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Twoje warsztaty</h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">Nie masz jeszcze żadnych warsztatów.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Twoje warsztaty</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workshops.map(workshop => {
          const stats = workshopStats[workshop.id] || {}
          const isSelected = selectedWorkshopId === workshop.id
          
          return (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              stats={stats}
              isSelected={isSelected}
              onClick={() => onSelectWorkshop(workshop.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface WorkshopCardProps {
  workshop: Workshop
  stats: WorkshopStats
  isSelected: boolean
  onClick: () => void
}

function WorkshopCard({ workshop, stats, isSelected, onClick }: WorkshopCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-800 line-clamp-2">{workshop.name}</h4>
        {isSelected && <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0" />}
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-sm">
        <StatItem 
          icon={<Calendar className="h-4 w-4 text-gray-500" />}
          value={stats.totalSlots || 0}
          label="Terminów"
        />
        <StatItem 
          icon={<Clock className="h-4 w-4 text-green-500" />}
          value={stats.thisWeekSlots || 0}
          label="Ten tydzień"
        />
        <StatItem 
          icon={<Users className="h-4 w-4 text-blue-500" />}
          value={stats.upcomingBookings || 0}
          label="Rezerwacji"
        />
      </div>
    </div>
  )
}

interface StatItemProps {
  icon: React.ReactNode
  value: number
  label: string
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-1">
        {icon}
      </div>
      <div className="font-medium text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
} 