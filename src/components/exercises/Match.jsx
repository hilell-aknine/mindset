import { useState, useMemo, useCallback } from 'react'
import { shuffleArray } from '../../lib/gameEngine'
import { Undo2, Link } from 'lucide-react'

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח']

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

  const handleKeyDown = useCallback((e, side, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (side === 'left') handleLeftClick(index)
      else handleRightClick(index)
    }
  }, [handleLeftClick, handleRightClick])

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
    <div className="animate-fade-in" role="region" aria-label="תרגיל התאמה">
      <h3 className="font-display text-lg font-bold text-frost-white mb-2 leading-relaxed">
        {exercise.question}
      </h3>

      {/* Keyboard instruction */}
      <p className="text-[10px] text-frost-white/25 mb-2">
        בחר פריט מהעמודה הימנית ואז את ההתאמה משמאל — Tab + Enter לניווט
      </p>

      {/* Instructions + undo */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-frost-white/40" aria-live="polite">
          {allMatched ? 'כל הזוגות חוברו!' : selectedLeft !== null ? 'עכשיו בחר מהצד השמאלי' : 'בחר פריט מהצד הימני'}
        </p>
        {matchedPairs.length > 0 && !disabled && (
          <button
            onClick={undoLastPair}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-frost-white/40 hover:text-frost-white/70 hover:bg-white/5 transition-all min-h-[44px]"
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

      <div className={exercise.pairs.length > 5 ? 'max-h-[55vh] overflow-y-auto sm:max-h-none sm:overflow-visible rounded-lg mb-6' : 'mb-6'}>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Left column */}
        <div className="space-y-2" role="group" aria-label="צד ימין — בחר ראשון">
          {exercise.pairs.map((pair, i) => {
            const matched = isLeftMatched(i)
            const style = getMatchStyle(i, 'left')

            return (
              <button
                key={i}
                onClick={() => handleLeftClick(i)}
                onKeyDown={(e) => handleKeyDown(e, 'left', i)}
                disabled={disabled || matched}
                aria-pressed={selectedLeft === i}
                aria-label={`${i + 1}. ${pair.left}${matched ? ' — מחובר' : ''}`}
                className={`w-full px-3 py-3 rounded-xl border text-xs sm:text-sm text-right transition-all relative min-h-[44px] ${
                  style ? `${style.border} ${style.bg}` :
                  selectedLeft === i ? 'border-gold bg-gold/10 text-gold scale-[1.02]' :
                  'border-white/10 bg-bg-card hover:border-white/20 text-frost-white/70'
                }`}
              >
                {/* Number label */}
                <span className="absolute top-1.5 right-1.5 text-[9px] text-frost-white/20 font-mono">{i + 1}</span>
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
        <div className="space-y-2" role="group" aria-label="צד שמאל — בחר שני">
          {shuffledRight.map(({ text, originalIndex }) => {
            const matched = isRightMatched(originalIndex)
            const style = getMatchStyle(originalIndex, 'right')

            return (
              <button
                key={originalIndex}
                onClick={() => handleRightClick(originalIndex)}
                onKeyDown={(e) => handleKeyDown(e, 'right', originalIndex)}
                disabled={disabled || matched || selectedLeft === null}
                aria-label={`${HEBREW_LETTERS[shuffledRight.indexOf(shuffledRight.find(s => s.originalIndex === originalIndex))]}. ${text}${matched ? ' — מחובר' : ''}`}
                className={`w-full px-3 py-3 rounded-xl border text-xs sm:text-sm text-right transition-all relative min-h-[44px] ${
                  style ? `${style.border} ${style.bg}` :
                  selectedLeft !== null && !matched
                    ? 'border-white/15 bg-bg-card hover:border-gold/30 hover:bg-gold/5 text-frost-white/70'
                    : 'border-white/10 bg-bg-card text-frost-white/70 opacity-50'
                }`}
              >
                {/* Letter label */}
                <span className="absolute top-1.5 right-1.5 text-[9px] text-frost-white/20 font-mono">
                  {HEBREW_LETTERS[shuffledRight.findIndex(s => s.originalIndex === originalIndex)]}
                </span>
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
      </div>

      {/* Manual check button (fallback if auto-check timing issue) */}
      {!disabled && allMatched && (
        <button
          onClick={() => {
            const correct = matchedPairs.every(p => p.left === p.right)
            onAnswer(correct, exercise.explanation)
          }}
          className="w-full py-4 rounded-2xl font-bold text-base min-h-[52px] transition-all bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90"
        >
          בדוק
        </button>
      )}
    </div>
  )
}
