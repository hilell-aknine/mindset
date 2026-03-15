import { useState, useMemo, useCallback } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { useSound } from '../hooks/useSound'
import { XP_DAILY_CHALLENGE, DAILY_CHALLENGE_COUNT, XP_DAILY_PERFECT } from '../config/constants'
import ExerciseRouter from './exercises/ExerciseRouter'
import FeedbackPanel from './feedback/FeedbackPanel'
import { Flame, Trophy, X, Sparkles, Calendar, Zap, Star } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'
import mindsetBook from '../data/books/mindset-book.json'

const ALL_BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves, mindsetBook]

function getDailyExercises(count = DAILY_CHALLENGE_COUNT) {
  const today = new Date().toDateString()
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash |= 0
  }
  hash = Math.abs(hash)

  const allExercises = []
  ALL_BOOKS.forEach(book => {
    book.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        lesson.exercises.forEach((exercise) => {
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

  // Select `count` exercises spread across the pool using hash
  const selected = []
  const step = Math.max(1, Math.floor(allExercises.length / count))
  for (let i = 0; i < count; i++) {
    const idx = (hash + i * step) % allExercises.length
    selected.push(allExercises[idx])
  }
  return selected
}

export default function DailyChallenge({ onClose }) {
  const { player, updatePlayer } = usePlayer()
  const { play } = useSound()
  const [feedback, setFeedback] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [completed, setCompleted] = useState(false)

  const exercises = useMemo(() => getDailyExercises(), [])
  const today = new Date().toDateString()
  const alreadyCompleted = player.dailyChallengeCompleted === today
  const challengeStreak = player.dailyChallengeStreak || 0
  const challengeCount = player.dailyChallengesCompleted || 0

  const exercise = exercises[currentIdx]
  const progress = exercises.length > 0 ? (currentIdx / exercises.length) * 100 : 0

  const handleAnswer = useCallback((isCorrect, explanation) => {
    if (isCorrect) {
      play('correct')
      setFeedback({ correct: true, explanation })
    } else {
      play('wrong')
      setMistakes(m => m + 1)
      setFeedback({ correct: false, explanation })
    }
  }, [play])

  const handleContinue = useCallback(() => {
    if (feedback?.correct) {
      // Move to next question or finish
      if (currentIdx + 1 >= exercises.length) {
        const isPerfect = mistakes === 0
        const baseXP = XP_DAILY_CHALLENGE
        const perfectBonus = isPerfect ? XP_DAILY_PERFECT : 0
        const totalXP = baseXP + perfectBonus

        updatePlayer(prev => {
          // Check if yesterday was also a daily challenge day
          const yesterday = new Date(Date.now() - 86400000).toDateString()
          const wasYesterday = prev.dailyChallengeCompleted === yesterday
          const newStreak = wasYesterday ? (prev.dailyChallengeStreak || 0) + 1 : 1

          return {
            ...prev,
            xp: prev.xp + totalXP,
            dailyChallengeCompleted: today,
            dailyChallengesCompleted: (prev.dailyChallengesCompleted || 0) + 1,
            dailyChallengeStreak: newStreak,
            dailyChallengePerfects: isPerfect ? (prev.dailyChallengePerfects || 0) + 1 : (prev.dailyChallengePerfects || 0),
          }
        })
        play('lessonComplete')
        setCompleted(true)
      } else {
        setFeedback(null)
        setCurrentIdx(i => i + 1)
      }
    } else {
      // Wrong answer — let them try again
      setFeedback(null)
    }
  }, [feedback, currentIdx, exercises.length, mistakes, updatePlayer, today, play])

  // Completed or already done state
  if (alreadyCompleted || completed) {
    const isPerfect = completed && mistakes === 0
    const totalXP = completed ? XP_DAILY_CHALLENGE + (isPerfect ? XP_DAILY_PERFECT : 0) : 0
    const newStreak = completed ? (challengeStreak + 1) : challengeStreak

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm animate-bounce-in">
          <div className="glass-card p-6 border-gold/20 bg-bg-base/95 backdrop-blur-xl text-center">
            <button onClick={onClose} className="absolute top-4 left-4 text-frost-white/40 hover:text-frost-white" aria-label="סגור">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-4">
              {isPerfect ? <Star className="w-8 h-8 text-gold fill-gold" /> : <Trophy className="w-8 h-8 text-success" />}
            </div>
            <h3 className="font-display text-2xl font-bold text-frost-white mb-2">
              {isPerfect ? 'מושלם!' : completed ? 'מצוין!' : 'כבר סיימת היום!'}
            </h3>

            {completed && (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold font-bold text-sm mb-2 animate-elastic-in">
                  <Sparkles className="w-4 h-4" />
                  +{totalXP} XP
                </div>
                {isPerfect && (
                  <p className="text-xs text-gold font-bold mb-1 animate-fade-in">
                    +{XP_DAILY_PERFECT} XP בונוס מושלם!
                  </p>
                )}
              </>
            )}

            {/* Challenge streak */}
            {newStreak > 1 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-bold mb-3">
                <Flame className="w-3 h-3" />
                {newStreak} אתגרים ברצף!
              </div>
            )}

            <p className="text-frost-white/50 text-sm mb-2">
              חזור מחר לאתגר חדש!
            </p>
            <p className="text-[10px] text-frost-white/25 mb-4">
              <Calendar className="w-3 h-3 inline ml-1" />
              השלמת {challengeCount + (completed ? 1 : 0)} אתגרים יומיים
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 transition-all"
            >
              המשך
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[85dvh] flex flex-col animate-slide-up">
        <div className="glass-card p-5 sm:p-6 border-gold/20 bg-bg-base/95 backdrop-blur-xl flex flex-col overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center animate-heartbeat">
                  <Flame className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-frost-white">אתגר יומי</h3>
                  <p className="text-[10px] text-frost-white/40">
                    {exercise.bookIcon} {exercise.bookTitle} · {exercise.chapterTitle}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-frost-white/40 hover:text-frost-white" aria-label="סגור אתגר">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-warning transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-frost-white/30">{currentIdx + 1}/{exercises.length}</span>
            </div>

            {/* Prize + streak info */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/20">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="text-xs text-gold font-medium">+{XP_DAILY_CHALLENGE} XP</span>
                <span className="text-[9px] text-gold/50">| מושלם: +{XP_DAILY_PERFECT}</span>
              </div>
              {challengeStreak > 0 && (
                <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-warning/10 border border-warning/20">
                  <Flame className="w-3 h-3 text-warning" />
                  <span className="text-[10px] text-warning font-bold">{challengeStreak}</span>
                </div>
              )}
            </div>

            {/* Stars for questions answered */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {exercises.map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 transition-all ${
                    i < currentIdx
                      ? 'text-gold fill-gold'
                      : i === currentIdx
                        ? 'text-gold/50 animate-pulse'
                        : 'text-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Exercise */}
            <ExerciseRouter
              key={currentIdx}
              exercise={exercise}
              onAnswer={handleAnswer}
              disabled={!!feedback}
            />
          </div>

          {/* Feedback — outside scroll area */}
          {feedback && (
            <div className="mt-4 shrink-0">
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
