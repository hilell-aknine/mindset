import { useState, useEffect, useRef } from 'react'
import { Timer, Zap } from 'lucide-react'

const TIMER_DURATION = 30 // seconds per exercise

export default function ExerciseTimer({ active, onTimeUp, exerciseKey }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef(null)

  // Reset timer when exercise changes
  useEffect(() => {
    setTimeLeft(TIMER_DURATION)
    setStarted(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [exerciseKey])

  // Start timer when active
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    // Small delay before starting
    const startDelay = setTimeout(() => {
      setStarted(true)
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            onTimeUp?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 500)

    return () => {
      clearTimeout(startDelay)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, exerciseKey])

  if (!active) return null

  const progress = (timeLeft / TIMER_DURATION) * 100
  const isLow = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className="flex items-center gap-2">
      <Timer className={`w-3.5 h-3.5 ${
        isCritical ? 'text-danger animate-pulse' :
        isLow ? 'text-warning' :
        'text-frost-white/30'
      }`} />
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical ? 'bg-danger' :
            isLow ? 'bg-warning' :
            'bg-dusty-aqua/50'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono font-bold min-w-[24px] text-center ${
        isCritical ? 'text-danger' :
        isLow ? 'text-warning' :
        'text-frost-white/30'
      }`}>
        {timeLeft}
      </span>
    </div>
  )
}

// Calculate speed bonus XP based on time remaining
export function getSpeedBonus(timeLeft) {
  if (timeLeft <= 0) return 0
  if (timeLeft >= 20) return 5 // Very fast
  if (timeLeft >= 15) return 3 // Fast
  if (timeLeft >= 10) return 1 // Normal
  return 0 // Slow
}

export { TIMER_DURATION }
