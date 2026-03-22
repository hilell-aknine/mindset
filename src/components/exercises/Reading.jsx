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
    <div className="space-y-4 animate-fade-in">
      {/* Passage card */}
      <div className="glass-card p-5 border-dusty-aqua/15 bg-dusty-aqua/5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-dusty-aqua/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-dusty-aqua" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-dusty-aqua/70 mb-0.5">קטע קריאה</p>
            <h3 className="font-display text-base font-bold text-frost-white">
              {exercise.question || 'קראו את הקטע הבא'}
            </h3>
          </div>
        </div>

        <div className="text-sm text-frost-white/75 leading-[1.8] whitespace-pre-wrap">
          {exercise.passage}
        </div>
      </div>

      {/* Key points */}
      {exercise.keyPoints?.length > 0 && (
        <div className="glass-card p-4 border-gold/15 bg-gold/5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-gold" />
            <p className="text-xs font-bold text-gold/80">נקודות מפתח</p>
          </div>
          <ul className="space-y-2">
            {exercise.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-gold">{i + 1}</span>
                </span>
                <p className="text-sm text-frost-white/70 leading-relaxed flex-1">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={disabled || confirmed}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
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
