import { useState, useMemo } from 'react'
import { checkAnswer } from '../../lib/gameEngine'
import { shuffleArray } from '../../lib/gameEngine'

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
    setSelected(originalIndex)
  }

  const handleCheck = () => {
    if (selected === null) return
    const correct = checkAnswer(exercise, selected)
    onAnswer(correct, exercise.explanation)
  }

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-4 leading-relaxed">
        {exercise.question}
      </h3>

      {/* Template with blank */}
      <div className="glass-card p-5 mb-6 text-sm leading-loose text-frost-white/80">
        {filledTemplate.split('___').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className={`inline-block min-w-[80px] mx-1 px-3 py-0.5 rounded-lg border-b-2 text-center font-semibold ${
                disabled && selected === exercise.correct
                  ? 'border-success text-success bg-success/10'
                  : disabled && selected !== null
                    ? 'border-danger text-danger bg-danger/10'
                    : selected !== null
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-white/20 text-frost-white/30'
              }`}>
                {selected !== null ? exercise.options[selected] : '___'}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 mb-6">
        {shuffledOptions.map(({ text, originalIndex }) => {
          const isSelected = selected === originalIndex
          const isCorrectAnswer = disabled && originalIndex === exercise.correct
          const isWrongSelection = disabled && isSelected && originalIndex !== exercise.correct

          return (
            <button
              key={originalIndex}
              onClick={() => handleSelect(originalIndex)}
              disabled={disabled}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isCorrectAnswer ? 'bg-success/20 text-success border border-success/30' :
                isWrongSelection ? 'bg-danger/20 text-danger border border-danger/30' :
                isSelected ? 'bg-gold/20 text-gold border border-gold/30' :
                'bg-bg-card border border-white/10 text-frost-white/70 hover:border-white/20'
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
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90"
        >
          בדוק
        </button>
      )}
    </div>
  )
}
