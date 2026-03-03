import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useToast } from '../contexts/ToastContext'
import { useSound } from '../hooks/useSound'
import { checkNewAchievements } from '../lib/achievements'
import { getComboBonus, getComboLabel, XP_CORRECT_ANSWER } from '../config/constants'
import ExerciseRouter from '../components/exercises/ExerciseRouter'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import LessonComplete from '../components/feedback/LessonComplete'
import LevelUpOverlay from '../components/feedback/LevelUpOverlay'
import AchievementPopup from '../components/feedback/AchievementPopup'
import OutOfHeartsModal from '../components/modals/OutOfHeartsModal'
import PurchaseModal from '../components/modals/PurchaseModal'
import { X, Heart, Zap } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'

const BOOKS = { 'strengths-finder': strengthsFinder, 'atomic-habits': atomicHabits, 'happy-chemicals': happyChemicals, 'next-five-moves': nextFiveMoves }

// Mini confetti particles for correct answers
function MiniConfetti({ active }) {
  if (!active) return null
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360
    const rad = (angle * Math.PI) / 180
    const dist = 40 + Math.random() * 30
    const tx = Math.cos(rad) * dist
    const ty = Math.sin(rad) * dist - 20
    const colors = ['#D4AF37', '#22c55e', '#2F8592', '#E8F1F2', '#f59e0b']
    return { tx, ty, color: colors[i % colors.length], delay: Math.random() * 0.1, size: 4 + Math.random() * 4 }
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
function XPFloat({ xp, combo }) {
  if (!xp) return null
  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-xp-float">
      <div className="text-center">
        <span className="text-gold font-bold text-2xl drop-shadow-lg">+{xp} XP</span>
        {combo >= 3 && (
          <span className="block text-sm text-warning font-bold mt-0.5 animate-combo-scale">
            {getComboLabel(combo)} x{combo}
          </span>
        )}
      </div>
    </div>
  )
}

export default function LessonPage() {
  const { bookSlug, chapterIndex, lessonIndex } = useParams()
  const navigate = useNavigate()
  const { player, updatePlayer, onCorrectAnswer, onWrongAnswer, completeLesson } = usePlayer()
  const toast = useToast()
  const { play } = useSound()

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

  const currentExercise = exercises[currentIndex]
  const progress = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0
  const comboStreak = player.comboStreak || 0

  // Reset combo at lesson start
  const hasReset = useRef(false)
  useEffect(() => {
    if (!hasReset.current) {
      updatePlayer(prev => ({ ...prev, comboStreak: 0 }))
      hasReset.current = true
    }
  }, [])

  const handleAnswer = useCallback((isCorrect, explanation) => {
    if (isCorrect) {
      play('correct')

      // Calculate XP earned for display
      const newCombo = (player.comboStreak || 0) + 1
      const bonus = getComboBonus(newCombo)
      const totalXP = XP_CORRECT_ANSWER + bonus

      onCorrectAnswer()
      setFeedback({ correct: true, explanation })

      // Show mini confetti
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 700)

      // Show floating XP
      setFloatingXP({ xp: totalXP, combo: newCombo })
      setTimeout(() => setFloatingXP(null), 1300)
    } else {
      play('wrong')
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

        // Check if hearts ran out
        if (prev.hearts <= 1) {
          setTimeout(() => setShowOutOfHearts(true), 600)
        }

        return { ...prev, reviewQueue: [...queue, item] }
      })
    }
  }, [onCorrectAnswer, onWrongAnswer, updatePlayer, play, bookSlug, chapterIndex, lessonIndex, currentIndex, player.comboStreak])

  // Watch for level changes
  const [prevLevel, setPrevLevel] = useState(player.level)
  useEffect(() => {
    if (player.level > prevLevel) {
      play('levelUp')
      setLevelUp(player.level)
    }
    setPrevLevel(player.level)
  }, [player.level, prevLevel, play])

  // Watch for new achievements
  useEffect(() => {
    const newOnes = checkNewAchievements(player)
    if (newOnes.length > 0 && !newAchievement) {
      play('achievement')
      setNewAchievement(newOnes[0])
      updatePlayer(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newOnes[0].id],
      }))
    }
  }, [player.xp, player.totalCorrect, player.completedLessons, player.currentStreak, player.perfectLessons])

  const handleContinue = useCallback(() => {
    setFeedback(null)
    if (currentIndex + 1 >= exercises.length) {
      completeLesson(bookSlug, parseInt(chapterIndex), parseInt(lessonIndex), mistakes)
      play('lessonComplete')
      setIsComplete(true)
    } else {
      // Animate exercise transition
      setTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(i => i + 1)
        setTransitioning(false)
      }, 280)
    }
  }, [currentIndex, exercises.length, bookSlug, chapterIndex, lessonIndex, mistakes, completeLesson, play])

  if (!book || !lesson) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-frost-white/50">השיעור לא נמצא</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <LessonComplete
        mistakes={mistakes}
        totalExercises={exercises.length}
        onContinue={() => navigate(`/book/${bookSlug}`)}
      />
    )
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Mini confetti on correct answer */}
      <MiniConfetti active={showConfetti} />

      {/* Floating XP indicator */}
      {floatingXP && <XPFloat xp={floatingXP.xp} combo={floatingXP.combo} />}

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-bg-base/90 backdrop-blur-lg px-4 py-3 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(`/book/${bookSlug}`)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
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

          {/* Hearts */}
          <div className="flex items-center gap-1 text-danger">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{player.hearts}</span>
          </div>
        </div>
      </div>

      {/* Exercise with slide animation */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {currentExercise && (
          <div
            key={currentIndex}
            className={transitioning ? 'animate-exercise-exit' : 'animate-exercise-enter'}
          >
            <ExerciseRouter
              exercise={currentExercise}
              onAnswer={handleAnswer}
              disabled={!!feedback}
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
