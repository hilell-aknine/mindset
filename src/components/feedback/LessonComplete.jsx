import { useEffect, useState } from 'react'
import ReactConfetti from 'react-confetti'
import { Star, Trophy, ArrowLeft } from 'lucide-react'
import { XP_LESSON_COMPLETE, XP_PERFECT_LESSON } from '../../config/constants'

export default function LessonComplete({ mistakes, totalExercises, onContinue }) {
  const [showConfetti, setShowConfetti] = useState(true)
  const isPerfect = mistakes === 0
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
  const xpEarned = XP_LESSON_COMPLETE + (isPerfect ? XP_PERFECT_LESSON : 0)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 relative">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}

      <div className="text-center animate-fade-in">
        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <Star
              key={i}
              className={`w-12 h-12 transition-all ${
                i <= stars
                  ? 'text-gold fill-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                  : 'text-white/10'
              }`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl font-bold text-frost-white mb-2">
          {isPerfect ? 'מושלם!' : 'כל הכבוד!'}
        </h2>
        <p className="text-frost-white/50 text-sm mb-8">
          {isPerfect
            ? 'סיימת את השיעור בלי שגיאות!'
            : `סיימת את השיעור עם ${mistakes} שגיאות מתוך ${totalExercises} שאלות`
          }
        </p>

        {/* XP earned */}
        <div className="glass-card inline-flex items-center gap-3 px-6 py-3 mb-8">
          <Trophy className="w-5 h-5 text-gold" />
          <span className="text-gold font-bold">+{xpEarned} XP</span>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          המשך
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
