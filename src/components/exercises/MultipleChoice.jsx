import { useState, useEffect, useCallback, useRef } from 'react'
import { checkAnswer } from '../../lib/gameEngine'
import { useToast } from '../../contexts/ToastContext'

const LETTERS = ['א', 'ב', 'ג', 'ד']

export default function MultipleChoice({ exercise, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)
  const [eliminated, setEliminated] = useState([]) // Wrong attempts that are crossed out
  const [shaking, setShaking] = useState(false)
  const toast = useToast()
  const btnRef = useRef(null)

  const handleSelect = useCallback((index) => {
    if (disabled || eliminated.includes(index)) return
    setSelected(index)
  }, [disabled, eliminated])

  // Keyboard shortcuts: 1-4 to select, Enter to check
  useEffect(() => {
    if (disabled) return
    const handleKey = (e) => {
      const num = parseInt(e.key)
      if (num >= 1 && num <= exercise.options.length) {
        handleSelect(num - 1)
      }
      if (e.key === 'Enter') {
        if (selected !== null) {
          handleCheck()
        } else {
          triggerShake()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [disabled, exercise.options.length, handleSelect, selected])

  const triggerShake = () => {
    setShaking(true)
    toast.info('בחר תשובה תחילה')
    setTimeout(() => setShaking(false), 400)
  }

  const handleCheck = () => {
    if (selected === null) {
      triggerShake()
      return
    }
    const correct = checkAnswer(exercise, selected)

    if (!correct && eliminated.length === 0 && exercise.options.length > 2) {
      // First wrong attempt — give a second chance
      setEliminated([selected])
      setSelected(null)
      return
    }

    onAnswer(correct, exercise.explanation)
  }

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-6 leading-relaxed">
        {exercise.question}
      </h3>

      {/* Second chance hint */}
      {eliminated.length > 0 && !disabled && (
        <p className="text-xs text-warning/70 mb-3 animate-fade-in">
          לא בדיוק — נסה שוב! 🔄
        </p>
      )}

      <div className="space-y-3 mb-6" role="radiogroup" aria-label="אפשרויות תשובה">
        {exercise.options.map((option, i) => {
          const isSelected = selected === i
          const isEliminated = eliminated.includes(i)
          const isCorrect = disabled && i === exercise.correct
          const isWrong = disabled && isSelected && i !== exercise.correct

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={disabled || isEliminated}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${LETTERS[i]}: ${option}`}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border text-right transition-all min-h-[56px] ${
                isCorrect ? 'border-success bg-success/10 text-success' :
                isWrong ? 'border-danger bg-danger/10 text-danger animate-shake' :
                isEliminated ? 'border-white/5 bg-bg-card/50 opacity-40 line-through' :
                isSelected ? 'border-gold bg-gold/10 text-gold' :
                'border-white/10 bg-bg-card hover:border-white/20 text-frost-white/80'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 relative ${
                isCorrect ? 'bg-success/20' :
                isWrong ? 'bg-danger/20' :
                isEliminated ? 'bg-white/3' :
                isSelected ? 'bg-gold/20' :
                'bg-white/5'
              }`}>
                {LETTERS[i]}
                <span className="absolute -top-1 -left-1 text-[8px] text-frost-white/25 font-mono bg-white/5 rounded px-1">{i + 1}</span>
              </span>
              <span className="text-xs sm:text-sm leading-relaxed flex-1 min-w-0 break-words">{option}</span>
            </button>
          )
        })}
      </div>

      {!disabled && (
        <button
          ref={btnRef}
          onClick={handleCheck}
          aria-label="בדוק תשובה (Enter)"
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all min-h-[52px] ${
            selected !== null
              ? 'bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90 active:scale-[0.98] animate-pulse-ready'
              : `bg-white/10 text-frost-white/30 cursor-not-allowed opacity-40 border border-white/10 ${shaking ? 'animate-shake' : ''}`
          }`}
        >
          בדוק תשובה
        </button>
      )}
    </div>
  )
}
