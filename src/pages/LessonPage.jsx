import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useToast } from '../contexts/ToastContext'
import ExerciseRouter from '../components/exercises/ExerciseRouter'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import LessonComplete from '../components/feedback/LessonComplete'
import { X, Heart } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'

const BOOKS = { 'strengths-finder': strengthsFinder }

export default function LessonPage() {
  const { bookSlug, chapterIndex, lessonIndex } = useParams()
  const navigate = useNavigate()
  const { player, onCorrectAnswer, onWrongAnswer, completeLesson } = usePlayer()
  const toast = useToast()

  const book = BOOKS[bookSlug]
  const chapter = book?.chapters[parseInt(chapterIndex)]
  const lesson = chapter?.lessons[parseInt(lessonIndex)]
  const exercises = lesson?.exercises || []

  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState(null) // { correct, explanation }
  const [mistakes, setMistakes] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const currentExercise = exercises[currentIndex]
  const progress = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0

  const handleAnswer = useCallback((isCorrect, explanation) => {
    if (isCorrect) {
      onCorrectAnswer()
      setFeedback({ correct: true, explanation })
    } else {
      onWrongAnswer()
      setMistakes(m => m + 1)
      setFeedback({ correct: false, explanation })
    }
  }, [onCorrectAnswer, onWrongAnswer])

  const handleContinue = useCallback(() => {
    setFeedback(null)
    if (currentIndex + 1 >= exercises.length) {
      completeLesson(bookSlug, parseInt(chapterIndex), parseInt(lessonIndex), mistakes)
      setIsComplete(true)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, exercises.length, bookSlug, chapterIndex, lessonIndex, mistakes, completeLesson])

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
    </div>
  )
}
