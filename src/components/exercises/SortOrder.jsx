import { useState, useRef, useCallback } from 'react'
import { GripVertical, ChevronUp, ChevronDown, Check } from 'lucide-react'

export default function SortOrder({ exercise, onAnswer, disabled }) {
  const [items, setItems] = useState(() =>
    exercise.items.map((text, i) => ({ text, originalIndex: i, id: `item-${i}` }))
  )
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [lastMoved, setLastMoved] = useState(null)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleDragStart = (index) => {
    if (disabled) return
    dragItem.current = index
    setDraggingIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    dragOverItem.current = index
    setDropTarget(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
    setDropTarget(null)
  }

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) {
      setDraggingIndex(null)
      setDropTarget(null)
      return
    }
    const newItems = [...items]
    const draggedItem = newItems.splice(dragItem.current, 1)[0]
    newItems.splice(dragOverItem.current, 0, draggedItem)
    setItems(newItems)
    setLastMoved(draggedItem.id)
    setTimeout(() => setLastMoved(null), 400)
    dragItem.current = null
    dragOverItem.current = null
    setDraggingIndex(null)
    setDropTarget(null)
  }

  // Move item up/down (accessibility + mobile alternative)
  const moveItem = useCallback((index, direction) => {
    if (disabled) return
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= items.length) return
    const newItems = [...items]
    const movedItem = newItems[index]
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    setItems(newItems)
    setLastMoved(movedItem.id)
    setTimeout(() => setLastMoved(null), 400)
    // Haptic feedback on mobile if available
    if (navigator.vibrate) navigator.vibrate(30)
  }, [items, disabled])

  // Touch support
  const touchStart = useRef(null)

  const handleTouchStart = (index, e) => {
    if (disabled) return
    touchStart.current = { index, y: e.touches[0].clientY }
    setDraggingIndex(index)
    if (navigator.vibrate) navigator.vibrate(20)
  }

  const handleTouchMove = (e) => {
    if (!touchStart.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const elements = document.querySelectorAll('[data-sort-item]')
    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        dragOverItem.current = i
        setDropTarget(i)
        break
      }
    }
  }

  const handleTouchEnd = () => {
    if (touchStart.current !== null && dragOverItem.current !== null) {
      dragItem.current = touchStart.current.index
      handleDrop()
    }
    touchStart.current = null
    dragOverItem.current = null
    setDraggingIndex(null)
    setDropTarget(null)
  }

  const handleCheck = () => {
    const currentOrder = items.map(item => item.originalIndex)
    const correct = JSON.stringify(currentOrder) === JSON.stringify(exercise.correctOrder)
    onAnswer(correct, exercise.explanation)
  }

  return (
    <div className="animate-fade-in" role="group" aria-label="תרגיל סידור">
      <h3 className="font-display text-lg font-bold text-frost-white mb-2 leading-relaxed">
        {exercise.question}
      </h3>
      <p className="text-xs text-frost-white/40 mb-4">גרור או השתמש בחצים כדי לסדר</p>

      <div
        className="space-y-2 mb-6"
        onTouchMove={handleTouchMove}
        role="list"
        aria-label="פריטים לסידור"
      >
        {items.map((item, index) => {
          const isCorrectPosition = disabled && item.originalIndex === exercise.correctOrder[index]
          const isWrongPosition = disabled && item.originalIndex !== exercise.correctOrder[index]
          const isDragging = draggingIndex === index
          const isDropZone = dropTarget === index && draggingIndex !== null && draggingIndex !== index
          const justMoved = lastMoved === item.id

          return (
            <div
              key={item.id}
              data-sort-item
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(index, e)}
              onTouchEnd={handleTouchEnd}
              role="listitem"
              aria-label={`${item.text} — מיקום ${index + 1}`}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all duration-200 select-none ${
                isCorrectPosition ? 'border-success bg-success/10' :
                isWrongPosition ? 'border-danger bg-danger/10 animate-shake' :
                isDragging ? 'border-gold bg-gold/10 opacity-50 scale-[0.95] shadow-lg shadow-gold/10' :
                isDropZone ? 'border-gold/40 bg-gold/5 scale-[1.03] -translate-y-0.5' :
                justMoved ? 'border-dusty-aqua/40 bg-dusty-aqua/5' :
                'border-white/10 bg-bg-card hover:border-white/20'
              } ${!disabled ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
              {/* Position number */}
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                isCorrectPosition ? 'bg-success/20 text-success' :
                isWrongPosition ? 'bg-danger/20 text-danger' :
                'bg-white/5 text-frost-white/40'
              }`}>
                {isCorrectPosition ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </span>

              {/* Drag handle */}
              {!disabled && (
                <GripVertical className="w-4 h-4 text-frost-white/20 shrink-0" />
              )}

              {/* Text */}
              <span className={`text-sm flex-1 ${
                isCorrectPosition ? 'text-success' :
                isWrongPosition ? 'text-danger' :
                'text-frost-white/80'
              }`}>{item.text}</span>

              {/* Correct position indicator when wrong */}
              {isWrongPosition && (
                <span className="text-[9px] text-danger/60 shrink-0 bg-danger/10 px-1.5 py-0.5 rounded">
                  #{exercise.correctOrder.indexOf(item.originalIndex) + 1}
                </span>
              )}

              {/* Up/down buttons for mobile/accessibility */}
              {!disabled && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveItem(index, -1) }}
                    disabled={index === 0}
                    className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-colors active:scale-90"
                    aria-label={`הזז "${item.text}" למעלה`}
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-frost-white/40" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 1) }}
                    disabled={index === items.length - 1}
                    className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-colors active:scale-90"
                    aria-label={`הזז "${item.text}" למטה`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-frost-white/40" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!disabled && (
        <button
          onClick={handleCheck}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90 transition-all active:scale-[0.98] animate-pulse-ready"
        >
          בדוק
          <span className="text-[10px] font-normal mr-2 opacity-60">(Enter ↵)</span>
        </button>
      )}
    </div>
  )
}
