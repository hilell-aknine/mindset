import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useToast } from '../contexts/ToastContext'
import { useSound } from '../hooks/useSound'
import { checkNewAchievements } from '../lib/achievements'
import { getComboBonus, getComboLabel, XP_CORRECT_ANSWER } from '../config/constants'
import { getActiveEvent, getXPMultiplier } from '../lib/events'
import ExerciseRouter from '../components/exercises/ExerciseRouter'
import ExerciseTimer, { getSpeedBonus, TIMER_DURATION } from '../components/exercises/ExerciseTimer'
import { useAnnounce } from '../components/Announcer'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import LessonComplete from '../components/feedback/LessonComplete'
import LevelUpOverlay from '../components/feedback/LevelUpOverlay'
import AchievementPopup from '../components/feedback/AchievementPopup'
import OutOfHeartsModal from '../components/modals/OutOfHeartsModal'
import PurchaseModal from '../components/modals/PurchaseModal'
import { X, Heart, Zap, Timer } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'
import mindsetBook from '../data/books/mindset-book.json'
import indistractable from '../data/books/indistractable.json'

const BOOKS = { 'strengths-finder': strengthsFinder, 'atomic-habits': atomicHabits, 'happy-chemicals': happyChemicals, 'next-five-moves': nextFiveMoves, 'mindset-book': mindsetBook, 'indistractable': indistractable }

const EXERCISE_TYPE_NAMES = {
  'multiple-choice': 'בחירה מרובה',
  'fill-blank': 'השלם את המשפט',
  'compare': 'השוואה',
  'improve': 'שיפור',
  'order': 'סדר נכון',
  'match': 'התאמה',
  'identify': 'זיהוי',
  'scenario': 'תרחיש',
  'reading': 'קטע קריאה',
}

// Mini confetti particles for correct answers — scales up with combo
function MiniConfetti({ active, combo = 0 }) {
  if (!active) return null
  const count = combo >= 5 ? 24 : combo >= 3 ? 18 : 12
  const spread = combo >= 5 ? 80 : combo >= 3 ? 60 : 40
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360
    const rad = (angle * Math.PI) / 180
    const dist = spread + Math.random() * 30
    const tx = Math.cos(rad) * dist
    const ty = Math.sin(rad) * dist - 20
    const colors = ['#D4AF37', '#22c55e', '#2F8592', '#E8F1F2', '#f59e0b']
    return { tx, ty, color: colors[i % colors.length], delay: Math.random() * 0.15, size: 4 + Math.random() * (combo >= 3 ? 6 : 4) }
  })

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-1/2 left-1/2">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              animation: `particleBurst 0.6s ${p.delay}s ease-out forwards`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Floating XP indicator
function XPFloat({ xp, combo, speedBonus, eventMultiplier }) {
  if (!xp) return null
  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-xp-float">
      <div className="text-center">
        <span className="text-gold-text font-bold text-2xl drop-shadow-lg">+{xp} XP</span>
        {eventMultiplier > 1 && (
          <span className="block text-xs text-warning font-bold mt-0.5 animate-combo-scale">
            x{eventMultiplier} אירוע!
          </span>
        )}
        {combo >= 3 && (
          <span className="block text-sm text-warning font-bold mt-0.5 animate-combo-scale">
            {getComboLabel(combo)} x{combo}
          </span>
        )}
        {speedBonus > 0 && (
          <span className="block text-xs text-dusty-aqua font-bold mt-0.5">
            +{speedBonus} מהירות
          </span>
        )}
      </div>
    </div>
  )
}

export default function LessonPage() {
  const { bookSlug, chapterIndex, lessonIndex } = useParams()
  const navigate = useNavigate()
  const { player, updatePlayer, onCorrectAnswer, onWrongAnswer, completeLesson, addToSpacedReview } = usePlayer()
  const toast = useToast()
  const { play } = useSound()
  const announce = useAnnounce()

  const book = BOOKS[bookSlug]
  const chapter = book?.chapters[parseInt(chapterIndex)]
  const lesson = chapter?.lessons[parseInt(lessonIndex)]
  const exercises = lesson?.exercises || []

  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [levelUp, setLevelUp] = useState(null)
  const [newAchievement, setNewAchievement] = useState(null)
  const [showOutOfHearts, setShowOutOfHearts] = useState(false)
  const [showPurchase, setShowPurchase] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [floatingXP, setFloatingXP] = useState(null)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const timerTimeLeft = useRef(TIMER_DURATION)
  const [totalSpeedBonus, setTotalSpeedBonus] = useState(0)
  const [halfwayShown, setHalfwayShown] = useState(false)
  const autoAdvanceRef = useRef(null)

  const currentExercise = exercises[currentIndex]
  const progress = exercises.length > 0 ? ((currentIndex + 0.5) / exercises.length) * 100 : 0
  const comboStreak = player.comboStreak || 0

  // Reset combo at lesson start + play start sound
  const hasReset = useRef(false)

  // Reset all state when navigating to a different lesson (same component, new params)
  const lessonKey = `${bookSlug}:${chapterIndex}:${lessonIndex}`
  const prevLessonKey = useRef(lessonKey)
  useEffect(() => {
    if (prevLessonKey.current !== lessonKey) {
      prevLessonKey.current = lessonKey
      setCurrentIndex(0)
      setFeedback(null)
      setMistakes(0)
      setIsComplete(false)
      setLevelUp(null)
      setNewAchievement(null)
      setShowOutOfHearts(false)
      setShowPurchase(false)
      setTransitioning(false)
      setShowConfetti(false)
      setFloatingXP(null)
      setTimerEnabled(false)
      setTotalSpeedBonus(0)
      setHalfwayShown(false)
      timerTimeLeft.current = TIMER_DURATION
      hasReset.current = false
    }
  }, [lessonKey])

  // Cleanup auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
    }
  }, [])

  // Announce exercise to screen readers
  useEffect(() => {
    if (currentExercise) {
      const typeName = EXERCISE_TYPE_NAMES[currentExercise.type] || currentExercise.type
      announce(`תרגיל ${currentIndex + 1} מתוך ${exercises.length}: ${typeName}`)
    }
  }, [currentIndex, currentExercise, exercises.length, announce])
  useEffect(() => {
    if (!hasReset.current) {
      updatePlayer(prev => ({ ...prev, comboStreak: 0 }))
      play('lessonStart')
      hasReset.current = true
    }
  }, [lessonKey])

  // Track timer value
  const handleTimerUpdate = useCallback(() => {
    // Timer expired — treat as wrong answer
    play('wrong')
    onWrongAnswer()
    setMistakes(m => m + 1)
    setFeedback({ correct: false, explanation: 'נגמר הזמן! נסה לענות מהר יותר בפעם הבאה.' })
  }, [play, onWrongAnswer])

  const handleUseToken = useCallback(() => {
    updatePlayer(prev => ({
      ...prev,
      tokens: Math.max(0, (prev.tokens || 0) - 1)
    }))
  }, [updatePlayer])

  const handleAnswer = useCallback((isCorrect, explanation) => {
    if (isCorrect) {
      play('correct')
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([30, 20, 30])

      // Calculate XP earned for display (with event multiplier)
      const newCombo = (player.comboStreak || 0) + 1
      const bonus = getComboBonus(newCombo)
      const speedBonus = timerEnabled ? getSpeedBonus(timerTimeLeft.current) : 0
      const multiplier = getXPMultiplier()
      const totalXP = Math.round((XP_CORRECT_ANSWER + bonus) * multiplier) + speedBonus

      if (speedBonus > 0) {
        setTotalSpeedBonus(prev => prev + speedBonus)
        // Track cumulative speed bonus
        updatePlayer(prev => ({
          ...prev,
          totalSpeedBonus: (prev.totalSpeedBonus || 0) + speedBonus,
        }))
      }

      onCorrectAnswer(speedBonus)
      setFeedback({ correct: true, explanation })

      // Show mini confetti — bigger burst on high combos
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), newCombo >= 5 ? 1000 : 700)

      // Show floating XP
      setFloatingXP({ xp: totalXP, combo: newCombo, speedBonus, eventMultiplier: multiplier })
      setTimeout(() => setFloatingXP(null), 1300)

      // Auto-advance after correct answer (Duolingo-style)
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
      autoAdvanceRef.current = setTimeout(() => {
        setFeedback(prev => {
          if (prev?.correct) {
            // Trigger continue via state change — actual navigation handled in effect
            return { ...prev, autoAdvance: true }
          }
          return prev
        })
      }, 1500)
    } else {
      play('wrong')
      // Haptic feedback — stronger for wrong
      if (navigator.vibrate) navigator.vibrate([50, 30, 80])
      onWrongAnswer()
      setMistakes(m => m + 1)
      setFeedback({ correct: false, explanation })

      // Add to review queue
      updatePlayer(prev => {
        const queue = prev.reviewQueue || []
        const item = {
          bookSlug,
          chapterIndex: parseInt(chapterIndex),
          lessonIndex: parseInt(lessonIndex),
          exerciseIndex: currentIndex,
        }
        const exists = queue.some(q =>
          q.bookSlug === item.bookSlug &&
          q.chapterIndex === item.chapterIndex &&
          q.lessonIndex === item.lessonIndex &&
          q.exerciseIndex === item.exerciseIndex
        )
        if (exists) return prev

        // Add to spaced repetition queue
        addToSpacedReview(
          item.bookSlug,
          item.chapterIndex,
          item.lessonIndex,
          item.exerciseIndex
        )

        // Check if hearts ran out
        if (prev.hearts <= 1) {
          setTimeout(() => setShowOutOfHearts(true), 600)
        }

        return { ...prev, reviewQueue: [...queue, item] }
      })
    }
  }, [onCorrectAnswer, onWrongAnswer, updatePlayer, play, bookSlug, chapterIndex, lessonIndex, currentIndex, player.comboStreak, timerEnabled])

  // Watch for level changes
  const [prevLevel, setPrevLevel] = useState(player.level)
  useEffect(() => {
    if (player.level > prevLevel) {
      play('levelUp')
      setLevelUp(player.level)
      announce(`עלית לרמה ${player.level}!`)
    }
    setPrevLevel(player.level)
  }, [player.level, prevLevel, play, announce])

  // Watch for new achievements
  useEffect(() => {
    const newOnes = checkNewAchievements(player)
    if (newOnes.length > 0 && !newAchievement) {
      play('achievement')
      setNewAchievement(newOnes[0])
      announce(`הישג חדש: ${newOnes[0].title}`)
      updatePlayer(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newOnes[0].id],
      }))
    }
  }, [player.xp, player.totalCorrect, player.completedLessons, player.currentStreak, player.perfectLessons])

  const handleContinue = useCallback(() => {
    // Clear any pending auto-advance
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current)
      autoAdvanceRef.current = null
    }
    setFeedback(null)
    if (currentIndex + 1 >= exercises.length) {
      completeLesson(bookSlug, parseInt(chapterIndex), parseInt(lessonIndex), mistakes)
      play('lessonComplete')
      setIsComplete(true)
    } else {
      // Animate exercise transition
      play('transition')
      setTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(i => i + 1)
        timerTimeLeft.current = TIMER_DURATION
        setTransitioning(false)
      }, 280)
    }
  }, [currentIndex, exercises.length, bookSlug, chapterIndex, lessonIndex, mistakes, completeLesson, play])

  // Auto-advance effect: watch for autoAdvance flag set by timer
  useEffect(() => {
    if (feedback?.autoAdvance) {
      handleContinue()
    }
  }, [feedback?.autoAdvance, handleContinue])

  // Halfway encouragement toast
  useEffect(() => {
    if (!halfwayShown && exercises.length >= 4 && currentIndex === Math.floor(exercises.length / 2)) {
      setHalfwayShown(true)
      toast.info('🔥 חצי דרך! ממשיכים חזק')
    }
  }, [currentIndex, exercises.length, halfwayShown, toast])

  if (!book || !lesson) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-frost-white/50">השיעור לא נמצא</p>
      </div>
    )
  }

  // Find next lesson in this book
  const nextLessonInfo = (() => {
    const ci = parseInt(chapterIndex)
    const li = parseInt(lessonIndex)
    // Try next lesson in same chapter
    if (chapter?.lessons[li + 1]) {
      return { title: chapter.lessons[li + 1].title, ci, li: li + 1 }
    }
    // Try first lesson in next chapter (if unlocked)
    const nextChapter = book?.chapters[ci + 1]
    if (nextChapter?.lessons?.[0] && (player.isPremium || player.premiumBooks?.includes(bookSlug) || ci + 1 === 0)) {
      return { title: nextChapter.lessons[0].title, ci: ci + 1, li: 0 }
    }
    return null
  })()

  // Check if this is the last lesson in the chapter (for audio summary hint)
  const isLastInChapter = chapter && parseInt(lessonIndex) === chapter.lessons.length - 1

  if (isComplete) {
    return (
      <LessonComplete
        mistakes={mistakes}
        totalExercises={exercises.length}
        onContinue={() => navigate(`/book/${bookSlug}`)}
        speedBonus={totalSpeedBonus}
        nextLesson={nextLessonInfo}
        onNextLesson={nextLessonInfo ? () => navigate(`/lesson/${bookSlug}/${nextLessonInfo.ci}/${nextLessonInfo.li}`) : null}
        chapterComplete={isLastInChapter}
      />
    )
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      {/* Mini confetti on correct answer — scales with combo */}
      <MiniConfetti active={showConfetti} combo={comboStreak} />

      {/* Floating XP indicator */}
      {floatingXP && <XPFloat xp={floatingXP.xp} combo={floatingXP.combo} speedBonus={floatingXP.speedBonus} eventMultiplier={floatingXP.eventMultiplier} />}

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-bg-base/90 backdrop-blur-lg px-4 py-3 border-b border-white/5">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Lesson title */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-sm">{book.icon}</span>
            <p className="text-[10px] text-frost-white/30 truncate min-w-0">{chapter?.title} — {lesson.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/book/${bookSlug}`)}
              className="p-2.5 -m-1 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="חזרה לספר"
            >
              <X className="w-5 h-5 text-frost-white/40" />
            </button>

            {/* Progress bar with shimmer */}
            <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 progress-shimmer rounded-full" />
              </div>
            </div>

            {/* Exercise counter */}
            <span className="text-[10px] text-frost-white/30 font-medium min-w-[32px] text-center">
              {currentIndex + 1}/{exercises.length}
            </span>

            {/* Combo indicator */}
            {comboStreak >= 3 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 border border-warning/30 animate-combo-scale">
                <Zap className="w-3 h-3 text-warning fill-current" />
                <span className="text-[10px] font-bold text-warning">x{comboStreak}</span>
              </div>
            )}

            {/* Timer toggle */}
            <button
              onClick={() => setTimerEnabled(t => !t)}
              className={`p-2.5 -m-1 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                timerEnabled ? 'bg-dusty-aqua/15 text-dusty-aqua' : 'hover:bg-white/5 text-frost-white/20'
              }`}
              aria-label={timerEnabled ? 'כבה טיימר' : 'הפעל טיימר (+XP בונוס)'}
            >
              <Timer className="w-4.5 h-4.5" />
            </button>

            {/* Hearts */}
            <div className="flex items-center gap-1 text-danger">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold">{player.hearts}</span>
            </div>
          </div>

          {/* Active event mini-banner */}
          {getActiveEvent() && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-warning/10 border border-warning/20">
              <span className="text-sm">{getActiveEvent().emoji}</span>
              <span className="text-[10px] font-bold text-warning">{getActiveEvent().name} x{getActiveEvent().multiplier}</span>
            </div>
          )}

          {/* Timer bar */}
          {timerEnabled && !feedback && (
            <ExerciseTimer
              active={timerEnabled && !feedback}
              onTimeUp={handleTimerUpdate}
              exerciseKey={currentIndex}
            />
          )}
        </div>
      </div>

      {/* Exercise with slide animation */}
      <div className="flex-1 min-h-0 max-w-2xl mx-auto w-full px-4 py-6 overflow-y-auto">
        {currentExercise && (
          <div
            key={currentIndex}
            className={transitioning ? 'animate-exercise-exit' : 'animate-exercise-enter'}
          >
            <ExerciseRouter
              exercise={currentExercise}
              onAnswer={handleAnswer}
              disabled={!!feedback}
              tokens={player.tokens}
              onUseToken={handleUseToken}
            />
          </div>
        )}
      </div>

      {/* Feedback panel */}
      {feedback && (
        <FeedbackPanel
          correct={feedback.correct}
          explanation={feedback.explanation}
          onContinue={handleContinue}
          comboStreak={comboStreak}
          speedBonus={feedback.correct && timerEnabled ? getSpeedBonus(timerTimeLeft.current) : 0}
        />
      )}

      {/* Level up overlay */}
      {levelUp && (
        <LevelUpOverlay level={levelUp} onClose={() => setLevelUp(null)} />
      )}

      {/* Achievement popup */}
      {newAchievement && (
        <AchievementPopup
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}

      {/* Out of hearts modal */}
      {showOutOfHearts && (
        <OutOfHeartsModal
          onClose={() => {
            setShowOutOfHearts(false)
            navigate(`/book/${bookSlug}`)
          }}
          onPurchase={() => {
            setShowOutOfHearts(false)
            setShowPurchase(true)
          }}
        />
      )}

      {/* Purchase modal */}
      {showPurchase && (
        <PurchaseModal
          bookSlug={bookSlug}
          onClose={() => setShowPurchase(false)}
        />
      )}
    </div>
  )
}
