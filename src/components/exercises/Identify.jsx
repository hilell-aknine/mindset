import { useState, useRef, useCallback } from 'react'

export default function Identify({ exercise, onAnswer, disabled }) {
  const [selection, setSelection] = useState(null) // {start, end}
  const textRef = useRef(null)

  const handleTextSelection = useCallback(() => {
    if (disabled) return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !textRef.current) return

    const range = sel.getRangeAt(0)
    const textNode = textRef.current.firstChild
    if (!textNode) return

    // Calculate offsets relative to the text content
    let start, end
    if (range.startContainer === textNode || range.startContainer.parentNode === textRef.current) {
      start = range.startOffset
    }
    if (range.endContainer === textNode || range.endContainer.parentNode === textRef.current) {
      end = range.endOffset
    }

    // Fallback: use string matching
    if (start == null || end == null) {
      const selectedText = sel.toString()
      const fullText = exercise.text
      const idx = fullText.indexOf(selectedText)
      if (idx >= 0) {
        start = idx
        end = idx + selectedText.length
      }
    }

    if (start != null && end != null && start !== end) {
      setSelection({ start: Math.min(start, end), end: Math.max(start, end) })
    }
  }, [disabled, exercise.text])

  const handleCheck = () => {
    if (!selection) return
    const [correctStart, correctEnd] = exercise.correctRange

    const overlapStart = Math.max(selection.start, correctStart)
    const overlapEnd = Math.min(selection.end, correctEnd)
    const overlapLength = Math.max(0, overlapEnd - overlapStart)

    const selectionLength = selection.end - selection.start
    const correctLength = correctEnd - correctStart

    const selRatio = selectionLength > 0 ? overlapLength / selectionLength : 0
    const corrRatio = correctLength > 0 ? overlapLength / correctLength : 0

    const correct = selRatio >= 0.6 && corrRatio >= 0.4
    onAnswer(correct, exercise.explanation)
  }

  const renderText = () => {
    const text = exercise.text
    if (disabled && exercise.correctRange) {
      const [cs, ce] = exercise.correctRange
      return (
        <>
          {text.slice(0, cs)}
          <mark className="bg-success/30 text-success rounded px-0.5">{text.slice(cs, ce)}</mark>
          {text.slice(ce)}
        </>
      )
    }
    if (selection) {
      return (
        <>
          {text.slice(0, selection.start)}
          <mark className="bg-gold/30 text-gold rounded px-0.5">{text.slice(selection.start, selection.end)}</mark>
          {text.slice(selection.end)}
        </>
      )
    }
    return text
  }

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-4 leading-relaxed">
        {exercise.question}
      </h3>

      <p className="text-xs text-frost-white/40 mb-3">
        סמנו את הטקסט הרלוונטי
      </p>

      {/* Text to select from */}
      <div
        ref={textRef}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        className={`glass-card p-5 text-sm leading-loose cursor-text select-text ${
          disabled ? 'text-frost-white/60' : 'text-frost-white/80'
        }`}
      >
        {renderText()}
      </div>

      {selection && !disabled && (
        <p className="text-xs text-gold/60 mt-2">
          נבחר: &quot;{exercise.text.slice(selection.start, selection.end)}&quot;
        </p>
      )}

      <div className="mt-6">
        {!disabled && (
          <button
            onClick={handleCheck}
            disabled={!selection}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90"
          >
            בדוק
          </button>
        )}
      </div>
    </div>
  )
}
