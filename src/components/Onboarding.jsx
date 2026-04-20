import { useState, useEffect } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { Brain, BookOpen, Gamepad2, Sparkles, ArrowLeft, ChevronLeft, Zap, Flame, Trophy } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'
import mindsetBook from '../data/books/mindset-book.json'
import indistractable from '../data/books/indistractable.json'
import grit from '../data/books/grit.json'
import powerOfNow from '../data/books/power-of-now.json'
import sevenHabits from '../data/books/seven-habits.json'
import thinkingFastSlow from '../data/books/thinking-fast-slow.json'
import psychologyOfMoney from '../data/books/psychology-of-money.json'
import millionaireNextDoor from '../data/books/millionaire-next-door.json'
import thinkAndGrowRich from '../data/books/think-and-grow-rich.json'
import blueOceanStrategy from '../data/books/blue-ocean-strategy.json'
import threeSecondRule from '../data/books/three-second-rule.json'

const ALL_BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves, mindsetBook, indistractable, grit, powerOfNow, sevenHabits, thinkingFastSlow, psychologyOfMoney, millionaireNextDoor, thinkAndGrowRich, blueOceanStrategy, threeSecondRule]

const BOOK_COVERS = {
  'strengths-finder': '/backgrounds/raw-diamond.png',
  'atomic-habits': '/backgrounds/gold-dominos.png',
  'happy-chemicals': '/backgrounds/happy-molecule.png',
  'next-five-moves': '/backgrounds/chess-knight.png',
  'mindset-book': '/backgrounds/brain-lightbulb.png',
  'indistractable': '/backgrounds/focus-shield.png',
}

const GOAL_OPTIONS = [
  { id: 'productivity', label: 'פרודוקטיביות והרגלים', emoji: '⚡', books: ['atomic-habits', 'indistractable', 'three-second-rule'] },
  { id: 'thinking', label: 'חשיבה וקבלת החלטות', emoji: '🧠', books: ['thinking-fast-slow', 'mindset-book', 'think-and-grow-rich'] },
  { id: 'money', label: 'כסף ופיננסים', emoji: '💰', books: ['psychology-of-money', 'millionaire-next-door'] },
  { id: 'resilience', label: 'מערכות יחסים וחוסן נפשי', emoji: '💪', books: ['happy-chemicals', 'power-of-now', 'grit'] },
  { id: 'all', label: 'לגלות — תראה לי הכל', emoji: '🌟', books: null },
]

const TIME_OPTIONS = [3, 5, 10, 15]

const STEPS = [
  { id: 'goal', title: 'מה הכי חשוב לך עכשיו?', subtitle: 'נתאים לך ספרים לפי התחום שמעניין אותך' },
  { id: 'time', title: 'כמה דקות ביום תרצה ללמוד?', subtitle: 'עקביות > אורך. אפשר לשנות בכל רגע.' },
  { id: 'mechanics', title: 'ככה זה עובד', subtitle: 'הנה מה שתפגוש בכל שיעור' },
  { id: 'pick', title: 'בחר את הספר הראשון שלך', subtitle: 'הפרק הראשון חינם לגמרי!' },
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
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [selectedTime, setSelectedTime] = useState(5)
  const [selectedBook, setSelectedBook] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Filter books based on goal selection
  const goalOption = GOAL_OPTIONS.find(g => g.id === selectedGoal)
  const recommendedBooks = goalOption?.books
    ? ALL_BOOKS.filter(b => goalOption.books.includes(b.slug))
    : ALL_BOOKS

  const canProceed = () => {
    if (current.id === 'goal') return !!selectedGoal
    if (current.id === 'pick') return !!selectedBook
    return true
  }

  const goNext = () => {
    if (!canProceed()) return
    if (isLast) {
      updatePlayer(prev => ({ ...prev, onboardingComplete: true, dailyGoalMinutes: selectedTime }))
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

  const handleSkip = () => {
    updatePlayer(prev => ({ ...prev, onboardingComplete: true }))
    onComplete(null)
  }

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter') goNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, selectedGoal, selectedTime, selectedBook])

  return (
    <div className="min-h-dvh flex flex-col bg-bg-base relative">
      {/* Decorative orbs — clipped to their own layer so the page can still scroll */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-deep-petrol/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gold/8 blur-[80px]" />
      </div>

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
        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-frost-white text-center mb-2">
          {current.title}
        </h1>
        <p className="text-frost-white/50 text-sm text-center mb-8 max-w-sm">
          {current.subtitle}
        </p>

        {/* Step: Goal */}
        {current.id === 'goal' && (
          <div className="max-w-sm w-full space-y-2.5">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedGoal(opt.id)}
                className={`w-full glass-card p-4 flex items-center gap-3 transition-all ${
                  selectedGoal === opt.id ? 'border-gold/40 bg-gold/5' : 'hover:border-white/20'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm text-frost-white font-medium">{opt.label}</span>
                {selectedGoal === opt.id && (
                  <Sparkles className="w-4 h-4 text-gold mr-auto" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step: Time */}
        {current.id === 'time' && (
          <div className="max-w-sm w-full">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`glass-card p-4 text-center transition-all ${
                    selectedTime === t ? 'border-gold/40 bg-gold/5' : 'hover:border-white/20'
                  }`}
                >
                  <span className="font-display text-2xl font-bold text-frost-white block">{t}</span>
                  <span className="text-[10px] text-frost-white/40">דקות</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Mechanics */}
        {current.id === 'mechanics' && (
          <div className="max-w-sm w-full space-y-3">
            {[
              { icon: '⚡', title: 'XP', desc: 'ניקוד שאתה צובר על למידה פעילה. עוזר לך לעלות רמות וליגות.' },
              { icon: '❤️', title: 'לבבות', desc: '5 הזדמנויות לטעות (כמו במשחק). מתחדשים כל 20 דקות.' },
              { icon: '🔥', title: 'רצף', desc: 'ימים ברצף שלמדת. המפתח לזיכרון לטווח ארוך.' },
            ].map((item, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-frost-white">{item.title}</p>
                  <p className="text-xs text-frost-white/50 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-frost-white/30 mt-4">בכל שיעור תקרא קטע קצר, ואז תתרגל. אל תדאג לטעויות — הן חלק מהלמידה.</p>
          </div>
        )}

        {/* Step: Pick book */}
        {current.id === 'pick' && (
          <div className="max-w-sm w-full space-y-3 max-h-[50vh] overflow-y-auto">
            {recommendedBooks.map((book, i) => (
              <button
                key={book.slug}
                onClick={() => setSelectedBook(book.slug)}
                className={`w-full glass-card p-4 flex items-center gap-3 transition-all animate-fade-in ${
                  selectedBook === book.slug ? 'border-gold/40 bg-gold/5' : 'hover:border-white/20'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {BOOK_COVERS[book.slug] ? (
                  <img src={BOOK_COVERS[book.slug]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center text-xl shrink-0">
                    {book.icon}
                  </div>
                )}
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
      <div className="px-6 pt-4 relative z-10" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
        <div className="max-w-sm mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={goBack}
              className="p-3.5 rounded-2xl border border-white/10 text-frost-white/50 hover:text-frost-white hover:border-white/20 transition-all min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="חזור"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base hover:brightness-110 active:scale-[0.98] min-h-[52px]"
          >
            {isLast ? 'בוא נתחיל!' : 'המשך'}
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
        {step === 0 && (
          <button onClick={handleSkip} className="block mx-auto mt-3 text-xs text-frost-white/30 hover:text-frost-white/50 transition-colors">
            דלג
          </button>
        )}
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
