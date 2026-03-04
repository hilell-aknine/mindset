import { useEffect, useRef, useMemo } from 'react'
import { CheckCircle, XCircle, Zap, Lightbulb, Star } from 'lucide-react'
import { getComboLabel, getComboBonus, XP_CORRECT_ANSWER } from '../../config/constants'

const CORRECT_MESSAGES = [
  'מצוין!', 'נכון מאוד!', 'יופי!', 'בול!', 'כל הכבוד!',
  'מדהים!', 'בדיוק!', 'אלוף!', 'תותח!', 'ברווו!',
]

const WRONG_ENCOURAGEMENTS = [
  'לא נורא, ממשיכים!',
  'הפעם הבאה תצליח!',
  'טעויות הן חלק מהלמידה.',
  'קדימה, אל תוותר!',
  'כמעט! נסה שוב.',
]

export default function FeedbackPanel({ correct, explanation, onContinue, comboStreak = 0, speedBonus = 0 }) {
  const showCombo = correct && comboStreak >= 3
  const btnRef = useRef(null)

  const randomMessage = useMemo(() => {
    const arr = correct ? CORRECT_MESSAGES : WRONG_ENCOURAGEMENTS
    return arr[Math.floor(Math.random() * arr.length)]
  }, [correct])

  // Calculate earned XP for display
  const earnedXP = useMemo(() => {
    if (!correct) return 0
    return XP_CORRECT_ANSWER + getComboBonus(comboStreak) + (speedBonus || 0)
  }, [correct, comboStreak, speedBonus])

  // Auto-focus continue button + keyboard shortcut
  useEffect(() => {
    const timer = setTimeout(() => btnRef.current?.focus(), 100)
    const handleKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onContinue()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKey)
    }
  }, [onContinue])

  return (
    <div
      className={`sticky bottom-0 border-t animate-slide-up ${
        correct
          ? 'bg-success/10 border-success/20'
          : 'bg-danger/10 border-danger/20 animate-shake'
      }`}
      role="status"
      aria-live="assertive"
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-start gap-3 mb-3">
          {correct ? (
            <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5 animate-bounce-in" />
          ) : (
            <XCircle className="w-6 h-6 text-danger shrink-0 mt-0.5 animate-shake" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-sm ${correct ? 'text-success' : 'text-danger'}`}>
                {randomMessage}
              </p>
              {showCombo && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 border border-warning/30 animate-combo-scale">
                  <Zap className="w-3 h-3 text-warning fill-current" />
                  <span className="text-[10px] font-bold text-warning">
                    {getComboLabel(comboStreak)} x{comboStreak}
                  </span>
                </span>
              )}
              {/* XP earned badge */}
              {correct && earnedXP > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 animate-bounce-in">
                  <Star className="w-3 h-3 text-gold fill-current" />
                  <span className="text-[10px] font-bold text-gold">+{earnedXP} XP</span>
                </span>
              )}
            </div>
            {explanation && (
              <div className={`flex items-start gap-1.5 mt-1.5 ${!correct ? 'bg-white/3 rounded-lg p-2 -mx-2' : ''}`}>
                {!correct && <Lightbulb className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />}
                <p className="text-xs text-frost-white/60 leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          ref={btnRef}
          onClick={onContinue}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] relative overflow-hidden ${
            correct
              ? 'bg-success text-white animate-correct-pulse'
              : 'bg-danger text-white'
          }`}
        >
          {correct ? (
            <>
              <span className="relative z-10">המשך</span>
              {/* Auto-advance progress bar */}
              <div className="absolute inset-0 bg-white/15 origin-left" style={{ animation: 'shrinkBar 1.5s linear forwards' }} />
            </>
          ) : 'הבנתי, הלאה'}
        </button>
      </div>
    </div>
  )
}
