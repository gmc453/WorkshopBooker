import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import type { FeedbackMessage } from '../types'

interface FeedbackToastProps {
  feedback: FeedbackMessage | null
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function FeedbackToast({ 
  feedback, 
  onClose, 
  autoClose = true,
  autoCloseDelay = 5000 
}: FeedbackToastProps) {
  
  // Auto close functionality
  useEffect(() => {
    if (feedback && autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [feedback, autoClose, autoCloseDelay, onClose])

  if (!feedback) return null

  const isSuccess = feedback.type === 'success'
  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100'
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800'
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600'
  const Icon = isSuccess ? CheckCircle : AlertCircle

  return (
    <div className={`p-4 mb-6 rounded-lg ${bgColor} ${textColor} flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span>{feedback.message}</span>
      </div>
      
      <button 
        onClick={onClose}
        className="ml-4 hover:opacity-70 transition-opacity"
        aria-label="Zamknij powiadomienie"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Alternatywnie - jeszcze prostszy wariant bez ikon
export function SimpleFeedbackToast({ feedback, onClose }: FeedbackToastProps) {
  if (!feedback) return null

  return (
    <div className={`p-4 mb-6 rounded-lg ${
      feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {feedback.message}
      <button 
        className="ml-2 text-sm hover:font-bold" 
        onClick={onClose}
      >
        ×
      </button>
    </div>
  )
} 