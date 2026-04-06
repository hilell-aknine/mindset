import { useState, useEffect } from 'react'
import { BookOpen, ChevronDown, Lightbulb, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

function ContextPassage({ text, forceExpanded = false }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 120
  const isExpanded = expanded || forceExpanded
  const display = !isLong || isExpanded ? text : text.slice(0, 120) + '...'

  // Force expand when forceExpanded becomes true
  useEffect(() => {
    if (forceExpanded) setExpanded(true)
  }, [forceExpanded])

  return (
    <div className="mb-4 p-3.5 rounded-xl bg-deep-petrol/30 border border-white/5 animate-fade-in">
      <div className="flex items-start gap-2">
        <BookOpen className="w-3.5 h-3.5 text-dusty-aqua/60 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-dusty-aqua/60 mb-1">רקע מהספר</p>
          <p className="text-xs text-frost-white/55 leading-relaxed">{display}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!isExpanded)}
              className="flex items-center gap-1 mt-1.5 text-[10px] text-dusty-aqua/50 hover:text-dusty-aqua/80 transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpanded ? 'הסתר' : 'קרא עוד'}
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

export default function ExerciseRouter({ exercise, onAnswer, disabled, tokens, onUseToken, wrongCount = 0 }) {
  const navigate = useNavigate()
  const Component = COMPONENTS[exercise.type]
  const typeInfo = TYPE_LABELS[exercise.type]

  if (!Component) {
    return (
      <div className="glass-card p-6 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div>
          <p className="text-base font-bold text-frost-white mb-1">לא ניתן לטעון את התרגיל</p>
          <p className="text-xs text-frost-white/40">נסה לחזור ולנסות שוב</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl bg-white/10 text-frost-white/70 text-sm hover:bg-white/15 active:scale-[0.98] transition-all min-h-[44px]"
        >
          חזור לספר
        </button>
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

      {/* Hint banner — shown after 2+ wrong answers */}
      {wrongCount >= 2 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/20 mb-3 animate-fade-in">
          <Lightbulb className="w-4 h-4 text-warning shrink-0" />
          <p className="text-xs text-warning/80">קרא שוב את ההקשר — התשובה מסתתרת שם</p>
        </div>
      )}

      {/* Context passage — helps users who haven't read the book (skip for reading type) */}
      {exercise.context && exercise.type !== 'reading' && (
        <ContextPassage text={exercise.context} forceExpanded={wrongCount >= 2} />
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
