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
  'multiple-choice': { label: 'בחירה מרובה', emoji: '🔘' },
  'fill-blank': { label: 'השלם את המשפט', emoji: '✏️' },
  'order': { label: 'סדר נכון', emoji: '📋' },
  'compare': { label: 'השוואה', emoji: '⚖️' },
  'match': { label: 'התאמה', emoji: '🔗' },
  'improve': { label: 'שיפור', emoji: '💡' },
  'identify': { label: 'זיהוי', emoji: '🔍' },
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

  return (
    <div>
      {/* Exercise type badge */}
      {typeInfo && (
        <div className="flex items-center gap-1.5 mb-3 animate-fade-in">
          <span className="text-sm">{typeInfo.emoji}</span>
          <span className="text-[10px] font-bold text-frost-white/30 tracking-wide">{typeInfo.label}</span>
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
