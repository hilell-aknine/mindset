import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useToast } from '../contexts/ToastContext'
import { useSound } from '../hooks/useSound'
import { checkNewAchievements } from '../lib/achievements'
import ExerciseRouter from '../components/exercises/ExerciseRouter'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import LessonComplete from '../components/feedback/LessonComplete'
import LevelUpOverlay from '../components/feedback/LevelUpOverlay'
import AchievementPopup from '../components/feedback/AchievementPopup'
import OutOfHeartsModal from '../components/modals/OutOfHeartsModal'
import PurchaseModal from '../components/modals/PurchaseModal'
import { X, Heart } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'

const BOOKS = { 'strengths-finder': strengthsFinder }

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

  const currentExercise = exercises[currentIndex]
  const progress = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0

  const handleAnswer = useCallback((isCorrect, explanation) => {
    if (isCorrect) {
      play('correct')
      onCorrectAnswer()
      setFeedback({ correct: true, explanation })
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

        // Check if hearts ran out (use prev to get accurate count after decrement)
        if (prev.hearts <= 1) {
          setTimeout(() => setShowOutOfHearts(true), 600)
        }

        return { ...prev, reviewQueue: [...queue, item] }
      })
    }
  }, [onCorrectAnswer, onWrongAnswer, updatePlayer, play, bookSlug, chapterIndex, lessonIndex, currentIndex])

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
      // Save the earned achievement
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
      setCurrentIndex(i => i + 1)
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
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-bg-base/90 backdrop-blur-lg px-4 py-3 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(`/book/${bookSlug}`)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-frost-white/40" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-1 text-danger">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{player.hearts}</span>
          </div>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {currentExercise && (
          <ExerciseRouter
            key={currentIndex}
            exercise={currentExercise}
            onAnswer={handleAnswer}
            disabled={!!feedback}
          />
        )}
      </div>

      {/* Feedback panel */}
      {feedback && (
        <FeedbackPanel
          correct={feedback.correct}
          explanation={feedback.explanation}
          onContinue={handleContinue}
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
