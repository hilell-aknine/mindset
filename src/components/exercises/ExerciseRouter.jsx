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

export default function ExerciseRouter({ exercise, onAnswer, disabled, tokens, onUseToken }) {
  const Component = COMPONENTS[exercise.type]

  if (!Component) {
    return (
      <div className="text-center py-8">
        <p className="text-frost-white/50">סוג תרגיל לא מוכר: {exercise.type}</p>
      </div>
    )
  }

  return (
    <div>
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
