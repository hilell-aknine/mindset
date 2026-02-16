import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useToast } from '../contexts/ToastContext'
import { useSound } from '../hooks/useSound'
import ExerciseRouter from '../components/exercises/ExerciseRouter'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import { ArrowRight, RotateCcw, PartyPopper } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'

const BOOKS = { 'strengths-finder': strengthsFinder }

export default function ReviewPage() {
  const navigate = useNavigate()
  const { player, updatePlayer, onCorrectAnswer, onWrongAnswer } = usePlayer()
  const toast = useToast()
  const { play } = useSound()

  // Build review queue from wrong answers stored in player.reviewQueue
  const reviewExercises = useMemo(() => {
    const queue = player.reviewQueue || []
    if (queue.length === 0) return []

    return queue.map(item => {
      const book = BOOKS[item.bookSlug]
      if (!book) return null
      const chapter = book.chapters[item.chapterIndex]
      if (!chapter) return null
      const lesson = chapter.lessons[item.lessonIndex]
      if (!lesson) return null
      const exercise = lesson.exercises[item.exerciseIndex]
      if (!exercise) return null
      return { ...exercise, _meta: item }
    }).filter(Boolean)
  }, [player.reviewQueue])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [completed, setCompleted] = useState(0)
  const [lastCorrect, setLastCorrect] = useState(false)

  const current = reviewExercises[currentIndex]
  const totalToReview = reviewExercises.length + completed
  const progress = totalToReview > 0
    ? ((currentIndex + completed) / totalToReview) * 100
    : 0

  const handleAnswer = useCallback((isCorrect, explanation) => {
    if (isCorrect) {
      play('correct')
      onCorrectAnswer()
      setFeedback({ correct: true, explanation })
      setLastCorrect(true)
      // Remove from review queue
      updatePlayer(prev => ({
        ...prev,
        reviewQueue: (prev.reviewQueue || []).filter((_, i) => i !== currentIndex),
      }))
      setCompleted(c => c + 1)
    } else {
      play('wrong')
      onWrongAnswer()
      setFeedback({ correct: false, explanation })
      setLastCorrect(false)
    }
  }, [currentIndex, onCorrectAnswer, onWrongAnswer, play, updatePlayer])

  const handleContinue = useCallback(() => {
    setFeedback(null)
    // If last answer was correct, array already shortened — don't increment
    // If last answer was wrong, item stays — need to move to next
    if (!lastCorrect) {
      setCurrentIndex(i => i + 1)
    }
    // If correct, currentIndex stays but reviewExercises has shifted
  }, [lastCorrect])

  // Empty state
  if (reviewExercises.length === 0) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button onClick={() => navigate('/home')} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowRight className="w-5 h-5 text-frost-white/60" />
          </button>
          <h2 className="font-display text-xl font-bold text-frost-white">חזרה</h2>
        </div>
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-success/10 mx-auto mb-4 flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-success" />
          </div>
          <h3 className="font-display text-xl font-bold text-frost-white mb-2">אין תרגילים לחזרה!</h3>
          <p className="text-sm text-frost-white/40">כל התשובות שלך נכונות. כל הכבוד!</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            חזרה לספרייה
          </button>
        </div>
      </main>
    )
  }

  // All reviewed
  if (currentIndex >= reviewExercises.length) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 text-center py-20">
        <div className="w-20 h-20 rounded-3xl bg-success/10 mx-auto mb-4 flex items-center justify-center animate-fade-in">
          <RotateCcw className="w-10 h-10 text-success" />
        </div>
        <h3 className="font-display text-xl font-bold text-frost-white mb-2 animate-fade-in">סיימת חזרה!</h3>
        <p className="text-sm text-frost-white/40 animate-fade-in">תיקנת {completed} תרגילים</p>
        <button
          onClick={() => navigate('/home')}
          className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 transition-opacity animate-fade-in"
        >
          חזרה לספרייה
        </button>
      </main>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-bg-base/90 backdrop-blur-lg px-4 py-3 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-frost-white/40" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-3 h-3 text-gold" />
              <span className="text-xs text-frost-white/40">חזרה</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-l from-gold to-warning transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-frost-white/30">{currentIndex + 1}/{reviewExercises.length}</span>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {current && (
          <ExerciseRouter
            key={currentIndex}
            exercise={current}
            onAnswer={handleAnswer}
            disabled={!!feedback}
          />
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <FeedbackPanel
          correct={feedback.correct}
          explanation={feedback.explanation}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}
