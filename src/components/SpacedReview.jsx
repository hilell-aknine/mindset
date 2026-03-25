import { useState, useMemo, useCallback } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { useSound } from '../hooks/useSound'
import { SR_INTERVALS, XP_SR_REVIEW } from '../config/constants'
import ExerciseRouter from './exercises/ExerciseRouter'
import FeedbackPanel from './feedback/FeedbackPanel'
import { Brain, X, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'
import mindsetBook from '../data/books/mindset-book.json'
import indistractable from '../data/books/indistractable.json'

const BOOKS = { 'strengths-finder': strengthsFinder, 'atomic-habits': atomicHabits, 'happy-chemicals': happyChemicals, 'next-five-moves': nextFiveMoves, 'mindset-book': mindsetBook, 'indistractable': indistractable }

export default function SpacedReview({ onClose }) {
  const { player, handleSRReview, getDueSRItems, onWrongAnswer } = usePlayer()
  const { play } = useSound()
  const [feedback, setFeedback] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [totalXP, setTotalXP] = useState(0)

  const dueItems = useMemo(() => getDueSRItems(), [player.spacedReviewQueue])

  const currentItem = dueItems[currentIdx]
  const exercise = useMemo(() => {
    if (!currentItem) return null
    const book = BOOKS[currentItem.bookSlug]
    if (!book) return null
    const chapter = book.chapters[currentItem.chapterIndex]
    if (!chapter) return null
    const lesson = chapter.lessons[currentItem.lessonIndex]
    if (!lesson) return null
    return {
      ...lesson.exercises[currentItem.exerciseIndex],
      _srItem: currentItem,
      _bookTitle: book.title,
      _bookIcon: book.icon,
    }
  }, [currentItem])

  // Find the actual index in the full spacedReviewQueue
  const findQueueIndex = useCallback((item) => {
    return (player.spacedReviewQueue || []).findIndex(q =>
      q.bookSlug === item.bookSlug &&
      q.chapterIndex === item.chapterIndex &&
      q.lessonIndex === item.lessonIndex &&
      q.exerciseIndex === item.exerciseIndex
    )
  }, [player.spacedReviewQueue])

  const handleAnswer = useCallback((isCorrect, explanation) => {
    if (isCorrect) {
      play('correct')
      const interval = currentItem.interval || 0
      const xpBonus = Math.round(XP_SR_REVIEW * SR_INTERVALS[Math.min(interval, SR_INTERVALS.length - 1)].xpMultiplier)
      setTotalXP(prev => prev + xpBonus)
      setFeedback({ correct: true, explanation, xpBonus })
    } else {
      play('wrong')
      onWrongAnswer()
      setFeedback({ correct: false, explanation })
    }
  }, [currentItem, play, onWrongAnswer])

  const handleContinue = useCallback(() => {
    const queueIdx = findQueueIndex(currentItem)
    handleSRReview(queueIdx, feedback?.correct)
    setFeedback(null)
    if (feedback?.correct) setCompleted(c => c + 1)
    setCurrentIdx(i => i + 1)
  }, [currentItem, feedback, findQueueIndex, handleSRReview])

  // Done state
  if (!exercise || currentIdx >= dueItems.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm animate-bounce-in">
          <div className="glass-card p-6 border-gold/20 bg-bg-base/95 backdrop-blur-xl text-center">
            <button onClick={onClose} className="absolute top-4 left-4 text-frost-white/40 hover:text-frost-white" aria-label="סגור">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-display text-2xl font-bold text-frost-white mb-2">
              {completed > 0 ? 'כל הכבוד!' : 'אין חזרות היום'}
            </h3>
            {completed > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 text-gold font-bold text-sm mb-3 animate-elastic-in">
                <Sparkles className="w-4 h-4" />
                +{totalXP} XP
              </div>
            )}
            <p className="text-frost-white/50 text-sm mb-4">
              {completed > 0
                ? `תיקנת ${completed} תרגילים. הזיכרון שלך מתחזק!`
                : 'חזור מאוחר יותר כשיש תרגילים לחזור עליהם.'}
            </p>

            {/* Forgetting curve visualization */}
            {completed > 0 && (
              <div className="glass-card p-3 mb-4 border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3 h-3 text-dusty-aqua" />
                  <span className="text-[10px] font-bold text-frost-white/50">עקומת השכחה</span>
                </div>
                <div className="flex items-end gap-1 h-10 justify-center">
                  {SR_INTERVALS.map((sr, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-6 rounded-t transition-all ${i <= 1 ? 'bg-dusty-aqua/60' : 'bg-white/10'}`}
                        style={{ height: `${40 - i * 7}px` }}
                      />
                      <span className="text-[8px] text-frost-white/30">{sr.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-frost-white/25 mt-2">ככל שהמרווח גדל — הזיכרון מתחזק</p>
              </div>
            )}

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

  const srInterval = SR_INTERVALS[Math.min(currentItem.interval || 0, SR_INTERVALS.length - 1)]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[85dvh] flex flex-col animate-slide-up">
        <div className="glass-card p-5 sm:p-6 border-dusty-aqua/20 bg-bg-base/95 backdrop-blur-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dusty-aqua/15 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-dusty-aqua" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-frost-white">חזרה מרווחת</h3>
                  <p className="text-[10px] text-frost-white/40">
                    {exercise._bookIcon} {exercise._bookTitle} · מרווח: {srInterval.label}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-frost-white/40 hover:text-frost-white" aria-label="סגור">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-dusty-aqua to-deep-petrol transition-all"
                  style={{ width: `${((currentIdx) / dueItems.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-frost-white/30">{currentIdx + 1}/{dueItems.length}</span>
            </div>

            {/* XP multiplier badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-dusty-aqua/10 border border-dusty-aqua/20">
                <Sparkles className="w-3 h-3 text-dusty-aqua" />
                <span className="text-[10px] text-dusty-aqua font-bold">
                  x{srInterval.xpMultiplier} XP (מרווח {srInterval.label})
                </span>
              </div>
            </div>

            <ExerciseRouter exercise={exercise} onAnswer={handleAnswer} disabled={!!feedback} />
          </div>

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
