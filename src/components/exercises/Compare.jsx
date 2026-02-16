import { useState } from 'react'

export default function Compare({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (index) => {
    if (disabled) return
    setSelected(index)
  }

  const handleCheck = () => {
    if (selected === null) return
    const correct = selected === exercise.correct
    onAnswer(correct, exercise.explanation)
  }

  const options = [exercise.optionA, exercise.optionB]

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-6 leading-relaxed">
        {exercise.question}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {options.map((option, i) => {
          const isSelected = selected === i
          const isCorrect = disabled && i === exercise.correct
          const isWrong = disabled && isSelected && i !== exercise.correct

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={disabled}
              className={`p-4 rounded-xl border text-right transition-all ${
                isCorrect ? 'border-success bg-success/10' :
                isWrong ? 'border-danger bg-danger/10 animate-shake' :
                isSelected ? 'border-gold bg-gold/10' :
                'border-white/10 bg-bg-card hover:border-white/20'
              }`}
            >
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
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90"
        >
          בדוק
        </button>
      )}
    </div>
  )
}
