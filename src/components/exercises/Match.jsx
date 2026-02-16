import { useState, useMemo } from 'react'
import { shuffleArray } from '../../lib/gameEngine'

export default function Match({ exercise, onAnswer, disabled }) {
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [matchedPairs, setMatchedPairs] = useState([]) // [{left, right}]

  const shuffledRight = useMemo(() => {
    return shuffleArray(exercise.pairs.map((p, i) => ({ text: p.right, originalIndex: i })))
  }, [exercise.pairs])

  const handleLeftClick = (index) => {
    if (disabled || matchedPairs.some(p => p.left === index)) return
    setSelectedLeft(index)
  }

  const handleRightClick = (originalIndex) => {
    if (disabled || selectedLeft === null || matchedPairs.some(p => p.right === originalIndex)) return
    setMatchedPairs(prev => [...prev, { left: selectedLeft, right: originalIndex }])
    setSelectedLeft(null)
  }

  const handleCheck = () => {
    if (matchedPairs.length !== exercise.pairs.length) return
    const correct = matchedPairs.every(p => p.left === p.right)
    onAnswer(correct, exercise.explanation)
  }

  const isLeftMatched = (i) => matchedPairs.some(p => p.left === i)
  const isRightMatched = (i) => matchedPairs.some(p => p.right === i)
  const getMatchColor = (index, side) => {
    const pair = matchedPairs.find(p => p[side] === index)
    if (!pair) return ''
    if (disabled) {
      return pair.left === pair.right ? 'border-success bg-success/10' : 'border-danger bg-danger/10'
    }
    const colors = ['border-gold/50 bg-gold/10', 'border-dusty-aqua/50 bg-dusty-aqua/10',
      'border-muted-teal/50 bg-muted-teal/10', 'border-deep-petrol/50 bg-deep-petrol/10']
    const pairIndex = matchedPairs.findIndex(p => p[side] === index)
    return colors[pairIndex % colors.length]
  }

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-6 leading-relaxed">
        {exercise.question}
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Left column */}
        <div className="space-y-2">
          {exercise.pairs.map((pair, i) => (
            <button
              key={i}
              onClick={() => handleLeftClick(i)}
              disabled={disabled || isLeftMatched(i)}
              className={`w-full px-3 py-3 rounded-xl border text-sm text-right transition-all ${
                isLeftMatched(i) ? getMatchColor(i, 'left') :
                selectedLeft === i ? 'border-gold bg-gold/10 text-gold' :
                'border-white/10 bg-bg-card hover:border-white/20 text-frost-white/70'
              }`}
            >
              {pair.left}
            </button>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {shuffledRight.map(({ text, originalIndex }) => (
            <button
              key={originalIndex}
              onClick={() => handleRightClick(originalIndex)}
              disabled={disabled || isRightMatched(originalIndex)}
              className={`w-full px-3 py-3 rounded-xl border text-sm text-right transition-all ${
                isRightMatched(originalIndex) ? getMatchColor(originalIndex, 'right') :
                'border-white/10 bg-bg-card hover:border-white/20 text-frost-white/70'
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {!disabled && (
        <button
          onClick={handleCheck}
          disabled={matchedPairs.length !== exercise.pairs.length}
          className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90"
        >
          בדוק
        </button>
      )}
    </div>
  )
}
