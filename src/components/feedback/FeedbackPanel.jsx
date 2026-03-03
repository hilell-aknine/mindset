import { CheckCircle, XCircle, Zap } from 'lucide-react'
import { getComboLabel } from '../../config/constants'

export default function FeedbackPanel({ correct, explanation, onContinue, comboStreak = 0 }) {
  const showCombo = correct && comboStreak >= 3

  return (
    <div className={`sticky bottom-0 border-t animate-slide-up ${
      correct
        ? 'bg-success/10 border-success/20'
        : 'bg-danger/10 border-danger/20'
    }`}>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-start gap-3 mb-3">
          {correct ? (
            <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5 animate-bounce-in" />
          ) : (
            <XCircle className="w-6 h-6 text-danger shrink-0 mt-0.5 animate-shake" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-bold text-sm ${correct ? 'text-success' : 'text-danger'}`}>
                {correct ? 'נכון!' : 'לא נכון'}
              </p>
              {showCombo && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 border border-warning/30 animate-combo-scale">
                  <Zap className="w-3 h-3 text-warning fill-current" />
                  <span className="text-[10px] font-bold text-warning">
                    {getComboLabel(comboStreak)} x{comboStreak}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-frost-white/60 mt-1 leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] ${
            correct
              ? 'bg-success text-white animate-correct-pulse'
              : 'bg-danger text-white'
          }`}
        >
          המשך
        </button>
      </div>
    </div>
  )
}
