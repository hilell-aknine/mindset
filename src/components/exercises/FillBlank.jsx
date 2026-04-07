import { useState, useMemo, useEffect } from 'react'
import { checkAnswer, shuffleArray } from '../../lib/gameEngine'

export default function FillBlank({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)
  const shuffledOptions = useMemo(() => {
    return shuffleArray(exercise.options.map((opt, i) => ({ text: opt, originalIndex: i })))
  }, [exercise.options])

  const filledTemplate = selected !== null
    ? exercise.template.replace('___', exercise.options[selected])
    : exercise.template

  const handleSelect = (originalIndex) => {
    if (disabled) return
    setSelected(selected === originalIndex ? null : originalIndex)
  }

  const handleCheck = () => {
    if (selected === null) return
    const correct = checkAnswer(exercise, selected)
    onAnswer(correct, exercise.explanation)
  }

  // Keyboard: Enter to check
  useEffect(() => {
    if (disabled) return
    const handler = (e) => {
      if (e.key === 'Enter' && selected !== null) handleCheck()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [disabled, selected])

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-4 leading-relaxed">
        {exercise.question}
      </h3>

      {/* Template with blank */}
      <div className="glass-card p-5 mb-6 text-sm leading-loose text-frost-white/80" aria-live="polite">
        {filledTemplate.split('___').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className={`inline-block min-w-[80px] mx-1 px-3 py-0.5 rounded-lg border-b-2 text-center font-semibold transition-all ${
                disabled && selected === exercise.correct
                  ? 'border-success text-success bg-success/10'
                  : disabled && selected !== null
                    ? 'border-danger text-danger bg-danger/10 animate-shake'
                    : selected !== null
                      ? 'border-gold text-gold bg-gold/10 scale-105'
                      : 'border-white/20 text-frost-white/30 animate-pulse'
              }`}>
                {selected !== null ? exercise.options[selected] : '___'}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Word bank */}
      <p className="text-[10px] text-frost-white/30 mb-2">בחר מילה:</p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6" role="group" aria-label="בנק מילים">
        {shuffledOptions.map(({ text, originalIndex }) => {
          const isSelected = selected === originalIndex
          const isCorrectAnswer = disabled && originalIndex === exercise.correct
          const isWrongSelection = disabled && isSelected && originalIndex !== exercise.correct

          return (
            <button
              key={originalIndex}
              onClick={() => handleSelect(originalIndex)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`מילה: ${text}`}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                isCorrectAnswer ? 'bg-success/20 text-success border border-success/30 scale-105' :
                isWrongSelection ? 'bg-danger/20 text-danger border border-danger/30' :
                isSelected ? 'bg-gold/20 text-gold border border-gold/30 scale-105 shadow-lg shadow-gold/10' :
                'bg-bg-card border border-white/10 text-frost-white/70 hover:border-white/20 hover:scale-[1.02]'
              }`}
            >
              {text}
            </button>
          )
        })}
      </div>

      {!disabled && (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] min-h-[52px] ${
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
