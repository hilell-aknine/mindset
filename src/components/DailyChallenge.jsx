import { useState, useMemo } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { useSound } from '../hooks/useSound'
import { XP_DAILY_CHALLENGE } from '../config/constants'
import ExerciseRouter from './exercises/ExerciseRouter'
import FeedbackPanel from './feedback/FeedbackPanel'
import { Flame, Trophy, X, Sparkles } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'

const ALL_BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves]

function getDailyExercise() {
  // Use date as seed for consistent daily exercise
  const today = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash |= 0
  }
  hash = Math.abs(hash)

  // Collect all exercises from all books
  const allExercises = []
  ALL_BOOKS.forEach(book => {
    book.chapters.forEach((chapter, ci) => {
      chapter.lessons.forEach((lesson, li) => {
        lesson.exercises.forEach((exercise, ei) => {
          allExercises.push({
            ...exercise,
            bookTitle: book.title,
            bookIcon: book.icon,
            chapterTitle: chapter.title,
          })
        })
      })
    })
  })

  return allExercises[hash % allExercises.length]
}

export default function DailyChallenge({ onClose }) {
  const { player, updatePlayer } = usePlayer()
  const { play } = useSound()
  const [feedback, setFeedback] = useState(null)
  const [completed, setCompleted] = useState(false)

  const exercise = useMemo(() => getDailyExercise(), [])
  const today = new Date().toDateString()
  const alreadyCompleted = player.dailyChallengeCompleted === today

  const handleAnswer = (isCorrect, explanation) => {
    if (isCorrect) {
      play('correct')
      setFeedback({ correct: true, explanation })
    } else {
      play('wrong')
      setFeedback({ correct: false, explanation })
    }
  }

  const handleContinue = () => {
    if (feedback?.correct) {
      // Award XP and mark as completed
      updatePlayer(prev => ({
        ...prev,
        xp: prev.xp + XP_DAILY_CHALLENGE,
        dailyChallengeCompleted: today,
        dailyChallengesCompleted: (prev.dailyChallengesCompleted || 0) + 1,
      }))
      play('lessonComplete')
      setCompleted(true)
    } else {
      // Wrong answer — let them try again
      setFeedback(null)
    }
  }

  if (alreadyCompleted || completed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm animate-bounce-in">
          <div className="glass-card p-6 border-gold/20 bg-bg-base/95 backdrop-blur-xl text-center">
            <button onClick={onClose} className="absolute top-4 left-4 text-frost-white/40 hover:text-frost-white">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-display text-2xl font-bold text-frost-white mb-2">
              {completed ? 'מצוין!' : 'כבר סיימת היום!'}
            </h3>
            {completed && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold font-bold text-sm mb-3">
                <Sparkles className="w-4 h-4" />
                +{XP_DAILY_CHALLENGE} XP
              </div>
            )}
            <p className="text-frost-white/50 text-sm mb-4">
              חזור מחר לאתגר חדש!
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 transition-all"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[85dvh] overflow-y-auto animate-slide-up">
        <div className="glass-card p-5 sm:p-6 border-gold/20 bg-bg-base/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <Flame className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-frost-white">אתגר יומי</h3>
                <p className="text-[10px] text-frost-white/40">
                  {exercise.bookIcon} {exercise.bookTitle} · {exercise.chapterTitle}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-frost-white/40 hover:text-frost-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prize */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/20 mb-5">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="text-xs text-gold font-medium">פרס: +{XP_DAILY_CHALLENGE} XP</span>
          </div>

          {/* Exercise */}
          <ExerciseRouter
            exercise={exercise}
            onAnswer={handleAnswer}
            disabled={!!feedback}
          />

          {/* Feedback */}
          {feedback && (
            <div className="mt-4">
              <FeedbackPanel
                correct={feedback.correct}
                explanation={feedback.explanation}
                onContinue={handleContinue}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
