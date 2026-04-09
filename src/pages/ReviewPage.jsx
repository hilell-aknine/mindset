import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useToast } from '../contexts/ToastContext'
import { useSound } from '../hooks/useSound'
import ExerciseRouter from '../components/exercises/ExerciseRouter'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import { ArrowRight, RotateCcw, PartyPopper, Trophy, BookOpen } from 'lucide-react'
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

const BOOKS = { 'strengths-finder': strengthsFinder, 'atomic-habits': atomicHabits, 'happy-chemicals': happyChemicals, 'next-five-moves': nextFiveMoves, 'mindset-book': mindsetBook, 'indistractable': indistractable, 'grit': grit, 'power-of-now': powerOfNow, 'seven-habits': sevenHabits, 'thinking-fast-slow': thinkingFastSlow, 'psychology-of-money': psychologyOfMoney, 'millionaire-next-door': millionaireNextDoor, 'think-and-grow-rich': thinkAndGrowRich, 'blue-ocean-strategy': blueOceanStrategy, 'three-second-rule': threeSecondRule }
const BOOKS_LIST = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves, mindsetBook, indistractable, grit, powerOfNow, sevenHabits, thinkingFastSlow, psychologyOfMoney, millionaireNextDoor, thinkAndGrowRich, blueOceanStrategy, threeSecondRule]

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
      // Remove from review queue + track reviews completed
      updatePlayer(prev => ({
        ...prev,
        reviewQueue: (prev.reviewQueue || []).filter((_, i) => i !== currentIndex),
        reviewsCompleted: (prev.reviewsCompleted || 0) + 1,
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

  // Find next unfinished lesson for suggestion
  const nextLesson = useMemo(() => {
    for (const book of BOOKS_LIST) {
      for (const chapter of book.chapters) {
        for (let li = 0; li < chapter.lessons.length; li++) {
          const key = `${book.slug}:${chapter.orderIndex}:${li}`
          if (!player.completedLessons?.[key]) {
            return { book, chapter, lessonIndex: li, lesson: chapter.lessons[li] }
          }
        }
      }
    }
    return null
  }, [player.completedLessons])

  // Empty state — differentiate new users from users who cleared their queue
  const hasEverCompleted = Object.keys(player.completedLessons || {}).length > 0
  if (reviewExercises.length === 0) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <button
            onClick={() => navigate('/home')}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors"
            aria-label="חזרה לדף הבית"
          >
            <ArrowRight className="w-5 h-5 text-frost-white/60" />
          </button>
          <h1 className="font-display text-xl font-bold text-frost-white">חזרה</h1>
        </div>
        <div className="text-center py-16 animate-fade-in">
          <img
            src="/backgrounds/firefly-jar.png"
            alt=""
            className="w-28 h-28 rounded-3xl object-cover mx-auto mb-4 shadow-lg shadow-gold/10"
          />
          <h3 className="font-display text-xl font-bold text-frost-white mb-2">
            {hasEverCompleted ? 'אין תרגילים לחזרה!' : 'תור החזרה ריק'}
          </h3>
          <p className="text-sm text-frost-white/40 mb-6">
            {hasEverCompleted
              ? 'כל התשובות שלך נכונות. כל הכבוד!'
              : 'השלם שיעורים כדי לבנות תור חזרה. כל תשובה שגויה תתווסף לכאן.'}
          </p>

          {nextLesson && (
            <button
              onClick={() => navigate(`/lesson/${nextLesson.book.slug}/${nextLesson.chapter.orderIndex}/${nextLesson.lessonIndex}`)}
              className="glass-card p-4 mx-auto max-w-xs flex items-center gap-3 text-right hover:border-gold/20 transition-all mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-lg">
                {nextLesson.book.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gold font-bold">המשך ללמוד</p>
                <p className="text-sm text-frost-white truncate">{nextLesson.lesson.title}</p>
                <p className="text-[10px] text-frost-white/30">{nextLesson.chapter.title}</p>
              </div>
              <BookOpen className="w-4 h-4 text-frost-white/30" />
            </button>
          )}

          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
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
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-success/10 mx-auto mb-4 flex items-center justify-center animate-bounce-in">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h3 className="font-display text-xl font-bold text-frost-white mb-2 animate-fade-in">סיימת חזרה!</h3>
          <p className="text-sm text-frost-white/40 mb-2 animate-fade-in">תיקנת {completed} תרגילים</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-bold mb-6 animate-fade-in">
            +{completed * 10} XP
          </div>

          {nextLesson && (
            <button
              onClick={() => navigate(`/lesson/${nextLesson.book.slug}/${nextLesson.chapter.orderIndex}/${nextLesson.lessonIndex}`)}
              className="glass-card p-4 mx-auto max-w-xs flex items-center gap-3 text-right hover:border-gold/20 transition-all mb-4 animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-lg">
                {nextLesson.book.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gold font-bold">המשך ללמוד</p>
                <p className="text-sm text-frost-white truncate">{nextLesson.lesson.title}</p>
              </div>
            </button>
          )}

          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            חזרה לספרייה
          </button>
        </div>
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
            className="p-2.5 -m-1 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors"
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
          <span className="text-xs text-frost-white/30">{Math.min(currentIndex + 1, reviewExercises.length)}/{reviewExercises.length}</span>
          {completed > 0 && (
            <span className="text-[10px] text-success font-bold">{completed} ✓</span>
          )}
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {current && (
          <>
            {/* Source info */}
            {current._meta && (
              <div className="flex items-center gap-2 mb-3 animate-fade-in">
                <span className="text-[10px] text-frost-white/25">
                  מתוך: {BOOKS[current._meta.bookSlug]?.title || current._meta.bookSlug}
                </span>
              </div>
            )}
            <ExerciseRouter
              key={currentIndex}
              exercise={current}
              onAnswer={handleAnswer}
              disabled={!!feedback}
            />
          </>
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
