import { useState } from 'react'
import { BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react'

/**
 * Reading exercise — educational passage at the start of each chapter.
 * User reads the content, then clicks to confirm and earn XP.
 *
 * Exercise JSON shape:
 * {
 *   type: "reading",
 *   passage: "2-3 paragraphs of original content...",
 *   question: "קראו את הקטע הבא",
 *   keyPoints: ["נקודה 1", "נקודה 2", "נקודה 3"],
 *   explanation: "מצוין! עכשיו שהבנתם את הרקע, בואו נתרגל"
 * }
 */
export default function Reading({ exercise, onAnswer, disabled }) {
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    if (disabled || confirmed) return
    setConfirmed(true)
    onAnswer(true, exercise.explanation || 'מצוין! סיימתם לקרוא את הקטע.')
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Passage card — scrollable on mobile */}
      <div className="glass-card p-3.5 sm:p-5 border-dusty-aqua/15 bg-dusty-aqua/5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-dusty-aqua/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-dusty-aqua" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-dusty-aqua/70">קטע קריאה</p>
            <h3 className="font-display text-sm sm:text-base font-bold text-frost-white leading-snug">
              {exercise.question || 'קראו את הקטע הבא'}
            </h3>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-frost-white/75 leading-relaxed sm:leading-[1.8] whitespace-pre-wrap max-h-[45vh] overflow-y-auto overscroll-contain">
          {exercise.passage}
        </div>
      </div>

      {/* Key points */}
      {exercise.keyPoints?.length > 0 && (
        <div className="glass-card p-3 sm:p-4 border-gold/15 bg-gold/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-gold" />
            <p className="text-[10px] sm:text-xs font-bold text-gold/80">נקודות מפתח</p>
          </div>
          <ul className="space-y-1.5">
            {exercise.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gold">{i + 1}</span>
                </span>
                <p className="text-xs sm:text-sm text-frost-white/70 leading-relaxed flex-1">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={disabled || confirmed}
        className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
          confirmed
            ? 'bg-success/20 border border-success/30 text-success cursor-default'
            : 'bg-gradient-to-l from-gold/90 to-gold/70 text-bg-base hover:from-gold hover:to-gold/80 shadow-lg shadow-gold/20'
        }`}
        aria-label="סיימתי לקרוא"
      >
        {confirmed ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>נקרא!</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>סיימתי לקרוא</span>
          </>
        )}
      </button>
    </div>
  )
}
