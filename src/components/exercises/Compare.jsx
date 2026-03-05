import { useState, useEffect } from 'react'

export default function Compare({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (index) => {
    if (disabled) return
    setSelected(index)
  }

  const correctIndex = typeof exercise.correct === 'string'
    ? (exercise.correct === 'A' ? 0 : 1)
    : exercise.correct

  const handleCheck = () => {
    if (selected === null) return
    const correct = selected === correctIndex
    onAnswer(correct, exercise.explanation)
  }

  const options = [exercise.optionA, exercise.optionB]

  // Keyboard shortcuts: 1/2 to select, Enter to check
  useEffect(() => {
    if (disabled) return
    const handler = (e) => {
      if (e.key === '1') setSelected(0)
      if (e.key === '2') setSelected(1)
      if (e.key === 'Enter' && selected !== null) handleCheck()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [disabled, selected])

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-6 leading-relaxed">
        {exercise.question}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" role="radiogroup" aria-label="אפשרויות השוואה">
        {options.map((option, i) => {
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
              aria-label={`אפשרות ${i + 1}: ${option.label} — ${option.text}`}
              className={`p-4 rounded-xl border text-right transition-all relative ${
                isCorrect ? 'border-success bg-success/10' :
                isWrong ? 'border-danger bg-danger/10 animate-shake' :
                isSelected ? 'border-gold bg-gold/10' :
                'border-white/10 bg-bg-card hover:border-white/20'
              }`}
            >
              {/* Keyboard hint */}
              {!disabled && (
                <span className="absolute top-2 left-2 text-[9px] text-frost-white/15 font-mono">
                  {i + 1}
                </span>
              )}
              <span className={`text-xs font-bold block mb-2 ${
                isCorrect ? 'text-success' :
                isWrong ? 'text-danger' :
                isSelected ? 'text-gold' :
                'text-frost-white/40'
              }`}>
                {option.label}
              </span>
              <p className={`text-sm leading-relaxed ${
                isCorrect ? 'text-success' :
                isWrong ? 'text-danger' :
                'text-frost-white/70'
              }`}>
                {option.text}
              </p>
            </button>
          )
        })}
      </div>

      {/* VS divider on mobile */}
      <div className="sm:hidden text-center -mt-5 mb-3">
        <span className="inline-block px-3 py-1 rounded-full bg-bg-base text-xs font-bold text-frost-white/30 border border-white/5">
          VS
        </span>
      </div>

      {!disabled && (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
            selected !== null
              ? 'bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90 animate-pulse-ready'
              : 'bg-white/5 text-frost-white/30 cursor-not-allowed'
          }`}
        >
          בדוק
          {selected !== null && <span className="text-[10px] font-normal mr-2 opacity-60">(Enter ↵)</span>}
        </button>
      )}
    </div>
  )
}
