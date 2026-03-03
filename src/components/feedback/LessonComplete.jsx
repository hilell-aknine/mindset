import { useEffect, useState } from 'react'
import ReactConfetti from 'react-confetti'
import { Star, Trophy, ArrowLeft, Sparkles } from 'lucide-react'
import { XP_LESSON_COMPLETE, XP_PERFECT_LESSON } from '../../config/constants'

export default function LessonComplete({ mistakes, totalExercises, onContinue, speedBonus = 0 }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [starsRevealed, setStarsRevealed] = useState(0)
  const isPerfect = mistakes === 0
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
  const xpEarned = XP_LESSON_COMPLETE + (isPerfect ? XP_PERFECT_LESSON : 0) + speedBonus

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
        <p className="text-frost-white/50 text-sm mb-8">
          {isPerfect
            ? 'סיימת את השיעור בלי שגיאות!'
            : `סיימת את השיעור עם ${mistakes} ${mistakes === 1 ? 'שגיאה' : 'שגיאות'} מתוך ${totalExercises} שאלות`
          }
        </p>

        {/* XP earned card */}
        <div className="glass-card inline-flex items-center gap-3 px-6 py-3.5 mb-8 animate-bounce-in border-gold/20" style={{ animationDelay: '0.5s' }}>
          <Trophy className="w-6 h-6 text-gold" />
          <div className="text-right">
            <span className="text-gold font-bold text-lg">+{xpEarned} XP</span>
            {isPerfect && (
              <span className="block text-[10px] text-gold/60">כולל בונוס מושלם +{XP_PERFECT_LESSON}</span>
            )}
            {speedBonus > 0 && (
              <span className="block text-[10px] text-dusty-aqua/60">בונוס מהירות +{speedBonus}</span>
            )}
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98] animate-bounce-in"
          style={{ animationDelay: '0.7s' }}
        >
          המשך
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
