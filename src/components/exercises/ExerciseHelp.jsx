import { useState, useEffect, useRef } from 'react'
import { HelpCircle, X } from 'lucide-react'

const HELP_MAP = {
  'multiple-choice': {
    title: 'בחירה מרובה',
    instructions: 'בחר את התשובה הנכונה מבין האפשרויות.',
    keyboard: 'מקשים 1-4 לבחירה מהירה, Enter לאישור',
  },
  'fill-blank': {
    title: 'השלם את המשפט',
    instructions: 'הקלד את המילה החסרה בשדה הריק.',
    keyboard: 'Tab להתמקדות בשדה, Enter לבדיקה',
  },
  'compare': {
    title: 'השוואה',
    instructions: 'בחר איזו אפשרות מתאימה יותר לשאלה.',
    keyboard: 'מקשי חצים לניווט, Enter לבחירה',
  },
  'improve': {
    title: 'שיפור',
    instructions: 'בחר את הניסוח המשופר או התשובה הטובה יותר.',
    keyboard: 'מקשים 1-4 לבחירה, Enter לאישור',
  },
  'order': {
    title: 'סדר נכון',
    instructions: 'סדר את הפריטים בסדר הנכון מלמעלה למטה.',
    keyboard: 'Tab לניווט, Enter לבחירה, גרור או לחץ להזזה',
  },
  'match': {
    title: 'התאמה',
    instructions: 'חבר כל פריט מימין לפריט המתאים משמאל.',
    keyboard: 'Tab לניווט בין פריטים, Enter לבחירה/חיבור',
  },
  'identify': {
    title: 'זיהוי',
    instructions: 'זהה את הפריט הנכון מתוך הרשימה.',
    keyboard: 'מקשים 1-4 לבחירה, Enter לאישור',
  },
}

export default function ExerciseHelp({ exerciseType }) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)
  const help = HELP_MAP[exerciseType]

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  if (!help) return null

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full glass-card flex items-center justify-center text-frost-white/40 hover:text-frost-white/70 hover:border-white/20 transition-all"
        aria-label="עזרה לתרגיל"
        aria-expanded={open}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute top-12 left-0 z-50 w-64 max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto glass-card p-4 animate-fade-in border border-white/10"
          role="region"
          aria-label="עזרה לתרגיל"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gold">{help.title}</span>
            <button
              onClick={() => setOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              aria-label="סגור עזרה"
            >
              <X className="w-4 h-4 text-frost-white/40" />
            </button>
          </div>
          <p className="text-xs text-frost-white/60 leading-relaxed mb-2">
            {help.instructions}
          </p>
          <div className="pt-2 border-t border-white/5">
            <p className="text-[10px] text-frost-white/30">
              ⌨️ {help.keyboard}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
