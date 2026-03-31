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
      className={`fixed bottom-0 left-0 right-0 z-40 border-t animate-bottom-sheet ${
        correct
          ? 'bg-[#0a0a12]/95 border-success/20'
          : 'bg-[#0a0a12]/95 border-danger/20 animate-shake'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="status"
      aria-live="assertive"
    >
      {/* Drag handle hint */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-8 h-1 rounded-full bg-white/10" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-4">
        {/* Status icon + message row */}
        <div className="flex items-start gap-3 mb-3">
          {correct ? (
            <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center shrink-0 animate-bounce-in">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-danger animate-shake" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-base ${correct ? 'text-success' : 'text-danger'}`}>
                {randomMessage}
              </p>
              {showCombo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/15 border border-warning/30 animate-combo-scale">
                  <Zap className="w-3.5 h-3.5 text-warning fill-current" />
                  <span className="text-[11px] font-bold text-warning">
                    {getComboLabel(comboStreak)} x{comboStreak}
                  </span>
                </span>
              )}
              {/* XP earned badge */}
              {correct && earnedXP > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 animate-bounce-in">
                  <Star className="w-3.5 h-3.5 text-gold fill-current" />
                  <span className="text-[11px] font-bold text-gold-text">+{earnedXP} XP</span>
                </span>
              )}
            </div>
            {explanation && (
              <div className={`flex items-start gap-2 mt-2 ${!correct ? 'bg-white/3 rounded-xl p-3 -mx-1' : ''}`}>
                {!correct && <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />}
                <p className="text-sm text-frost-white/60 leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Continue button — 48px minimum height for mobile */}
        <button
          ref={btnRef}
          onClick={onContinue}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] relative overflow-hidden ${
            correct
              ? 'bg-success text-white'
              : 'bg-danger text-white'
          }`}
        >
          {correct ? (
            <>
              <span className="relative z-10">המשך</span>
              {/* Auto-advance progress bar */}
              <div className="absolute inset-0 bg-white/15 origin-left" style={{ animation: 'shrinkBar 3.5s linear forwards' }} />
            </>
          ) : 'הבנתי, הלאה'}
        </button>
      </div>
    </div>
  )
}
