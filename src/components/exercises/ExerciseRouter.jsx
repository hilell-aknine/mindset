import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import MultipleChoice from './MultipleChoice'
import FillBlank from './FillBlank'
import SortOrder from './SortOrder'
import Compare from './Compare'
import Match from './Match'
import Improve from './Improve'
import Identify from './Identify'
import Scenario from './Scenario'
import Reading from './Reading'
import HintButton from './HintButton'
import ExerciseHelp from './ExerciseHelp'

function ContextPassage({ text }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 120
  const display = !isLong || expanded ? text : text.slice(0, 120) + '...'

  return (
    <div className="mb-4 p-3.5 rounded-xl bg-deep-petrol/30 border border-white/5 animate-fade-in">
      <div className="flex items-start gap-2">
        <BookOpen className="w-3.5 h-3.5 text-dusty-aqua/60 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-dusty-aqua/60 mb-1">רקע מהספר</p>
          <p className="text-xs text-frost-white/55 leading-relaxed">{display}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1.5 text-[10px] text-dusty-aqua/50 hover:text-dusty-aqua/80 transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'הסתר' : 'קרא עוד'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const COMPONENTS = {
  'multiple-choice': MultipleChoice,
  'fill-blank': FillBlank,
  'order': SortOrder,
  'compare': Compare,
  'match': Match,
  'improve': Improve,
  'identify': Identify,
  'scenario': Scenario,
  'reading': Reading,
}

const TYPE_LABELS = {
  'multiple-choice': { label: 'בחירה מרובה', emoji: '🔘', difficulty: 1 },
  'fill-blank': { label: 'השלם את המשפט', emoji: '✏️', difficulty: 2 },
  'compare': { label: 'השוואה', emoji: '⚖️', difficulty: 2 },
  'improve': { label: 'שיפור', emoji: '💡', difficulty: 2 },
  'order': { label: 'סדר נכון', emoji: '📋', difficulty: 3 },
  'match': { label: 'התאמה', emoji: '🔗', difficulty: 3 },
  'identify': { label: 'זיהוי', emoji: '🔍', difficulty: 3 },
  'scenario': { label: 'תרחיש', emoji: '🎭', difficulty: 3 },
  'reading': { label: 'קטע קריאה', emoji: '📖', difficulty: 0 },
}

const DIFFICULTY_LABELS = {
  0: { text: 'קריאה', color: 'text-dusty-aqua/50', dots: 0 },
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
      {/* Exercise type badge + difficulty + help */}
      {typeInfo && (
        <div className="flex items-center gap-2 mb-3 animate-fade-in">
          <span className="text-sm">{typeInfo.emoji}</span>
          <span className="text-[10px] font-bold text-frost-white/30 tracking-wide">{typeInfo.label}</span>
          {diff && diff.dots > 0 && (
            <div className="flex items-center gap-1 mr-auto" aria-label={`רמת קושי: ${diff.text}`}>
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= diff.dots ? (
                  diff.dots === 1 ? 'bg-success/50' : diff.dots === 2 ? 'bg-warning/50' : 'bg-danger/50'
                ) : 'bg-white/10'}`} />
              ))}
            </div>
          )}
          <ExerciseHelp exerciseType={exercise.type} />
        </div>
      )}

      {/* Context passage — helps users who haven't read the book (skip for reading type) */}
      {exercise.context && exercise.type !== 'reading' && (
        <ContextPassage text={exercise.context} />
      )}

      {/* Hint button — only show when not answered yet and tokens available (skip for reading type) */}
      {!disabled && tokens != null && exercise.type !== 'reading' && (
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
