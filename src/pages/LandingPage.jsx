import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import {
  Brain, BookOpen, Gamepad2, Sparkles, Flame, Heart, Zap,
  RotateCcw, Check, X, ChevronDown, Mail, User, Loader2,
  Star, Trophy, Target, MessageCircle, HelpCircle, Clock, Users,
  Play, Award, Shield, TrendingUp
} from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'

const BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves]

const bookImages = {
  'atomic-habits': '/books/atomic-habits.png',
  'strengths-finder': '/books/strengths-finder.png',
  'happy-chemicals': '/books/happy-chemicals.png',
  'next-five-moves': '/books/next-five-moves.png',
}

const EXERCISE_TYPES = [
  { name: 'בחירה מרובה', icon: '🎯' },
  { name: 'השלמת חסר', icon: '✏️' },
  { name: 'סידור', icon: '🔢' },
  { name: 'השוואה', icon: '⚖️' },
  { name: 'התאמה', icon: '🔗' },
  { name: 'שיפור', icon: '💡' },
  { name: 'זיהוי', icon: '🔍' },
]

// Rotating words for hero
const HERO_WORDS = ['לשחק', 'להבין', 'לזכור', 'לחוות']

// Animated counter hook
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const animate = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function CounterStat({ target, label, icon: Icon }) {
  const { count, ref } = useCountUp(target)
  return (
    <div ref={ref} className="flex flex-col items-center gap-0.5 sm:gap-1">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold mb-0.5 sm:mb-1" />
      <span className="font-display text-xl sm:text-3xl font-bold text-frost-white">{count}</span>
      <span className="text-[11px] sm:text-xs text-frost-white/40">{label}</span>
    </div>
  )
}

// Rotating hero word
function useRotatingWord(words, interval = 2800) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % words.length)
        setVisible(true)
      }, 400)
    }, interval)
    return () => clearInterval(timer)
  }, [words, interval])
  return { word: words[index], visible }
}

// Simulated live users
function useLiveUsers() {
  const [count, setCount] = useState(() => 12 + Math.floor(Math.random() * 8))
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(8, Math.min(35, c + delta))
      })
    }, 5000 + Math.random() * 3000)
    return () => clearInterval(timer)
  }, [])
  return count
}

// Interactive exercise demo
function InteractiveDemo() {
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const correctAnswer = 0 // "שיפור של פי 37"

  const handleSelect = (i) => {
    if (showFeedback) return
    setSelected(i)
    setTimeout(() => setShowFeedback(true), 500)
  }

  const reset = () => {
    setSelected(null)
    setShowFeedback(false)
  }

  const options = [
    'שיפור של פי 37',
    'שיפור של 365%',
    'אין הבדל משמעותי',
  ]

  return (
    <div className="max-w-md mx-auto">
      <div className="glass-card p-5 sm:p-6 border-gold/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gold flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            נסה בעצמך — בחירה מרובה
          </p>
          {showFeedback && (
            <button onClick={reset} className="text-[10px] text-frost-white/30 hover:text-frost-white/60 transition-colors flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              נסה שוב
            </button>
          )}
        </div>
        <p className="text-sm text-frost-white leading-relaxed mb-4">
          מה קורה כש-1% שיפור מצטבר לאורך שנה שלמה?
        </p>

        <div className="space-y-2">
          {options.map((opt, i) => {
            let classes = 'border-white/8 text-frost-white/60 hover:border-white/20 cursor-pointer'
            if (selected === i && !showFeedback) {
              classes = 'border-gold/40 bg-gold/10 text-gold'
            }
            if (showFeedback && i === correctAnswer) {
              classes = 'border-success/40 bg-success/10 text-success'
            }
            if (showFeedback && selected === i && i !== correctAnswer) {
              classes = 'border-danger/40 bg-danger/10 text-danger animate-shake'
            }
            if (showFeedback && selected !== i && i !== correctAnswer) {
              classes = 'border-white/5 text-frost-white/20'
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full p-3 rounded-xl border text-sm text-right flex items-center justify-between transition-all duration-300 ${classes}`}
              >
                <span>{opt}</span>
                {showFeedback && i === correctAnswer && <Check className="w-4 h-4 shrink-0" />}
                {showFeedback && selected === i && i !== correctAnswer && <X className="w-4 h-4 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        <div className={`transition-all duration-300 overflow-hidden ${showFeedback ? 'max-h-24 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
          {selected === correctAnswer ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/20">
              <Check className="w-4 h-4 text-success shrink-0" />
              <p className="text-xs text-frost-white/50">מעולה! 1% ביום = פי 37 בשנה. זה כוח הריבית דריבית.</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/5 border border-danger/20">
              <X className="w-4 h-4 text-danger shrink-0" />
              <p className="text-xs text-frost-white/50">לא בדיוק... התשובה היא פי 37. 1.01^365 = 37.78</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Star rating display
function StarRating({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3 h-3 text-gold fill-gold" />
      ))}
    </div>
  )
}

function PhoneMockup() {
  const [step, setStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  // Auto-play exercise simulation
  useEffect(() => {
    const steps = [
      { delay: 1500 }, // Show question
      { delay: 2000 }, // Highlight wrong option
      { delay: 1200 }, // Clear and highlight correct
      { delay: 2500 }, // Show feedback
      { delay: 3000 }, // Reset
    ]

    let timeout
    const advance = () => {
      setStep(s => {
        const next = (s + 1) % steps.length
        if (next === 0) setAnimKey(k => k + 1) // Reset animation cycle
        timeout = setTimeout(advance, steps[next].delay)
        return next
      })
    }
    timeout = setTimeout(advance, steps[0].delay)
    return () => clearTimeout(timeout)
  }, [animKey])

  const options = [
    { text: 'שיפור של פי 37', correct: true },
    { text: 'שיפור של 365%', correct: false },
    { text: 'אין הבדל משמעותי', correct: false },
  ]

  const progressWidth = step >= 3 ? '80%' : '60%'

  return (
    <div className="relative w-[280px] sm:w-[300px]">
      {/* Phone frame */}
      <div className="rounded-[32px] border-2 border-white/10 bg-bg-base p-3 shadow-2xl shadow-black/40">
        {/* Screen */}
        <div className="rounded-[24px] bg-bg-card overflow-hidden">
          {/* Status bar */}
          <div className="px-4 py-2 flex items-center justify-between bg-bg-base/50">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-dusty-aqua" />
              <span className="text-[10px] font-bold text-frost-white/70">MindSet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-danger">
                <Heart className="w-3 h-3 fill-current" />
                <span className="text-[9px] font-bold">{step === 1 ? '4' : '5'}</span>
              </div>
              <div className="flex items-center gap-0.5 text-gold">
                <Zap className="w-3 h-3 fill-current" />
                <span className="text-[9px] font-bold">3</span>
              </div>
            </div>
          </div>

          {/* Mock exercise */}
          <div className="p-4 space-y-3">
            <div className="text-center">
              <p className="text-[10px] text-frost-white/40 mb-1">הרגלים אטומים — שיעור 1</p>
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-700"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
            <p className="text-xs text-frost-white leading-relaxed">
              מה קורה כש-1% שיפור מצטבר לאורך שנה שלמה?
            </p>

            {/* Options with animation */}
            {options.map((opt, i) => {
              let classes = 'border-white/8 text-frost-white/50'
              if (step === 1 && i === 1) classes = 'border-danger/40 bg-danger/10 text-danger animate-shake'
              if (step >= 2 && opt.correct) classes = 'border-success/40 bg-success/10 text-success'
              if (step >= 2 && i === 1) classes = 'border-white/8 text-frost-white/30'

              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between transition-all duration-300 ${classes}`}
                >
                  <span>{opt.text}</span>
                  {step >= 2 && opt.correct && <Check className="w-3.5 h-3.5" />}
                </div>
              )
            })}

            {/* Feedback — appears at step 3+ */}
            <div className={`transition-all duration-300 overflow-hidden ${step >= 3 ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-2.5 rounded-xl bg-success/5 border border-success/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Check className="w-3 h-3 text-success" />
                  <span className="text-[10px] font-bold text-success">נכון! +10 XP</span>
                  <span className="text-[9px] text-warning font-bold mr-auto">🔥 x3</span>
                </div>
                <p className="text-[9px] text-frost-white/40 leading-relaxed">
                  כוח הריבית דריבית — 1% ביום = פי 37 בשנה
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Glow behind phone */}
      <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-deep-petrol/40 to-gold/20 blur-[40px]" />
    </div>
  )
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-right"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-frost-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-gold shrink-0" />
          {question}
        </span>
        <ChevronDown className={`w-4 h-4 text-frost-white/30 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-frost-white/50 leading-relaxed pr-10">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, continueAsGuest } = useAuth()
  const toast = useToast()
  const [authMode, setAuthMode] = useState(null) // null | 'main' | 'email-login' | 'email-register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showMobileCTA, setShowMobileCTA] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const ctaRef = useRef(null)
  const heroRef = useRef(null)
  const { word: heroWord, visible: heroWordVisible } = useRotatingWord(HERO_WORDS)
  const liveUsers = useLiveUsers()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      // Scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0)
      // Show mobile CTA after scrolling past hero
      const heroBottom = heroRef.current?.getBoundingClientRect()?.bottom ?? 0
      const ctaTop = ctaRef.current?.getBoundingClientRect()?.top ?? Infinity
      setShowMobileCTA(heroBottom < -100 && ctaTop > window.innerHeight + 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const openAuth = () => setAuthMode('main')
  const closeAuth = () => { setAuthMode(null); setEmail(''); setPassword('') }

  const handleGoogle = async () => {
    try {
      setLoading(true)
      await loginWithGoogle()
    } catch {
      toast.error('שגיאה בהתחברות עם Google')
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('נא למלא את כל השדות')
    try {
      setLoading(true)
      if (authMode === 'email-login') {
        await loginWithEmail(email, password)
      } else {
        await registerWithEmail(email, password)
        toast.success('נרשמת בהצלחה! בדוק את המייל לאישור')
      }
    } catch (err) {
      toast.error(err.message || 'שגיאה בהתחברות')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => continueAsGuest()

  return (
    <div className="min-h-dvh bg-bg-base text-frost-white overflow-x-hidden">

      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 safe-top ${scrolled ? 'bg-bg-base/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20' : ''}`}>
        {/* Scroll progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-transparent">
          <div
            className="h-full bg-gradient-to-l from-gold to-dusty-aqua transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-frost-white" />
            </div>
            <span className="font-display font-bold text-base sm:text-lg text-frost-white">MindSet</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live users indicator */}
            <div className={`items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-success/5 border border-success/20 transition-opacity duration-300 hidden sm:flex ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success/80 font-medium">{liveUsers} לומדים עכשיו</span>
            </div>
            <button
              onClick={openAuth}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors no-touch-delay"
            >
              התחבר
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative pt-20 sm:pt-36 pb-10 sm:pb-24 px-4">
        {/* Background video on desktop, static image on mobile */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none hidden sm:block"
          aria-hidden="true"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <img
          src="/backgrounds/hero-mobile-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none sm:hidden"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/40 via-transparent to-bg-base pointer-events-none" />

        {/* Background orbs - smaller on mobile */}
        <div className="absolute top-10 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-deep-petrol/25 blur-[80px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-gold/8 blur-[60px] sm:blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text */}
            <div className="text-center lg:text-right animate-fade-in">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] sm:text-xs font-medium mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                פרק ראשון חינם — בלי כרטיס אשראי
              </div>
              <h1 className="font-display text-[28px] sm:text-5xl lg:text-6xl font-black leading-[1.2] sm:leading-tight mb-3 sm:mb-5">
                מה אם יכולת{' '}
                <span
                  className={`inline-block text-transparent bg-clip-text bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-400 ${heroWordVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                  style={{ minWidth: '2.5em' }}
                >
                  {heroWord}
                </span>{' '}
                ספר
                <br />
                במקום לקרוא אותו?
              </h1>
              <p className="text-frost-white/60 text-sm sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-5 sm:mb-8">
                MindSet הופך ספרי פיתוח אישי לשיעורים אינטראקטיביים עם תרגילים, ניקוד ומאמן AI —
                כמו Duolingo, רק לספרים.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 justify-center lg:justify-start">
                <button
                  onClick={openAuth}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base font-bold text-sm sm:text-base hover:brightness-110 transition-all animate-pulse-glow no-touch-delay tap-bounce"
                >
                  התחל ללמוד בחינם
                </button>
                <button
                  onClick={scrollToCTA}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl border border-white/10 text-frost-white/70 text-sm hover:border-white/20 hover:text-frost-white transition-all flex items-center justify-center gap-2 no-touch-delay tap-bounce"
                >
                  <ChevronDown className="w-4 h-4" />
                  גלה עוד
                </button>
              </div>
              {/* Live users - mobile */}
              <div className="flex items-center justify-center gap-1.5 mt-4 sm:hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] text-frost-white/40">{liveUsers} לומדים עכשיו</span>
              </div>
            </div>

            {/* Animated Phone mockup - hidden on small mobile, shown on tablet+ */}
            <div className="animate-fade-in justify-center hidden md:flex" style={{ animationDelay: '0.2s' }}>
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social proof strip ─── */}
      <RevealSection>
        <div className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 py-5 sm:py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 text-center">
            <CounterStat target={4} label="ספרים זמינים" icon={BookOpen} />
            <CounterStat target={7} label="סוגי תרגילים" icon={Target} />
            <CounterStat target={360} label="תרגילים" icon={Flame} />
            <CounterStat target={5} label="דקות ביום" icon={Clock} />
          </div>
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 pb-4 sm:pb-5 flex-wrap px-4">
            <span className="flex items-center gap-1.5 text-[11px] sm:text-[10px] text-frost-white/30">
              <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-success/50" /> בלי כרטיס אשראי
            </span>
            <span className="flex items-center gap-1.5 text-[11px] sm:text-[10px] text-frost-white/30">
              <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-success/50" /> פרק ראשון חינם
            </span>
            <span className="flex items-center gap-1.5 text-[11px] sm:text-[10px] text-frost-white/30">
              <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-success/50" /> עובד על כל מכשיר
            </span>
          </div>
        </div>
      </RevealSection>

      {/* ─── How It Works ─── */}
      <section className="py-12 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">איך זה עובד?</h2>
            <p className="text-frost-white/50 text-sm sm:text-base">שלושה צעדים לידע אמיתי</p>
          </RevealSection>

          {/* Steps - vertical compact on mobile, 3-col on desktop */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                step: 1,
                img: '/steps/step-choose.png',
                title: 'בחר ספר',
                desc: 'גלה ספרי פיתוח אישי מובילים — כל ספר מחולק לפרקים ושיעורים קצרים',
              },
              {
                step: 2,
                img: '/steps/step-play.png',
                title: 'שחק שיעורים',
                desc: '7 סוגי תרגילים אינטראקטיביים שמפעילים את המוח — לא קריאה פסיבית',
              },
              {
                step: 3,
                img: '/steps/step-retain.png',
                title: 'תקבע ידע',
                desc: 'חזרה מרווחת, מאמן AI אישי ומערכת ניקוד — הידע נשאר לטווח ארוך',
              },
            ].map(({ step, img, title, desc }, i) => (
              <RevealSection key={step} delay={i * 120}>
                {/* Mobile: horizontal card layout */}
                <div className="glass-card p-4 sm:p-6 sm:text-center relative group">
                  {/* Step number */}
                  <div className="absolute -top-3 sm:-top-4 right-4 sm:right-1/2 sm:translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center text-bg-base font-bold text-xs sm:text-sm shadow-lg shadow-gold/20">
                    {step}
                  </div>
                  {/* Mobile: flex row / Desktop: stacked */}
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                    <img
                      src={img}
                      alt={title}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover shrink-0 sm:mt-3 sm:mb-4 group-hover:scale-110 transition-transform"
                    />
                    <div className="flex-1 sm:text-center">
                      <h3 className="font-display text-base sm:text-xl font-bold mb-0.5 sm:mb-2">{title}</h3>
                      <p className="text-xs sm:text-sm text-frost-white/50 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Book Showcase ─── */}
      <section className="py-12 sm:py-24 px-4 relative overflow-hidden">
        {/* Background video - hidden on mobile to save battery */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none hidden sm:block"
          aria-hidden="true"
        >
          <source src="/books-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-transparent to-bg-base pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-deep-petrol/15 blur-[60px] sm:blur-[100px] pointer-events-none -translate-y-1/2" />

        <div className="max-w-5xl mx-auto relative z-10">
          <RevealSection className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">הספרים שלנו</h2>
            <p className="text-frost-white/50 text-sm sm:text-base">4 ספרים. 5 דקות ביום. ידע שנשאר.</p>
          </RevealSection>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-6">
            {BOOKS.map((book, i) => {
              const totalLessons = book.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
              const totalExercises = book.chapters.reduce((acc, ch) => acc + ch.lessons.reduce((a2, l) => a2 + (l.exercises?.length || 0), 0), 0)
              return (
                <RevealSection key={book.slug} delay={i * 100}>
                  <div className="glass-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4 group hover:border-gold/20 transition-all no-touch-delay tap-bounce relative overflow-hidden">
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/[0.03] group-hover:to-transparent transition-all pointer-events-none" />
                    {bookImages[book.slug] ? (
                      <img
                        src={bookImages[book.slug]}
                        alt={book.title}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-black/30"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-105 transition-transform">
                        {book.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="font-display text-[15px] sm:text-lg font-bold text-frost-white leading-tight">{book.title}</h3>
                      <p className="text-[11px] sm:text-xs text-frost-white/40 mt-0.5">{book.author}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-frost-white/30">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {book.chapters.length} פרקים
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {totalExercises} תרגילים
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-medium">
                          פרק ראשון חינם
                        </span>
                      </div>
                    </div>
                    {/* Arrow indicator */}
                    <ChevronDown className="w-4 h-4 text-frost-white/15 -rotate-90 shrink-0 mt-1 group-hover:text-gold/40 transition-colors" />
                  </div>
                </RevealSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Exercise Types Preview ─── */}
      <section className="py-12 sm:py-24 px-4 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
        <img
          src="/backgrounds/exercises-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/60 via-transparent to-bg-base/60 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <RevealSection className="text-center mb-8 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
              לא קריאה פסיבית —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-gold to-dusty-aqua">
                למידה פעילה
              </span>
            </h2>
            <p className="text-frost-white/50 text-xs sm:text-base">7 סוגי תרגילים שמפעילים את המוח ומבטיחים שהידע נקלט</p>
          </RevealSection>

          <RevealSection delay={100}>
            {/* Horizontal scroll on mobile, wrap on desktop */}
            <div className="flex sm:flex-wrap items-center sm:justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto mobile-scroll-x pb-2 sm:pb-0 px-1">
              {EXERCISE_TYPES.map(({ name, icon }) => (
                <div
                  key={name}
                  className="glass-card px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm text-frost-white/70 hover:border-gold/20 hover:text-frost-white transition-all cursor-default whitespace-nowrap shrink-0"
                >
                  <span className="text-sm sm:text-base">{icon}</span>
                  {name}
                </div>
              ))}
            </div>
          </RevealSection>

          {/* Interactive exercise demo */}
          <RevealSection delay={200}>
            <InteractiveDemo />
          </RevealSection>
        </div>
      </section>

      {/* ─── Gamification Features ─── */}
      <section className="py-12 sm:py-24 px-4 relative overflow-hidden">
        <img
          src="/backgrounds/gamification-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/70 via-bg-base/40 to-bg-base/70 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <RevealSection className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
              מערכת{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-gold to-dusty-aqua">
                גיימיפיקציה
              </span>{' '}
              מלאה
            </h2>
            <p className="text-frost-white/50 text-xs sm:text-base">כל הכלים שגורמים לך לחזור ללמוד — כל יום</p>
          </RevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {[
              { emoji: '🏆', title: '10 ליגות', desc: 'מברונזה ועד יהלום' },
              { emoji: '⚡', title: 'אירועי XP', desc: 'XP כפול בסופ"ש' },
              { emoji: '🔥', title: 'רצפים', desc: 'בונוסים ב-7/30/100 ימים' },
              { emoji: '🎯', title: 'יעדים שבועיים', desc: 'בחר את הקצב שלך' },
              { emoji: '🛡️', title: 'הקפאת רצף', desc: 'יום חופש ללא אובדן' },
              { emoji: '💡', title: 'רמזים חכמים', desc: 'עזרה AI לכל תרגיל' },
              { emoji: '⏱️', title: 'בונוס מהירות', desc: 'ענה מהר = יותר XP' },
              { emoji: '📊', title: 'סטטיסטיקות', desc: 'עקוב אחרי ההתקדמות' },
            ].map(({ emoji, title, desc }, i) => (
              <RevealSection key={title} delay={i * 60}>
                <div className="glass-card p-3 sm:p-4 text-center group hover:border-gold/20 transition-all no-touch-delay">
                  <span className="text-xl sm:text-2xl block mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform inline-block">{emoji}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-frost-white mb-0.5">{title}</h4>
                  <p className="text-[10px] text-frost-white/40 leading-relaxed">{desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-12 sm:py-24 px-4 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-6 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">מה אומרים הלומדים</h2>
            <p className="text-frost-white/40 text-xs sm:text-sm">הצטרפו לקהילה של לומדים שכבר שינו את הדרך שבה הם קולטים ידע</p>
          </RevealSection>

          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                name: 'נועם ר.',
                avatar: '/avatars/noam.png',
                text: '5 דקות ביום בדרך לעבודה — ואני מפנים את החומר הרבה יותר טוב מקריאה רגילה.',
                streak: 14,
                book: 'הרגלים אטומים',
                level: 'רמה 8',
              },
              {
                name: 'שירה מ.',
                avatar: '/avatars/shira.png',
                text: 'הליגות והאירועים גורמים לי לחזור כל יום. כבר 30 ימים רצף!',
                streak: 30,
                book: 'גלה את החוזקות שלך',
                level: 'רמה 14',
              },
              {
                name: 'יונתן ק.',
                avatar: '/avatars/yonatan.png',
                text: 'המאמן AI עזר לי להבין רעיונות שלא תפסתי בקריאה הראשונה. שווה כל שקל.',
                streak: 7,
                book: 'הכימיקלים של האושר',
                level: 'רמה 5',
              },
            ].map((t, i) => (
              <RevealSection key={t.name} delay={i * 100}>
                <div className="glass-card p-4 sm:p-5 group hover:border-gold/15 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-gold/30 group-hover:border-gold/60 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-frost-white">{t.name}</p>
                        <StarRating />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-warning">🔥 רצף {t.streak} ימים</span>
                        <span className="text-[9px] text-frost-white/20">·</span>
                        <span className="text-[10px] text-frost-white/30">{t.level}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-frost-white/60 leading-relaxed italic mb-2.5">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5 pt-2.5 border-t border-white/5">
                    <BookOpen className="w-3 h-3 text-dusty-aqua/50" />
                    <span className="text-[10px] text-frost-white/30">לומד: {t.book}</span>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-12 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">למה MindSet?</h2>
            <p className="text-frost-white/50 text-xs sm:text-base">כל מה שצריך כדי באמת ללמוד ספר — לא רק לקרוא אותו</p>
          </RevealSection>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-5">
            {[
              {
                icon: MessageCircle,
                color: 'text-dusty-aqua',
                bg: 'bg-dusty-aqua/10',
                border: 'group-hover:border-dusty-aqua/20',
                title: 'מאמן AI אישי',
                desc: 'שאל שאלות על החומר וקבל תשובות מותאמות אישית — כאילו יש לך מרצה פרטי',
              },
              {
                icon: Flame,
                color: 'text-warning',
                bg: 'bg-warning/10',
                border: 'group-hover:border-warning/20',
                title: 'רצף ימים',
                desc: 'מערכת Streak כמו Duolingo — כל יום שאתה לומד מחזק את הרצף ואת המוטיבציה',
              },
              {
                icon: RotateCcw,
                color: 'text-gold',
                bg: 'bg-gold/10',
                border: 'group-hover:border-gold/20',
                title: 'חזרה מרווחת',
                desc: 'המערכת מזהה תרגילים שטעית בהם ומחזירה אותם בזמן הנכון לזיכרון ארוך טווח',
              },
              {
                icon: Heart,
                color: 'text-danger',
                bg: 'bg-danger/10',
                border: 'group-hover:border-danger/20',
                title: '5 לבבות',
                desc: 'כל טעות עולה לב — כמו במשחק אמיתי. זה יוצר ריכוז, לחץ חיובי ולמידה עמוקה',
              },
              {
                icon: Trophy,
                color: 'text-gold',
                bg: 'bg-gold/10',
                border: 'group-hover:border-gold/20',
                title: 'הישגים ורמות',
                desc: 'צבור XP, עלה רמות, פתח הישגים — מ"מתחיל סקרן" עד "אגדת MindSet"',
              },
              {
                icon: Zap,
                color: 'text-dusty-aqua',
                bg: 'bg-dusty-aqua/10',
                border: 'group-hover:border-dusty-aqua/20',
                title: 'טוקנים יומיים',
                desc: '3 שאילתות AI בחינם כל יום — מספיק כדי לטעום את הכוח של לימוד מונחה',
              },
            ].map(({ icon: Icon, color, bg, border, title, desc }, i) => (
              <RevealSection key={title} delay={i * 80}>
                <div className={`glass-card p-3.5 sm:p-5 flex gap-3 sm:gap-4 group ${border} transition-all`}>
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-[13px] sm:text-base font-bold mb-0.5">{title}</h3>
                    <p className="text-[11px] sm:text-sm text-frost-white/45 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-12 sm:py-24 px-0 sm:px-4 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">תוכניות ומחירים</h2>
            <p className="text-frost-white/50 text-xs sm:text-base">התחל בחינם — שדרג כשתרצה</p>
          </RevealSection>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-5 overflow-x-auto mobile-scroll-x snap-x-mandatory px-4 pb-2 sm:pb-0">
            {/* Free */}
            <RevealSection delay={0} className="min-w-[280px] sm:min-w-0 snap-center">
              <div className="glass-card p-5 sm:p-6 text-center h-full flex flex-col">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-frost-white/5 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-frost-white/60" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-1">חינם</h3>
                <p className="text-2xl sm:text-3xl font-bold text-frost-white mb-1">₪0</p>
                <p className="text-[11px] sm:text-xs text-frost-white/40 mb-4 sm:mb-5">לתמיד</p>
                <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-frost-white/60 text-right mb-5 sm:mb-6 flex-1">
                  {['פרק ראשון מכל ספר', '3 שאילתות AI ביום', 'מערכת חזרה מרווחת', 'הישגים ורמות'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openAuth}
                  className="w-full py-3 rounded-xl border border-white/10 text-frost-white/70 text-sm font-medium hover:border-white/20 hover:text-frost-white transition-all no-touch-delay tap-bounce"
                >
                  התחל בחינם
                </button>
              </div>
            </RevealSection>

            {/* Single book */}
            <RevealSection delay={120} className="min-w-[280px] sm:min-w-0 snap-center">
              <div className="glass-card p-5 sm:p-6 text-center h-full flex flex-col">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-dusty-aqua/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-dusty-aqua" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-1">ספר בודד</h3>
                <p className="text-2xl sm:text-3xl font-bold text-frost-white mb-1">₪37</p>
                <p className="text-[11px] sm:text-xs text-frost-white/40 mb-4 sm:mb-5">חד פעמי</p>
                <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-frost-white/60 text-right mb-5 sm:mb-6 flex-1">
                  {['כל הפרקים של ספר אחד', '50 שאילתות AI', 'חזרה מרווחת מלאה', 'חוברת עבודה'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openAuth}
                  className="w-full py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white text-sm font-medium hover:opacity-90 transition-opacity no-touch-delay tap-bounce"
                >
                  בחר ספר
                </button>
              </div>
            </RevealSection>

            {/* Bundle */}
            <RevealSection delay={240} className="min-w-[280px] sm:min-w-0 snap-center">
              <div className="glass-card p-5 sm:p-6 text-center relative border-gold/30 h-full flex flex-col">
                <div className="absolute -top-3 right-1/2 translate-x-1/2 px-3 sm:px-4 py-1 rounded-full bg-gradient-to-l from-gold to-[#e8c84a] text-bg-base text-[10px] sm:text-[11px] font-bold whitespace-nowrap">
                  הכי משתלם
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-1">באנדל מאסטר</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gold mb-1">₪97</p>
                <p className="text-[11px] sm:text-xs text-frost-white/40 mb-4 sm:mb-5">חד פעמי — כל הספרים</p>
                <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-frost-white/60 text-right mb-5 sm:mb-6 flex-1">
                  {['כל הספרים (4+)', 'AI ללא הגבלה', 'חוברות עבודה', 'עדכונים וספרים חדשים'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openAuth}
                  className="w-full py-3 rounded-xl bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base font-bold text-sm hover:brightness-110 transition-all no-touch-delay tap-bounce"
                >
                  קנה באנדל
                </button>
              </div>
            </RevealSection>
          </div>
          {/* Scroll dots on mobile */}
          <div className="flex items-center justify-center gap-1.5 mt-3 sm:hidden px-4">
            <span className="w-1.5 h-1.5 rounded-full bg-frost-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-frost-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
            <span className="text-[10px] text-frost-white/20 mr-2">החלק לצדדים</span>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-12 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <RevealSection className="text-center mb-6 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">שאלות נפוצות</h2>
          </RevealSection>

          <div className="space-y-3">
            {[
              {
                q: 'מה בדיוק MindSet?',
                a: 'MindSet הופך ספרי פיתוח אישי לחוויית למידה אינטראקטיבית — עם תרגילים, ניקוד ומאמן AI. גם 5 דקות ביום מספיקות כדי להפנים עקרונות של ספר שלם.',
              },
              {
                q: 'האם אני צריך לקרוא את הספר לפני?',
                a: 'בכלל לא! MindSet מלמד את עקרונות הספר דרך תרגילים — בלי קריאה פסיבית. אחרי שתסיים, תדע את הרעיונות המרכזיים כאילו קראת את הספר.',
              },
              {
                q: 'כמה זמן לוקח כל שיעור?',
                a: 'שיעור ממוצע לוקח 3-5 דקות. אתה לומד בקצב שלך — גם 5 דקות ביום מספיקות כדי להתקדם ולהפנים את החומר לעומק.',
              },
              {
                q: 'מה כלול בחינם?',
                a: 'הפרק הראשון מכל ספר, 3 שאילתות AI ביום, מערכת חזרה מרווחת, הישגים, ליגות וכל מנגנוני הגיימיפיקציה. בלי הגבלת זמן.',
              },
              {
                q: 'איך עובד המאמן AI?',
                a: 'המאמן הוא עוזר חכם שמבין את החומר של כל ספר. אתה יכול לשאול שאלות, לבקש הסברים נוספים או דוגמאות — והוא עונה בעברית בצורה מותאמת.',
              },
            ].map(({ q, a }, i) => (
              <RevealSection key={q} delay={i * 60}>
                <FAQItem question={q} answer={a} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA + Auth ─── */}
      <section ref={ctaRef} className="py-12 sm:py-24 px-4 relative">
        <div className="absolute top-0 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-deep-petrol/20 blur-[80px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-gold/8 blur-[60px] sm:blur-[100px] pointer-events-none" />

        <div className="max-w-sm mx-auto relative z-10 text-center">
          <RevealSection>
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua mb-4 sm:mb-5">
              <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-frost-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">מוכן להתחיל?</h2>
            <p className="text-frost-white/50 text-xs sm:text-sm mb-6 sm:mb-8">הצטרף בחינם ותתחיל לשחק את הספר הראשון שלך עוד היום</p>

            {/* Inline auth */}
            <div className="space-y-3">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                התחבר עם Google
              </button>

              <button
                onClick={() => setAuthMode('email-login')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-bg-card border border-white/10 text-frost-white font-medium text-sm hover:bg-bg-card-hover transition-colors"
              >
                <Mail className="w-5 h-5" />
                התחבר עם אימייל
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-frost-white/40">או</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={handleGuest}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-white/10 text-frost-white/60 text-sm hover:text-frost-white hover:border-white/20 transition-colors"
              >
                <User className="w-5 h-5" />
                המשך כאורח
              </button>

              <p className="text-[11px] text-frost-white/25 mt-3">
                במצב אורח ההתקדמות נשמרת רק במכשיר זה
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-5 text-center border-t border-white/5 pb-24 sm:pb-5">
        <p className="text-[11px] text-frost-white/25 px-4">
          מדריך לא רשמי. אינו קשור למחברים המקוריים.
          <span className="mx-2">|</span>
          MindSet &copy; {new Date().getFullYear()}
        </p>
      </footer>

      {/* ─── Sticky Mobile CTA ─── */}
      {showMobileCTA && !authMode && (
        <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden animate-slide-up-cta safe-bottom">
          <div className="bg-bg-base/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5">
            <button
              onClick={openAuth}
              className="w-full py-3 rounded-xl bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base font-bold text-sm no-touch-delay tap-bounce active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              התחל ללמוד בחינם
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-frost-white/30">{liveUsers} לומדים עכשיו · בלי כרטיס אשראי</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Auth Modal (triggered by navbar "התחבר") ─── */}
      {authMode && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeAuth} />

          <div className="relative z-10 w-full sm:max-w-sm animate-slide-up">
            <div className="glass-card p-6 border-white/10 bg-bg-base/95 backdrop-blur-xl rounded-b-none sm:rounded-b-2xl safe-bottom">
              {/* Close */}
              <button onClick={closeAuth} className="absolute top-4 left-4 text-frost-white/40 hover:text-frost-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua mb-3">
                  <Brain className="w-7 h-7 text-frost-white" />
                </div>
                <h3 className="font-display text-2xl font-bold">ברוך הבא</h3>
                <p className="text-frost-white/50 text-sm mt-1">התחבר כדי להתחיל ללמוד</p>
              </div>

              {authMode === 'main' && (
                <div className="space-y-3">
                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    התחבר עם Google
                  </button>

                  <button
                    onClick={() => setAuthMode('email-login')}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-bg-card border border-white/10 text-frost-white font-medium text-sm hover:bg-bg-card-hover transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    התחבר עם אימייל
                  </button>

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-frost-white/40">או</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    onClick={handleGuest}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-white/10 text-frost-white/60 text-sm hover:text-frost-white hover:border-white/20 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    המשך כאורח
                  </button>

                  <p className="text-center text-[11px] text-frost-white/25 mt-3">
                    במצב אורח ההתקדמות נשמרת רק במכשיר זה
                  </p>
                </div>
              )}

              {(authMode === 'email-login' || authMode === 'email-register') && (
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="אימייל"
                    className="w-full px-4 py-3 rounded-xl bg-bg-card border border-white/10 text-frost-white placeholder:text-frost-white/30 text-sm focus:border-gold/50 focus:outline-none transition-colors"
                    dir="ltr"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="סיסמה"
                    className="w-full px-4 py-3 rounded-xl bg-bg-card border border-white/10 text-frost-white placeholder:text-frost-white/30 text-sm focus:border-gold/50 focus:outline-none transition-colors"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : authMode === 'email-login' ? 'התחבר' : 'הירשם'}
                  </button>

                  <div className="flex justify-between text-xs text-frost-white/40">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'email-login' ? 'email-register' : 'email-login')}
                      className="hover:text-gold transition-colors"
                    >
                      {authMode === 'email-login' ? 'עדיין אין לך חשבון? הירשם' : 'יש לך חשבון? התחבר'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('main')}
                      className="hover:text-gold transition-colors"
                    >
                      חזרה
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
