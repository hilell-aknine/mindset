import MultipleChoice from './MultipleChoice'
import FillBlank from './FillBlank'
import SortOrder from './SortOrder'
import Compare from './Compare'
import Match from './Match'
import Improve from './Improve'
import Identify from './Identify'
import HintButton from './HintButton'

const COMPONENTS = {
  'multiple-choice': MultipleChoice,
  'fill-blank': FillBlank,
  'order': SortOrder,
  'compare': Compare,
  'match': Match,
  'improve': Improve,
  'identify': Identify,
}

const TYPE_LABELS = {
  'multiple-choice': { label: 'בחירה מרובה', emoji: '🔘', difficulty: 1 },
  'fill-blank': { label: 'השלם את המשפט', emoji: '✏️', difficulty: 2 },
  'compare': { label: 'השוואה', emoji: '⚖️', difficulty: 2 },
  'improve': { label: 'שיפור', emoji: '💡', difficulty: 2 },
  'order': { label: 'סדר נכון', emoji: '📋', difficulty: 3 },
  'match': { label: 'התאמה', emoji: '🔗', difficulty: 3 },
  'identify': { label: 'זיהוי', emoji: '🔍', difficulty: 3 },
}

const DIFFICULTY_LABELS = {
  1: { text: 'קל', color: 'text-success/50', dots: 1 },
  2: { text: 'בינוני', color: 'text-warning/50', dots: 2 },
  3: { text: 'מאתגר', color: 'text-danger/50', dots: 3 },
}

export default function ExerciseRouter({ exercise, onAnswer, disabled, tokens, onUseToken }) {
  const Component = COMPONENTS[exercise.type]
  const typeInfo = TYPE_LABELS[exercise.type]

  if (!Component) {
    return (
      <div className="text-center py-8">
        <p className="text-frost-white/50">סוג תרגיל לא מוכר: {exercise.type}</p>
      </div>
    )
  }

  const diff = typeInfo ? DIFFICULTY_LABELS[typeInfo.difficulty] : null

  return (
    <div>
      {/* Exercise type badge + difficulty */}
      {typeInfo && (
        <div className="flex items-center gap-2 mb-3 animate-fade-in">
          <span className="text-sm">{typeInfo.emoji}</span>
          <span className="text-[10px] font-bold text-frost-white/30 tracking-wide">{typeInfo.label}</span>
          {diff && (
            <div className="flex items-center gap-1 mr-auto" aria-label={`רמת קושי: ${diff.text}`}>
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= diff.dots ? (
                  diff.dots === 1 ? 'bg-success/50' : diff.dots === 2 ? 'bg-warning/50' : 'bg-danger/50'
                ) : 'bg-white/10'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hint button — only show when not answered yet and tokens available */}
      {!disabled && tokens != null && (
        <HintButton
          exercise={exercise}
          tokens={tokens}
          onUseToken={onUseToken}
          disabled={disabled}
        />
      )}
      <Component exercise={exercise} onAnswer={onAnswer} disabled={disabled} />
    </div>
  )
}
