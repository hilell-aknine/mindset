import { useState, useMemo } from 'react'
import { shuffleArray } from '../../lib/gameEngine'
import { Undo2, Link } from 'lucide-react'

export default function Match({ exercise, onAnswer, disabled }) {
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [matchedPairs, setMatchedPairs] = useState([]) // [{left, right}]

  const shuffledRight = useMemo(() => {
    return shuffleArray(exercise.pairs.map((p, i) => ({ text: p.right, originalIndex: i })))
  }, [exercise.pairs])

  const handleLeftClick = (index) => {
    if (disabled || matchedPairs.some(p => p.left === index)) return
    setSelectedLeft(selectedLeft === index ? null : index) // Toggle selection
  }

  const handleRightClick = (originalIndex) => {
    if (disabled || selectedLeft === null || matchedPairs.some(p => p.right === originalIndex)) return
    const newPairs = [...matchedPairs, { left: selectedLeft, right: originalIndex }]
    setMatchedPairs(newPairs)
    setSelectedLeft(null)

    // Auto-check when all pairs connected
    if (newPairs.length === exercise.pairs.length) {
      setTimeout(() => {
        const correct = newPairs.every(p => p.left === p.right)
        onAnswer(correct, exercise.explanation)
      }, 400)
    }
  }

  const undoLastPair = () => {
    if (matchedPairs.length === 0 || disabled) return
    setMatchedPairs(prev => prev.slice(0, -1))
  }

  const isLeftMatched = (i) => matchedPairs.some(p => p.left === i)
  const isRightMatched = (i) => matchedPairs.some(p => p.right === i)

  const PAIR_COLORS = [
    { border: 'border-gold/50', bg: 'bg-gold/10', text: 'text-gold', dot: 'bg-gold' },
    { border: 'border-dusty-aqua/50', bg: 'bg-dusty-aqua/10', text: 'text-dusty-aqua', dot: 'bg-dusty-aqua' },
    { border: 'border-muted-teal/50', bg: 'bg-muted-teal/10', text: 'text-muted-teal', dot: 'bg-muted-teal' },
    { border: 'border-frost-white/40', bg: 'bg-frost-white/5', text: 'text-frost-white', dot: 'bg-frost-white' },
    { border: 'border-warning/50', bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  ]

  const getMatchStyle = (index, side) => {
    const pair = matchedPairs.find(p => p[side] === index)
    if (!pair) return null
    if (disabled) {
      return pair.left === pair.right
        ? { border: 'border-success', bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' }
        : { border: 'border-danger', bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' }
    }
    const pairIndex = matchedPairs.findIndex(p => p[side] === index)
    return PAIR_COLORS[pairIndex % PAIR_COLORS.length]
  }

  const allMatched = matchedPairs.length === exercise.pairs.length

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-2 leading-relaxed">
        {exercise.question}
      </h3>

      {/* Instructions + undo */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-frost-white/40">
          {selectedLeft !== null ? 'עכשיו בחר מהצד השמאלי' : 'בחר פריט מהצד הימני'}
        </p>
        {matchedPairs.length > 0 && !disabled && (
          <button
            onClick={undoLastPair}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-frost-white/40 hover:text-frost-white/70 hover:bg-white/5 transition-all"
          >
            <Undo2 className="w-3 h-3" />
            בטל
          </button>
        )}
      </div>

      {/* Match counter */}
      <div className="flex items-center gap-1.5 mb-3">
        {exercise.pairs.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < matchedPairs.length ? 'bg-gold' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Left column */}
        <div className="space-y-2">
          {exercise.pairs.map((pair, i) => {
            const matched = isLeftMatched(i)
            const style = getMatchStyle(i, 'left')

            return (
              <button
                key={i}
                onClick={() => handleLeftClick(i)}
                disabled={disabled || matched}
                className={`w-full px-3 py-3 rounded-xl border text-sm text-right transition-all relative ${
                  style ? `${style.border} ${style.bg}` :
                  selectedLeft === i ? 'border-gold bg-gold/10 text-gold scale-[1.02]' :
                  'border-white/10 bg-bg-card hover:border-white/20 text-frost-white/70'
                }`}
              >
                {/* Color dot for matched pairs */}
                {style && !disabled && (
                  <span className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full ${style.dot}`} />
                )}
                <span className={style ? style.text : ''}>{pair.left}</span>
              </button>
            )
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {shuffledRight.map(({ text, originalIndex }) => {
            const matched = isRightMatched(originalIndex)
            const style = getMatchStyle(originalIndex, 'right')

            return (
              <button
                key={originalIndex}
                onClick={() => handleRightClick(originalIndex)}
                disabled={disabled || matched || selectedLeft === null}
                className={`w-full px-3 py-3 rounded-xl border text-sm text-right transition-all relative ${
                  style ? `${style.border} ${style.bg}` :
                  selectedLeft !== null && !matched
                    ? 'border-white/15 bg-bg-card hover:border-gold/30 hover:bg-gold/5 text-frost-white/70'
                    : 'border-white/10 bg-bg-card text-frost-white/70 opacity-50'
                }`}
              >
                {/* Color dot for matched pairs */}
                {style && !disabled && (
                  <span className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full ${style.dot}`} />
                )}
                <span className={style ? style.text : ''}>{text}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Manual check button (fallback if auto-check timing issue) */}
      {!disabled && allMatched && (
        <button
          onClick={() => {
            const correct = matchedPairs.every(p => p.left === p.right)
            onAnswer(correct, exercise.explanation)
          }}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90"
        >
          בדוק
        </button>
      )}
    </div>
  )
}
