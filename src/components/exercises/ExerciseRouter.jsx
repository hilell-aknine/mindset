import MultipleChoice from './MultipleChoice'
import FillBlank from './FillBlank'
import SortOrder from './SortOrder'
import Compare from './Compare'
import Match from './Match'
import Improve from './Improve'
import Identify from './Identify'

const COMPONENTS = {
  'multiple-choice': MultipleChoice,
  'fill-blank': FillBlank,
  'order': SortOrder,
  'compare': Compare,
  'match': Match,
  'improve': Improve,
  'identify': Identify,
}

export default function ExerciseRouter({ exercise, onAnswer, disabled }) {
  const Component = COMPONENTS[exercise.type]

  if (!Component) {
    return (
      <div className="text-center py-8">
        <p className="text-frost-white/50">סוג תרגיל לא מוכר: {exercise.type}</p>
      </div>
    )
  }

  return <Component exercise={exercise} onAnswer={onAnswer} disabled={disabled} />
}
