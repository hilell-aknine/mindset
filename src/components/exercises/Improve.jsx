import { useState, useEffect, useCallback } from 'react'

const LETTERS = ['א', 'ב', 'ג', 'ד']
const KEYS = ['1', '2', '3', '4']

export default function Improve({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)

  // Handle both formats: options array or optionA/optionB
  const options = exercise.options || [exercise.optionA, exercise.optionB].filter(Boolean)
  const correctIndex = typeof exercise.correct === 'string'
    ? (exercise.correct === 'A' ? 0 : exercise.correct === 'B' ? 1 : parseInt(exercise.correct))
    : exercise.correct

  const handleSelect = useCallback((index) => {
    if (disabled) return
    setSelected(index)
  }, [disabled])

  const handleCheck = useCallback(() => {
    if (selected === null) return
    const correct = selected === correctIndex
    onAnswer(correct, exercise.explanation)
  }, [selected, correctIndex, exercise.explanation, onAnswer])

  // Keyboard shortcuts: 1-4 to select, Enter to check
  useEffect(() => {
    if (disabled) return
    const handler = (e) => {
      const keyIndex = KEYS.indexOf(e.key)
      if (keyIndex >= 0 && keyIndex < options.length) {
        setSelected(keyIndex)
      }
      if (e.key === 'Enter') {
        handleCheck()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [disabled, options.length, handleCheck])

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-4 leading-relaxed">
        {exercise.question}
      </h3>

      {/* Original text */}
      {exercise.original && (
        <div className="glass-card p-4 mb-6 border-warning/20">
          <span className="text-[10px] text-warning/60 font-bold block mb-1">המקור:</span>
          <p className="text-sm text-frost-white/60 leading-relaxed">{exercise.original}</p>
        </div>
      )}

      {/* Improvement options */}
      <div className="space-y-3 mb-6" role="radiogroup" aria-label="אפשרויות תשובה">
        {options.map((option, i) => {
          const optionText = typeof option === 'object' ? option.text : option
          const isSelected = selected === i
          const isCorrect = disabled && i === correctIndex
          const isWrong = disabled && isSelected && i !== correctIndex

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={disabled}
              role="radio"
              aria-checked={isSelected}
              aria-label={`אפשרות ${LETTERS[i]}: ${optionText}`}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-right transition-all min-h-[56px] ${
                isCorrect ? 'border-success bg-success/10 text-success' :
                isWrong ? 'border-danger bg-danger/10 text-danger animate-shake' :
                isSelected ? 'border-gold bg-gold/10 text-gold' :
                'border-white/10 bg-bg-card hover:border-white/20 text-frost-white/80'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                isCorrect ? 'bg-success/20' :
                isWrong ? 'bg-danger/20' :
                isSelected ? 'bg-gold/20' :
                'bg-white/5'
              }`}>
                {LETTERS[i]}
              </span>
              <span className="text-sm leading-relaxed flex-1">{optionText}</span>
              {/* Keyboard hint */}
              {!disabled && (
                <span className="text-[9px] text-frost-white/15 font-mono shrink-0">{KEYS[i]}</span>
              )}
            </button>
          )
        })}
      </div>

      {!disabled && (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className={`w-full py-4 rounded-2xl font-bold text-base min-h-[52px] transition-all active:scale-[0.98] ${
            selected !== null
              ? 'bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90 animate-pulse-ready'
              : 'bg-white/10 text-frost-white/30 cursor-not-allowed opacity-40 border border-white/10'
          }`}
        >
          בדוק
        </button>
      )}
    </div>
  )
}
