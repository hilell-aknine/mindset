import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { ArrowRight, Lock, Check, Play, Clock, Star, Zap } from 'lucide-react'
import PurchaseModal from '../components/modals/PurchaseModal'
import AICoachButton from '../components/ai/AICoachButton'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'

const BOOKS = { 'strengths-finder': strengthsFinder, 'atomic-habits': atomicHabits, 'happy-chemicals': happyChemicals, 'next-five-moves': nextFiveMoves }

const TYPE_ICONS = {
  'multiple-choice': '🎯',
  'fill-blank': '✏️',
  'order': '🔢',
  'compare': '⚖️',
  'match': '🔗',
  'improve': '💡',
  'identify': '🔍',
}

export default function BookPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { player } = usePlayer()
  const book = BOOKS[slug]
  const [showPurchase, setShowPurchase] = useState(false)

  if (!book) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-frost-white/50">הספר לא נמצא</p>
      </main>
    )
  }

  const isChapterUnlocked = (chapterIndex) => {
    if (chapterIndex === 0) return true
    if (player.isPremium || player.premiumBooks.includes(slug)) return true
    return false
  }

  const isLessonCompleted = (chapterIndex, lessonIndex) => {
    return !!player.completedLessons[`${slug}:${chapterIndex}:${lessonIndex}`]
  }

  const getChapterProgress = (chapter) => {
    const total = chapter.lessons.length
    const completed = chapter.lessons.filter((_, li) =>
      isLessonCompleted(chapter.orderIndex, li)
    ).length
    return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 }
  }

  // Find "continue" lesson — first uncompleted lesson
  const continueTarget = useMemo(() => {
    for (const chapter of book.chapters) {
      if (!isChapterUnlocked(chapter.orderIndex)) continue
      for (let li = 0; li < chapter.lessons.length; li++) {
        if (!isLessonCompleted(chapter.orderIndex, li)) {
          return { ci: chapter.orderIndex, li, lesson: chapter.lessons[li], chapter }
        }
      }
    }
    return null
  }, [book, player.completedLessons])

  // Count exercise types in a lesson
  const getLessonTypes = (lesson) => {
    const types = new Set(lesson.exercises.map(e => e.type))
    return [...types].map(t => TYPE_ICONS[t] || '📝').slice(0, 4)
  }

  // Book overall stats
  const totalLessons = book.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const completedLessons = book.chapters.reduce((acc, ch) =>
    acc + ch.lessons.filter((_, li) => isLessonCompleted(ch.orderIndex, li)).length, 0)
  const bookProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 overflow-hidden">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-4 animate-fade-in">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-frost-white">{book.title}</h2>
          <p className="text-xs text-frost-white/40">{book.author}</p>
        </div>
        <span className="text-3xl">{book.icon}</span>
      </div>

      {/* Book progress bar */}
      <div className="glass-card p-3 mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${bookProgress === 100 ? 'text-gold fill-gold' : 'text-frost-white/30'}`} />
            <span className="text-xs text-frost-white/60">{completedLessons}/{totalLessons} שיעורים</span>
          </div>
          <span className="text-xs font-bold text-gold">{bookProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-700 relative"
            style={{ width: `${bookProgress}%` }}
          >
            <div className="absolute inset-0 progress-shimmer rounded-full" />
          </div>
        </div>
      </div>

      {/* Continue button */}
      {continueTarget && (
        <button
          onClick={() => navigate(`/lesson/${slug}/${continueTarget.ci}/${continueTarget.li}`)}
          className="w-full glass-card p-4 mb-6 flex items-center gap-3 border-gold/15 hover:border-gold/30 transition-all animate-fade-in group"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-gold fill-gold" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-bold text-frost-white">המשך ללמוד</p>
            <p className="text-[10px] text-frost-white/40 mt-0.5">
              {continueTarget.chapter.title} — {continueTarget.lesson.title}
            </p>
          </div>
          <div className="flex items-center gap-1 text-gold/50">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px]">~{continueTarget.lesson.exercises.length * 30}שנ</span>
          </div>
        </button>
      )}

      {/* Chapters path */}
      <div className="relative">
        <div className="absolute right-7 top-0 bottom-0 w-0.5 bg-white/5" />

        <div className="space-y-4">
          {book.chapters.map((chapter, ci) => {
            const unlocked = isChapterUnlocked(ci)
            const progress = getChapterProgress(chapter)

            return (
              <div
                key={ci}
                className="animate-fade-in"
                style={{ animationDelay: `${0.15 + ci * 0.08}s` }}
              >
                {/* Chapter header */}
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    progress.percent === 100
                      ? 'bg-success/20 text-success'
                      : unlocked
                        ? 'bg-gradient-to-br from-deep-petrol to-dusty-aqua text-frost-white'
                        : 'bg-white/5 text-frost-white/20'
                  }`}>
                    {progress.percent === 100 ? <Check className="w-6 h-6" /> :
                     !unlocked ? <Lock className="w-5 h-5" /> : chapter.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${unlocked ? 'text-frost-white' : 'text-frost-white/30'}`}>
                        {chapter.title}
                      </h3>
                      {progress.percent === 100 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[8px] font-bold">
                          הושלם
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gold transition-all"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-frost-white/30">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                {unlocked && (
                  <div className="mr-14 space-y-2">
                    {chapter.lessons.map((lesson, li) => {
                      const completed = isLessonCompleted(ci, li)
                      const types = getLessonTypes(lesson)

                      return (
                        <button
                          key={li}
                          onClick={() => navigate(`/lesson/${slug}/${ci}/${li}`)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all ${
                            completed
                              ? 'bg-success/10 border border-success/20 hover:bg-success/15'
                              : 'glass-card hover:border-gold/20'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            completed ? 'bg-success/20' : 'bg-white/5'
                          }`}>
                            {completed ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Play className="w-4 h-4 text-frost-white/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm block ${completed ? 'text-success' : 'text-frost-white/70'}`}>
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-frost-white/25">
                                {lesson.exercises.length} תרגילים
                              </span>
                              <span className="text-frost-white/10">·</span>
                              <span className="text-[10px]">{types.join('')}</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Locked chapter CTA */}
                {!unlocked && (
                  <button
                    onClick={() => setShowPurchase(true)}
                    className="mr-14 w-[calc(100%-3.5rem)] glass-card p-4 flex items-center gap-3 border-gold/10 hover:border-gold/30 transition-colors"
                  >
                    <Lock className="w-4 h-4 text-gold/60" />
                    <p className="text-xs text-frost-white/30">
                      פרק נעול — לחצו לרכישת הספר המלא
                    </p>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Coach floating button */}
      <AICoachButton bookSlug={slug} systemPrompt={book.systemPrompt} />

      {/* Purchase modal */}
      {showPurchase && (
        <PurchaseModal bookSlug={slug} onClose={() => setShowPurchase(false)} />
      )}
    </main>
  )
}
