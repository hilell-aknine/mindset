import { useState, useEffect, useCallback } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { Flame, Zap, Trophy, BookOpen, X, ChevronLeft } from 'lucide-react'

const TIPS = [
  {
    id: 'streak',
    icon: Flame,
    color: 'text-warning',
    bg: 'bg-warning/15',
    title: 'שמור על הרצף!',
    text: 'תלמד כל יום כדי לשמור על הרצף שלך. ככל שהרצף ארוך יותר, כך תרוויח יותר בונוסים!',
    target: '[data-spotlight="streak"]',
  },
  {
    id: 'daily',
    icon: Zap,
    color: 'text-gold',
    bg: 'bg-gold/15',
    title: 'אתגר יומי',
    text: 'כל יום מחכה לך תרגיל חדש עם XP בונוס. סיים אותו לפני שהיום נגמר!',
    target: '[data-spotlight="daily"]',
  },
  {
    id: 'books',
    icon: BookOpen,
    color: 'text-dusty-aqua',
    bg: 'bg-dusty-aqua/15',
    title: 'הספרייה שלך',
    text: 'בחר ספר והתחל לשחק. כל שיעור לוקח 2-3 דקות עם 7 סוגי תרגילים שונים.',
    target: '[data-spotlight="books"]',
  },
  {
    id: 'xp',
    icon: Trophy,
    color: 'text-success',
    bg: 'bg-success/15',
    title: 'צבור XP ועלה רמות',
    text: 'כל תשובה נכונה שווה XP. ענה מהר, בנה רצפים ותגיע ללוח המובילים!',
    target: '[data-spotlight="xp"]',
  },
]

export default function FeatureSpotlight() {
  const { player, updatePlayer } = usePlayer()
  const [currentTip, setCurrentTip] = useState(0)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  // Show only once — first time on HomePage after onboarding
  const shouldShow = player.onboardingComplete && !player.spotlightSeen

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      updatePlayer(prev => ({ ...prev, spotlightSeen: true }))
      setVisible(false)
    }, 300)
  }, [updatePlayer])

  const next = useCallback(() => {
    if (currentTip < TIPS.length - 1) {
      setCurrentTip(t => t + 1)
    } else {
      dismiss()
    }
  }, [currentTip, dismiss])

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return
    const handler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      }
      if (e.key === 'Escape') dismiss()
      if (e.key === 'ArrowRight') {
        if (currentTip > 0) setCurrentTip(t => t - 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, currentTip, next, dismiss])

  if (!shouldShow || !visible) return null

  const tip = TIPS[currentTip]
  const Icon = tip.icon

  return (
    <>
      {/* Tooltip card — no backdrop overlay to avoid blocking scroll */}
      <div
        className={`fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto transition-all duration-300 ${
          exiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="glass-card p-5 border-gold/20 shadow-xl shadow-black/30 relative overflow-hidden" role="dialog" aria-label="טיפים לשימוש ראשון">
          {/* Shimmer */}
          <div className="absolute inset-0 progress-shimmer pointer-events-none opacity-20" />

          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-3 left-3 p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-frost-white/30" />
          </button>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {TIPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentTip ? 'w-6 bg-gold' : i < currentTip ? 'w-3 bg-gold/40' : 'w-3 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${tip.bg} flex items-center justify-center shrink-0 animate-bounce-in`}>
              <Icon className={`w-5 h-5 ${tip.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-frost-white mb-1">{tip.title}</h3>
              <p className="text-xs text-frost-white/50 leading-relaxed">{tip.text}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={dismiss}
              className="text-xs text-frost-white/30 hover:text-frost-white/50 transition-colors"
            >
              דלג
            </button>
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {currentTip < TIPS.length - 1 ? 'הבא' : 'יאללה, בוא נתחיל!'}
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
