import { useState, useEffect } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { Brain, BookOpen, Gamepad2, Sparkles, ArrowLeft, ChevronLeft, Zap, Flame, Trophy } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'

const ALL_BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves]

const STEPS = [
  {
    id: 'welcome',
    icon: Brain,
    title: 'ברוך הבא ל-MindSet!',
    subtitle: 'הפלטפורמה שהופכת ספרים למשחקי למידה',
    description: 'למידה חוויתית של ספרי פיתוח אישי — 5 דקות ביום עם תרגילים, ניקוד ומאמן AI אישי.',
    visual: 'brain',
  },
  {
    id: 'how',
    icon: Gamepad2,
    title: 'איך זה עובד?',
    subtitle: '3 צעדים פשוטים',
    visual: 'demo',
  },
  {
    id: 'gamification',
    icon: Trophy,
    title: 'תשחק, תרוויח, תתקדם',
    subtitle: 'מערכת גיימיפיקציה שלמה',
    visual: 'gamification',
  },
  {
    id: 'pick',
    icon: BookOpen,
    title: 'בחר את הספר הראשון שלך',
    subtitle: 'הפרק הראשון חינם לגמרי!',
    visual: 'books',
  },
]

// Mini exercise demo - simulates a multiple choice question
function ExerciseDemo() {
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)

  const options = [
    { label: 'א', text: 'לחשוב על מה חסר לך', correct: false },
    { label: 'ב', text: 'לזהות ולפתח את החוזקות שלך', correct: true },
    { label: 'ג', text: 'לתקן את החולשות', correct: false },
  ]

  useEffect(() => {
    // Auto-demo: select correct answer after delay
    const t1 = setTimeout(() => setSelected(1), 1200)
    const t2 = setTimeout(() => setChecked(true), 2200)
    const t3 = setTimeout(() => {
      setSelected(null)
      setChecked(false)
    }, 4500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="glass-card p-4 max-w-xs w-full mx-auto animate-fade-in">
      <p className="text-xs text-frost-white/50 mb-1">מתוך: חוזקות</p>
      <p className="text-sm text-frost-white font-semibold mb-3">מה העיקרון המרכזי של גישת החוזקות?</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-sm ${
              checked && i === selected && opt.correct
                ? 'border-success/40 bg-success/10 text-success'
                : checked && i === selected && !opt.correct
                  ? 'border-danger/40 bg-danger/10 text-danger'
                  : i === selected
                    ? 'border-gold/40 bg-gold/5 text-frost-white'
                    : 'border-white/5 text-frost-white/60'
            }`}
          >
            <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
              i === selected ? 'bg-gold/20 text-gold' : 'bg-white/5 text-frost-white/30'
            }`}>
              {opt.label}
            </span>
            <span className="text-xs">{opt.text}</span>
          </div>
        ))}
      </div>
      {checked && (
        <div className="mt-2 flex items-center gap-1 text-success animate-fade-in">
          <Sparkles className="w-3 h-3" />
          <span className="text-[10px] font-bold">+10 XP נכון!</span>
        </div>
      )}
    </div>
  )
}

export default function Onboarding({ onComplete }) {
  const { updatePlayer } = usePlayer()
  const [step, setStep] = useState(0)
  const [selectedBook, setSelectedBook] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const goNext = () => {
    if (isLast) {
      if (!selectedBook) return
      updatePlayer(prev => ({ ...prev, onboardingComplete: true }))
      onComplete(selectedBook)
      return
    }
    setTransitioning(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setTransitioning(false)
    }, 250)
  }

  const goBack = () => {
    if (step === 0) return
    setTransitioning(true)
    setTimeout(() => {
      setStep(s => s - 1)
      setTransitioning(false)
    }, 250)
  }

  // Keyboard navigation: arrows + Enter
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') goBack()
      if (e.key === 'Enter') goNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, selectedBook])

  return (
    <div className="min-h-dvh flex flex-col bg-bg-base relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-deep-petrol/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gold/8 blur-[80px] pointer-events-none" />

      {/* Progress dots + step counter */}
      <div className="flex flex-col items-center pt-8 pb-4 relative z-10 gap-2">
        <div className="flex items-center gap-2" role="navigation" aria-label="שלבי הדרכה">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-gold' : i < step ? 'w-4 bg-gold/40' : 'w-4 bg-white/10'
              }`}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`שלב ${i + 1}: ${s.title}`}
            />
          ))}
        </div>
        <span className="text-[9px] text-frost-white/20">{step + 1} / {STEPS.length}</span>
      </div>

      {/* Content */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 relative z-10 ${
        transitioning ? 'animate-exercise-exit' : 'animate-exercise-enter'
      }`}>
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center mb-6 animate-bounce-in">
          <current.icon className="w-10 h-10 text-frost-white" />
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold text-frost-white text-center mb-2">
          {current.title}
        </h1>
        <p className="text-frost-white/50 text-sm text-center mb-8 max-w-sm">
          {current.subtitle}
        </p>

        {/* Step-specific content */}
        {current.visual === 'brain' && (
          <div className="max-w-sm w-full">
            <p className="text-frost-white/60 text-sm text-center leading-relaxed mb-6">
              {current.description}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { num: '7', label: 'סוגי תרגילים' },
                { num: '4', label: 'ספרים' },
                { num: '15\'', label: 'לכל ספר' },
              ].map(s => (
                <div key={s.label} className="glass-card p-3 text-center">
                  <p className="font-display text-xl font-bold text-gold">{s.num}</p>
                  <p className="text-[10px] text-frost-white/40 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {current.visual === 'demo' && (
          <div className="max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 mb-2">
              {[
                { emoji: '📖', text: 'בחר ספר', delay: '0s' },
                { emoji: '🎮', text: 'שחק תרגילים', delay: '0.1s' },
                { emoji: '🧠', text: 'צבור XP', delay: '0.2s' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex-1 glass-card p-2.5 text-center animate-fade-in"
                  style={{ animationDelay: item.delay }}
                >
                  <span className="text-lg block">{item.emoji}</span>
                  <p className="text-[10px] text-frost-white/60 mt-1">{item.text}</p>
                </div>
              ))}
            </div>
            {/* Live exercise demo */}
            <ExerciseDemo />
          </div>
        )}

        {current.visual === 'gamification' && (
          <div className="max-w-sm w-full grid grid-cols-2 gap-2.5">
            {[
              { icon: '🔥', title: 'רצפים', desc: 'למד כל יום', delay: '0s' },
              { icon: '⚡', title: 'XP בונוסים', desc: 'ענה מהר', delay: '0.05s' },
              { icon: '🏆', title: 'הישגים', desc: '28 הישגים', delay: '0.1s' },
              { icon: '👑', title: 'ליגות', desc: 'התחרה בטבלה', delay: '0.15s' },
              { icon: '💡', title: 'רמזים AI', desc: 'מאמן אישי', delay: '0.2s' },
              { icon: '📊', title: 'סטטיסטיקות', desc: 'עקוב אחרי ההתקדמות', delay: '0.25s' },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card p-3 flex items-center gap-2.5 animate-fade-in"
                style={{ animationDelay: item.delay }}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-frost-white">{item.title}</p>
                  <p className="text-[10px] text-frost-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {current.visual === 'books' && (
          <div className="max-w-sm w-full space-y-3">
            {ALL_BOOKS.map((book, i) => (
              <button
                key={book.slug}
                onClick={() => setSelectedBook(book.slug)}
                className={`w-full glass-card p-4 flex items-center gap-3 transition-all animate-fade-in ${
                  selectedBook === book.slug
                    ? 'border-gold/40 bg-gold/5'
                    : 'hover:border-white/20'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center text-xl shrink-0">
                  {book.icon}
                </div>
                <div className="flex-1 text-right min-w-0">
                  <h3 className="font-display text-sm font-bold text-frost-white truncate">{book.title}</h3>
                  <p className="text-[11px] text-frost-white/40">{book.author}</p>
                </div>
                {selectedBook === book.slug && (
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-bg-base" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-8 pt-4 relative z-10">
        <div className="max-w-sm mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={goBack}
              className="p-3 rounded-xl border border-white/10 text-frost-white/50 hover:text-frost-white hover:border-white/20 transition-all"
              aria-label="חזור"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          )}
          <button
            onClick={goNext}
            disabled={isLast && !selectedBook}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base hover:brightness-110 active:scale-[0.98]"
          >
            {isLast ? 'התחל ללמוד!' : 'המשך'}
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
        {step === 0 && (
          <button
            onClick={() => {
              updatePlayer(prev => ({ ...prev, onboardingComplete: true }))
              onComplete(null)
            }}
            className="block mx-auto mt-3 text-xs text-frost-white/30 hover:text-frost-white/50 transition-colors"
          >
            דלג
          </button>
        )}
      </div>
    </div>
  )
}
