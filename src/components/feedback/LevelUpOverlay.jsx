import { useEffect, useState } from 'react'
import ReactConfetti from 'react-confetti'
import { LEVEL_NAMES } from '../../config/constants'
import { Trophy, Sparkles } from 'lucide-react'

export default function LevelUpOverlay({ level, onClose }) {
  const [visible, setVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const confettiTimer = setTimeout(() => setShowConfetti(false), 4000)
    const closeTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 400)
    }, 4000)
    return () => {
      clearTimeout(confettiTimer)
      clearTimeout(closeTimer)
    }
  }, [onClose])

  const levelName = LEVEL_NAMES[level - 1] || LEVEL_NAMES[0]
  const isHighLevel = level >= 5

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={() => { setVisible(false); setTimeout(onClose, 400) }}
    >
      {showConfetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={200}
          colors={['#D4AF37', '#22c55e', '#2F8592', '#E8F1F2', '#f59e0b', '#003B46']}
        />
      )}

      <div className={`text-center transition-all duration-500 ${visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
        {/* Level badge */}
        <div className="relative mx-auto mb-6 w-28 h-28">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold to-warning animate-pulse-glow" />
          <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-gold to-warning flex items-center justify-center">
            <Trophy className="w-14 h-14 text-bg-base" />
          </div>
          {/* Sparkle decorations */}
          {isHighLevel && (
            <>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-gold animate-bounce-in" style={{ animationDelay: '0.3s' }} />
              <Sparkles className="absolute -bottom-1 -left-2 w-5 h-5 text-warning animate-bounce-in" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>

        <p className="text-gold text-sm font-bold mb-2 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          עלית רמה!
        </p>
        <h2 className="font-display text-5xl font-bold text-frost-white mb-3 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
          רמה {level}
        </h2>
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold/10 border border-gold/20 animate-bounce-in" style={{ animationDelay: '0.5s' }}>
          <Sparkles className="w-4 h-4 text-gold" />
          <p className="text-gold text-lg font-bold">{levelName}</p>
        </div>

        <p className="text-frost-white/30 text-xs mt-6 animate-fade-in" style={{ animationDelay: '1s' }}>
          לחץ בכל מקום להמשך
        </p>
      </div>
    </div>
  )
}
