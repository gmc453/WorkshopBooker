import { Link } from 'react-router-dom'
import { TrendingUp, Users, DollarSign, Star, ArrowRight } from 'lucide-react'
import { useWorkshopQuickStats } from '../hooks/useWorkshopQuickStats'
import { safeFormatPrice } from '../utils/safeAccess'

interface WorkshopAnalyticsCardProps {
  workshop: {
    id: string
    name: string
  }
}

export const WorkshopAnalyticsCard = ({ workshop }: WorkshopAnalyticsCardProps) => {
  const { data: stats, isLoading } = useWorkshopQuickStats(workshop.id)
  
  return (
    <Link to={`/analytics/${workshop.id}`} className="group">
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all">
        {/* Header z nazwą + badge */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{workshop.name}</h4>
          <div className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
            Warsztat
          </div>
        </div>
        
        {/* Loading skeleton lub stats grid 2x2 */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-lg font-bold text-gray-900">
                  {safeFormatPrice(stats.monthlyRevenue)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Przychody</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-lg font-bold text-gray-900">
                  {stats.monthlyBookings}
                </span>
              </div>
              <p className="text-xs text-gray-500">Rezerwacje</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-lg font-bold text-gray-900">
                  {stats.averageRating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Ocena</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-lg font-bold text-gray-900">
                  {stats.revenueGrowth?.toFixed(1) || '0'}%
                </span>
              </div>
              <p className="text-xs text-gray-500">Wzrost</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Brak danych</p>
          </div>
        )}
        
        {/* Hover effect z arrow icon */}
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-100 group-hover:border-purple-200 transition-colors">
          <span className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
            Zobacz szczegóły
          </span>
          <ArrowRight className="h-3 w-3 ml-1 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}

export default WorkshopAnalyticsCard 