import { useState, useRef } from 'react'
import { GripVertical } from 'lucide-react'

export default function SortOrder({ exercise, onAnswer, disabled }) {
  const [items, setItems] = useState(() =>
    exercise.items.map((text, i) => ({ text, originalIndex: i }))
  )
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleDragStart = (index) => {
    dragItem.current = index
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    dragOverItem.current = index
  }

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    const newItems = [...items]
    const draggedItem = newItems.splice(dragItem.current, 1)[0]
    newItems.splice(dragOverItem.current, 0, draggedItem)
    setItems(newItems)
    dragItem.current = null
    dragOverItem.current = null
  }

  // Touch support
  const touchStart = useRef(null)
  const handleTouchStart = (index, e) => {
    touchStart.current = { index, y: e.touches[0].clientY }
  }

  const handleTouchMove = (e) => {
    if (!touchStart.current) return
    const touch = e.touches[0]
    const elements = document.querySelectorAll('[data-sort-item]')
    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        dragOverItem.current = i
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
  }

  const handleCheck = () => {
    const currentOrder = items.map(item => item.originalIndex)
    const correct = JSON.stringify(currentOrder) === JSON.stringify(exercise.correctOrder)
    onAnswer(correct, exercise.explanation)
  }

  return (
    <div className="animate-fade-in">
      <h3 className="font-display text-lg font-bold text-frost-white mb-6 leading-relaxed">
        {exercise.question}
      </h3>

      <div className="space-y-2 mb-6">
        {items.map((item, index) => {
          const isCorrectPosition = disabled && item.originalIndex === exercise.correctOrder[index]
          const isWrongPosition = disabled && item.originalIndex !== exercise.correctOrder[index]

          return (
            <div
              key={item.originalIndex}
              data-sort-item
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              onTouchStart={(e) => handleTouchStart(index, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all select-none ${
                isCorrectPosition ? 'border-success bg-success/10' :
                isWrongPosition ? 'border-danger bg-danger/10' :
                'border-white/10 bg-bg-card cursor-grab active:cursor-grabbing hover:border-white/20'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-frost-white/40 shrink-0">
                {index + 1}
              </span>
              <GripVertical className="w-4 h-4 text-frost-white/20 shrink-0" />
              <span className="text-sm text-frost-white/80">{item.text}</span>
            </div>
          )
        })}
      </div>

      {!disabled && (
        <button
          onClick={handleCheck}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white hover:opacity-90 transition-opacity"
        >
          בדוק
        </button>
      )}
    </div>
  )
}
