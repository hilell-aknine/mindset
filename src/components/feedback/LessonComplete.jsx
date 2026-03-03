import { useEffect, useState } from 'react'
import ReactConfetti from 'react-confetti'
import { Star, Trophy, ArrowLeft, Sparkles, Zap, Timer, Share2 } from 'lucide-react'
import { XP_LESSON_COMPLETE, XP_PERFECT_LESSON } from '../../config/constants'
import { getActiveEvent, getXPMultiplier } from '../../lib/events'

export default function LessonComplete({ mistakes, totalExercises, onContinue, speedBonus = 0, nextLesson = null, onNextLesson = null }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [starsRevealed, setStarsRevealed] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const isPerfect = mistakes === 0
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
  const multiplier = getXPMultiplier()
  const activeEvent = getActiveEvent()
  const baseXP = XP_LESSON_COMPLETE + (isPerfect ? XP_PERFECT_LESSON : 0)
  const xpEarned = Math.round(baseXP * multiplier) + speedBonus
  const accuracy = Math.round(((totalExercises - mistakes) / totalExercises) * 100)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), isPerfect ? 6000 : 4000)
    return () => clearTimeout(timer)
  }, [isPerfect])

  // Stagger star reveals
  useEffect(() => {
    const timers = []
    for (let i = 1; i <= stars; i++) {
      timers.push(setTimeout(() => setStarsRevealed(i), 300 + i * 350))
    }
    timers.push(setTimeout(() => setShowBreakdown(true), 300 + stars * 350 + 300))
    return () => timers.forEach(clearTimeout)
  }, [stars])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {showConfetti && (
        <ReactConfetti
          recycle={isPerfect}
          numberOfPieces={isPerfect ? 300 : 150}
          colors={['#D4AF37', '#22c55e', '#2F8592', '#E8F1F2', '#f59e0b', '#003B46']}
        />
      )}

      <div className="text-center animate-fade-in">
        {/* Stars with stagger animation */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="relative">
              <Star
                className={`w-14 h-14 transition-all ${
                  i <= starsRevealed
                    ? 'text-gold fill-gold drop-shadow-[0_0_12px_rgba(212,175,55,0.6)] animate-star-pop'
                    : 'text-white/10'
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
              {i <= starsRevealed && i <= stars && (
                <div className="absolute inset-0 animate-ping opacity-20">
                  <Star className="w-14 h-14 text-gold fill-gold" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Perfect badge */}
        {isPerfect && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-bold mb-4 animate-bounce-in">
            <Sparkles className="w-3.5 h-3.5" />
            שיעור מושלם!
          </div>
        )}

        {/* Title */}
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-frost-white mb-2 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
          {isPerfect ? 'מושלם!' : 'כל הכבוד!'}
        </h2>
        <p className="text-frost-white/50 text-sm mb-6">
          {isPerfect
            ? 'סיימת את השיעור בלי שגיאות!'
            : `סיימת את השיעור עם ${mistakes} ${mistakes === 1 ? 'שגיאה' : 'שגיאות'} מתוך ${totalExercises} שאלות`
          }
        </p>

        {/* XP earned card with breakdown */}
        <div className="glass-card inline-block px-6 py-4 mb-6 animate-bounce-in border-gold/20" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3 justify-center mb-3">
            <Trophy className="w-6 h-6 text-gold" />
            <span className="text-gold font-bold text-2xl">+{xpEarned} XP</span>
          </div>

          {/* Detailed breakdown */}
          {showBreakdown && (
            <div className="space-y-1.5 border-t border-white/5 pt-3 animate-fade-in">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-frost-white/40">השלמת שיעור</span>
                <span className="text-frost-white/60 font-medium">+{XP_LESSON_COMPLETE}</span>
              </div>
              {isPerfect && (
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-frost-white/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold" />
                    בונוס מושלם
                  </span>
                  <span className="text-gold font-medium">+{XP_PERFECT_LESSON}</span>
                </div>
              )}
              {speedBonus > 0 && (
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-frost-white/40 flex items-center gap-1">
                    <Timer className="w-3 h-3 text-dusty-aqua" />
                    בונוס מהירות
                  </span>
                  <span className="text-dusty-aqua font-medium">+{speedBonus}</span>
                </div>
              )}
              {multiplier > 1 && activeEvent && (
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-frost-white/40 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-warning" />
                    {activeEvent.emoji} {activeEvent.name}
                  </span>
                  <span className="text-warning font-medium">x{multiplier}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 text-xs pt-1 border-t border-white/5">
                <span className="text-frost-white/40">דיוק</span>
                <span className="text-frost-white/60 font-medium">{accuracy}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Next lesson CTA */}
        {nextLesson && onNextLesson && (
          <button
            onClick={onNextLesson}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98] animate-bounce-in mb-3"
            style={{ animationDelay: '0.7s' }}
          >
            שיעור הבא: {nextLesson.title}
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Continue (back to book) button */}
        <button
          onClick={onContinue}
          className={`w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] animate-bounce-in ${
            nextLesson ? 'bg-white/5 text-frost-white/60 hover:bg-white/10' : 'bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90'
          }`}
          style={{ animationDelay: nextLesson ? '0.8s' : '0.7s' }}
        >
          {nextLesson ? 'חזרה לספר' : 'המשך'}
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Share button */}
        {isPerfect && navigator.share && (
          <button
            onClick={() => {
              navigator.share({
                title: 'MindSet - שיעור מושלם!',
                text: `סיימתי שיעור ב-MindSet עם ${stars} כוכבים ו-${xpEarned} XP! 🧠`,
                url: window.location.origin,
              }).catch(() => {})
            }}
            className="flex items-center justify-center gap-1.5 mx-auto mt-3 text-xs text-frost-white/30 hover:text-frost-white/50 transition-colors animate-fade-in"
            style={{ animationDelay: '1s' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            שתף את ההישג
          </button>
        )}
      </div>
    </div>
  )
}
