import { useState, useMemo } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { Bell, X, Brain, Flame, RotateCcw } from 'lucide-react'
import { NOTIFICATION_COOLDOWN_HOURS } from '../config/constants'

/**
 * Smart Notification Banner — personalized based on:
 * 1. Preferred learning time (tracked in learningHours)
 * 2. Due spaced reviews
 * 3. Streak status
 * Shows max 1 notification per day on HomePage
 */
export default function SmartNotification() {
  const { player, updatePlayer, getDueSRItems } = usePlayer()
  const [dismissed, setDismissed] = useState(false)

  const notification = useMemo(() => {
    // Check cooldown
    const lastNotif = player.lastNotificationDate
    if (lastNotif) {
      const elapsed = (Date.now() - new Date(lastNotif).getTime()) / (1000 * 60 * 60)
      if (elapsed < NOTIFICATION_COOLDOWN_HOURS) return null
    }

    const now = new Date()
    const hour = now.getHours()

    // Priority 1: Spaced repetition items due
    const dueItems = getDueSRItems()
    if (dueItems.length > 0) {
      return {
        icon: Brain,
        color: 'text-dusty-aqua',
        bg: 'bg-dusty-aqua/10',
        border: 'border-dusty-aqua/20',
        title: `${dueItems.length} חזרות מרווחות מחכות`,
        subtitle: 'הזיכרון שלך מתחזק בכל חזרה — רק כמה דקות',
        type: 'sr',
      }
    }

    // Priority 2: Streak at risk (evening and haven't learned today)
    const today = now.toDateString()
    const todayKey = now.toISOString().split('T')[0]
    const learnedToday = player.learningDays?.[todayKey]
    if (!learnedToday && hour >= 19 && player.currentStreak >= 3) {
      return {
        icon: Flame,
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        title: `הרצף של ${player.currentStreak} ימים בסכנה!`,
        subtitle: 'שיעור קצר ישמור על ההישג שלך',
        type: 'streak',
      }
    }

    // Priority 3: Preferred time reminder
    const learningHours = player.learningHours || {}
    const entries = Object.entries(learningHours)
    if (entries.length >= 3) {
      // Find most common learning hour
      const sorted = entries.sort((a, b) => b[1] - a[1])
      const preferredHour = parseInt(sorted[0][0])
      // Show notification if we're in the preferred window (±1 hour)
      if (Math.abs(hour - preferredHour) <= 1 && !learnedToday) {
        const timeLabel = preferredHour < 12 ? 'בוקר' : preferredHour < 18 ? 'צהריים' : 'ערב'
        return {
          icon: Bell,
          color: 'text-gold',
          bg: 'bg-gold/10',
          border: 'border-gold/20',
          title: `זה הזמן שלך ללמוד!`,
          subtitle: `בדרך כלל אתה לומד ב${timeLabel} — בוא נתחיל`,
          type: 'time',
        }
      }
    }

    // Priority 4: Review queue items
    const reviewCount = (player.reviewQueue || []).length
    if (reviewCount >= 3) {
      return {
        icon: RotateCcw,
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        title: `${reviewCount} תרגילים לחזרה`,
        subtitle: 'חזור על מה שטעית כדי לחזק את הידע',
        type: 'review',
      }
    }

    return null
  }, [player, getDueSRItems])

  if (!notification || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    updatePlayer(prev => ({
      ...prev,
      lastNotificationDate: new Date().toISOString(),
    }))
  }

  const Icon = notification.icon

  return (
    <div className={`glass-card p-3 mb-4 flex items-center gap-3 animate-fade-in ${notification.border} ${notification.bg}`}>
      <div className={`w-10 h-10 rounded-xl ${notification.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${notification.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${notification.color}`}>{notification.title}</p>
        <p className="text-[10px] text-frost-white/40">{notification.subtitle}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1.5 rounded-lg hover:bg-white/5 text-frost-white/20 hover:text-frost-white/50 transition-colors shrink-0"
        aria-label="סגור התראה"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
