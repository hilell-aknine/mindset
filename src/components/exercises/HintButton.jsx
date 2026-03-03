import { useState } from 'react'
import { Lightbulb, Zap } from 'lucide-react'

/**
 * Hint button — spends 1 AI token to reveal a contextual hint
 */
export default function HintButton({ exercise, tokens, onUseToken, disabled }) {
  const [hint, setHint] = useState(null)
  const [used, setUsed] = useState(false)

  if (disabled || used) {
    return hint ? (
      <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-gold/5 border border-gold/15 mb-4 animate-elastic-in" role="alert">
        <Lightbulb className="w-4 h-4 text-gold shrink-0 mt-0.5 animate-heartbeat" />
        <p className="text-xs text-gold/80 leading-relaxed">{hint}</p>
      </div>
    ) : null
  }

  const generateHint = () => {
    if (tokens <= 0) return
    onUseToken()
    setUsed(true)

    const h = getHintForExercise(exercise)
    setHint(h)
  }

  return (
    <button
      onClick={generateHint}
      disabled={tokens <= 0}
      aria-label={tokens > 0 ? `קבל רמז — עולה 1 אסימון (נותרו ${tokens})` : 'אין אסימונים לרמז'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gold/60 hover:text-gold hover:bg-gold/5 border border-transparent hover:border-gold/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-4 active:scale-95"
    >
      <Lightbulb className="w-3.5 h-3.5" />
      <span>רמז</span>
      <span className="flex items-center gap-0.5 text-frost-white/30">
        (<Zap className="w-2.5 h-2.5" />1)
      </span>
    </button>
  )
}

function getHintForExercise(exercise) {
  switch (exercise.type) {
    case 'multiple-choice': {
      // Eliminate one wrong answer
      const wrongOptions = exercise.options
        .map((opt, i) => ({ opt, i }))
        .filter(({ i }) => i !== exercise.correct)
      if (wrongOptions.length > 0) {
        const eliminated = wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
        return `אפשר להוציא את האפשרות: "${eliminated.opt}"`
      }
      return 'נסה לחשוב על ההקשר מהספר'
    }

    case 'fill-blank': {
      const correctWord = exercise.options[exercise.correct]
      if (correctWord) {
        return `המילה מתחילה ב-"${correctWord.slice(0, Math.ceil(correctWord.length / 3))}..."`
      }
      return 'קרא שוב את המשפט ונסה להשלים לפי ההקשר'
    }

    case 'order': {
      if (exercise.correctOrder && exercise.correctOrder.length > 0) {
        const firstItem = exercise.items[exercise.correctOrder[0]]
        return `הפריט הראשון ברשימה הוא: "${firstItem}"`
      }
      return 'חשוב על הסדר הכרונולוגי או הלוגי'
    }

    case 'compare':
    case 'improve': {
      const correctIdx = typeof exercise.correct === 'string'
        ? (exercise.correct === 'A' ? 0 : 1)
        : exercise.correct
      const options = exercise.options || [exercise.optionA, exercise.optionB].filter(Boolean)
      if (options[correctIdx]) {
        const correctText = typeof options[correctIdx] === 'object' ? options[correctIdx].text : options[correctIdx]
        return `שים לב לנוסח ש${exercise.type === 'improve' ? 'מנוסח בצורה חיובית ומעצימה' : 'מתאר את העיקרון בצורה מדויקת יותר'}`
      }
      return 'השווה בין שתי האפשרויות בקפידה'
    }

    case 'match':
      if (exercise.pairs && exercise.pairs.length > 0) {
        const firstPair = exercise.pairs[0]
        return `"${firstPair.left}" מתאים ל-"${firstPair.right}"`
      }
      return 'נסה למצוא את הקשר בין המושגים'

    case 'identify': {
      const text = exercise.text || ''
      const [cs, ce] = exercise.correctRange || [exercise.correctStart, exercise.correctEnd]
      if (cs != null && ce != null) {
        const target = text.slice(cs, ce)
        const firstWords = target.split(' ').slice(0, 2).join(' ')
        return `חפש את הביטוי שמתחיל ב-"${firstWords}..."`
      }
      return 'קרא את הטקסט בעיון וחפש את הביטוי המרכזי'
    }

    default:
      return 'חשוב על העיקרון שלמדת בשיעור הזה'
  }
}
