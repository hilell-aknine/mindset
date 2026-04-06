import { useState } from 'react'
import { Theater, User, Briefcase, AlertTriangle } from 'lucide-react'

/**
 * Scenario exercise — real-life situation with 3 plausible answers.
 * Only one applies the book principle correctly.
 *
 * Exercise JSON shape:
 * {
 *   type: "scenario",
 *   scenario: "תיאור התרחיש...",
 *   role: "מנהל צוות", // optional role context
 *   question: "מה היית עושה?",
 *   options: ["אפשרות א", "אפשרות ב", "אפשרות ג"],
 *   correct: 0, // index of correct option
 *   explanation: "הסבר למה זו התשובה הנכונה",
 *   wrongExplanations: ["הסבר א", null, "הסבר ג"],
 *   principle: "שם העיקרון מהספר" // optional
 * }
 */
const ROLE_ICONS = {
  default: User,
  manager: Briefcase,
  challenge: AlertTriangle,
}

export default function Scenario({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleSelect = (index) => {
    if (disabled || confirmed) return
    setSelected(index)
  }

  const handleConfirm = () => {
    if (selected === null || confirmed) return
    setConfirmed(true)
    const isCorrect = selected === exercise.correct
    const explanation = isCorrect
      ? exercise.explanation
      : (exercise.wrongExplanations?.[selected] || exercise.explanation)
    onAnswer(isCorrect, explanation)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Scenario card */}
      <div className="glass-card p-4 border-warning/15 bg-warning/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center shrink-0 mt-0.5">
            <Theater className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            {exercise.role && (
              <p className="text-[10px] font-bold text-warning/70 mb-1.5">
                התפקיד שלך: {exercise.role}
              </p>
            )}
            <p className="text-sm text-frost-white/80 leading-relaxed whitespace-pre-wrap">
              {exercise.scenario}
            </p>
          </div>
        </div>
      </div>

      {/* Principle tag */}
      {exercise.principle && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dusty-aqua/10 border border-dusty-aqua/20">
          <span className="text-[10px] text-dusty-aqua font-bold">עיקרון: {exercise.principle}</span>
        </div>
      )}

      {/* Question */}
      <h3 className="font-display text-lg font-bold text-frost-white">
        {exercise.question || 'מה היית עושה?'}
      </h3>

      {/* Options */}
      <div className="space-y-2.5">
        {(exercise.options || []).map((option, i) => {
          const isCorrectOption = i === exercise.correct
          const isSelected = selected === i
          const showResult = confirmed

          let borderClass = 'border-white/10 hover:border-gold/30'
          let bgClass = 'hover:bg-white/5'
          if (showResult && isSelected && isCorrectOption) {
            borderClass = 'border-success/40'
            bgClass = 'bg-success/10'
          } else if (showResult && isSelected && !isCorrectOption) {
            borderClass = 'border-danger/40'
            bgClass = 'bg-danger/10'
          } else if (showResult && isCorrectOption) {
            borderClass = 'border-success/20'
            bgClass = 'bg-success/5'
          } else if (!confirmed && isSelected) {
            borderClass = 'border-gold/40'
            bgClass = 'bg-gold/5'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={disabled || confirmed}
              className={`w-full text-right p-4 rounded-xl border transition-all active:scale-[0.98] disabled:cursor-default ${borderClass} ${bgClass}`}
              aria-label={`אפשרות ${i + 1}: ${option}`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  showResult && isCorrectOption
                    ? 'bg-success/20 text-success'
                    : showResult && isSelected
                      ? 'bg-danger/20 text-danger'
                      : 'bg-white/5 text-frost-white/40'
                }`}>
                  {String.fromCharCode(1488 + i) /* א, ב, ג */}
                </span>
                <p className="text-sm text-frost-white/80 leading-relaxed flex-1">{option}</p>
              </div>
            </button>
          )
        })}
      </div>

      {selected !== null && !confirmed && (
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl bg-gradient-to-l from-gold to-warning text-bg-base font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all min-h-[48px] mt-4 animate-fade-in"
        >
          בדוק
        </button>
      )}
    </div>
  )
}
