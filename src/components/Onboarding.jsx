import { useState } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { Brain, BookOpen, Gamepad2, Sparkles, ArrowLeft, ChevronLeft } from 'lucide-react'
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
    description: 'תלמד ספרי פיתוח אישי בצורה אינטראקטיבית — עם תרגילים, ניקוד ומאמן AI אישי.',
    visual: 'brain',
  },
  {
    id: 'how',
    icon: Gamepad2,
    title: 'איך זה עובד?',
    subtitle: '3 צעדים פשוטים',
    items: [
      { emoji: '📖', text: 'בחר ספר מהספרייה' },
      { emoji: '🎮', text: 'שחק שיעורים עם 7 סוגי תרגילים' },
      { emoji: '🧠', text: 'צבור XP, עלה רמות ותקבע ידע' },
    ],
    visual: 'steps',
  },
  {
    id: 'pick',
    icon: BookOpen,
    title: 'בחר את הספר הראשון שלך',
    subtitle: 'הפרק הראשון חינם לגמרי!',
    visual: 'books',
  },
]

export default function Onboarding({ onComplete }) {
  const { updatePlayer } = usePlayer()
  const [step, setStep] = useState(0)
  const [selectedBook, setSelectedBook] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const goNext = () => {
    if (isLast) {
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

  return (
    <div className="min-h-dvh flex flex-col bg-bg-base relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-deep-petrol/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gold/8 blur-[80px] pointer-events-none" />

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-4 relative z-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-gold' : i < step ? 'w-4 bg-gold/40' : 'w-4 bg-white/10'
            }`}
          />
        ))}
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

        {current.visual === 'steps' && (
          <div className="max-w-sm w-full space-y-3">
            {current.items.map((item, i) => (
              <div
                key={i}
                className="glass-card p-4 flex items-center gap-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-sm text-frost-white/80">{item.text}</p>
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
