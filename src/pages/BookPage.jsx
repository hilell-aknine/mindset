import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { ArrowRight, Lock, Check, Play, Clock, Star, Zap, Trophy, RotateCcw, FileText } from 'lucide-react'
import AICoachButton from '../components/ai/AICoachButton'
import ChapterAudioSummary from '../components/ChapterAudioSummary'
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
import awakenTheGiant from '../data/books/awaken-the-giant.json'
import resultantIntelligence from '../data/books/resultant-intelligence.json'
import positiveIntelligence from '../data/books/positive-intelligence.json'
import richDadPoorDad from '../data/books/rich-dad-poor-dad.json'
import deepWork from '../data/books/deep-work.json'

const BOOKS = { 'strengths-finder': strengthsFinder, 'atomic-habits': atomicHabits, 'happy-chemicals': happyChemicals, 'next-five-moves': nextFiveMoves, 'mindset-book': mindsetBook, 'indistractable': indistractable, 'grit': grit, 'power-of-now': powerOfNow, 'seven-habits': sevenHabits, 'thinking-fast-slow': thinkingFastSlow, 'psychology-of-money': psychologyOfMoney, 'millionaire-next-door': millionaireNextDoor, 'think-and-grow-rich': thinkAndGrowRich, 'blue-ocean-strategy': blueOceanStrategy, 'three-second-rule': threeSecondRule, 'awaken-the-giant': awakenTheGiant, 'resultant-intelligence': resultantIntelligence, 'positive-intelligence': positiveIntelligence, 'rich-dad-poor-dad': richDadPoorDad, 'deep-work': deepWork }

const BOOK_COVERS = {
  'strengths-finder': '/backgrounds/raw-diamond.png',
  'atomic-habits': '/backgrounds/gold-dominos.png',
  'happy-chemicals': '/backgrounds/happy-molecule.png',
  'next-five-moves': '/backgrounds/chess-knight.png',
  'mindset-book': '/backgrounds/brain-lightbulb.png',
  'indistractable': '/backgrounds/focus-shield.png',
}

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
  if (!book) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-frost-white">הספר לא נמצא</h1>
        <p className="text-frost-white/50 text-sm">ייתכן שהספר הוסר או שהקישור שגוי.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-frost-white font-semibold min-h-[44px] transition-colors"
          >
            חזרה
          </button>
          <button
            onClick={() => navigate('/home')}
            className="px-5 py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-semibold min-h-[44px] hover:opacity-90 transition-opacity"
          >
            לעמוד הבית
          </button>
        </div>
      </main>
    )
  }

  const isChapterUnlocked = () => true

  const isLessonCompleted = (chapterIndex, lessonIndex) => {
    return !!player.completedLessons?.[`${slug}:${chapterIndex}:${lessonIndex}`]
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

  // Estimate time for a lesson (30s per exercise)
  const getLessonTime = (lesson) => {
    const seconds = lesson.exercises.length * 30
    return seconds >= 60 ? `${Math.round(seconds / 60)} דק'` : `${seconds} שנ'`
  }

  // Book overall stats
  const totalLessons = book.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const completedLessons = book.chapters.reduce((acc, ch) =>
    acc + ch.lessons.filter((_, li) => isLessonCompleted(ch.orderIndex, li)).length, 0)
  const bookProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const totalExercises = book.chapters.reduce((acc, ch) =>
    acc + ch.lessons.reduce((a, l) => a + l.exercises.length, 0), 0)

  // Review items for this book
  const reviewCount = (player.reviewQueue || []).filter(r => r.bookSlug === slug).length

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-24">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-4 animate-fade-in">
        <button
          onClick={() => navigate('/home')}
          className="p-2.5 -m-1 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors"
          aria-label="חזרה לדף הבית"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-frost-white">{book.title}</h1>
          <p className="text-xs text-frost-white/40">{book.author}</p>
        </div>
        {BOOK_COVERS[slug] ? (
          <img src={BOOK_COVERS[slug]} alt={book.title} className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <span className="text-3xl">{book.icon}</span>
        )}
      </div>

      {/* About this book */}
      {book.description && (
        <div className="glass-card p-4 mb-4 animate-fade-in text-right" style={{ animationDelay: '0.03s' }}>
          <p className="text-sm text-frost-white/70 leading-relaxed">{book.description}</p>
          {book.audience && (
            <p className="text-xs text-dusty-aqua mt-2 font-medium">{book.audience}</p>
          )}
        </div>
      )}

      {/* Book progress card with stats */}
      <div className="glass-card p-4 mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${bookProgress === 100 ? 'text-gold fill-gold' : 'text-frost-white/30'}`} />
            <span className="text-xs text-frost-white/60">{completedLessons}/{totalLessons} שיעורים</span>
          </div>
          <span className="text-xs font-bold text-gold">{bookProgress}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-700 relative"
            style={{ width: `${bookProgress}%` }}
          >
            <div className="absolute inset-0 progress-shimmer rounded-full" />
          </div>
        </div>
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-lg font-bold text-frost-white">{totalExercises}</p>
            <p className="text-[9px] text-frost-white/30">תרגילים</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-frost-white">{book.chapters.length}</p>
            <p className="text-[9px] text-frost-white/30">פרקים</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-frost-white">~{Math.round(totalExercises * 0.5)}</p>
            <p className="text-[9px] text-frost-white/30">דקות</p>
          </div>
        </div>
      </div>

      {/* Continue button */}
      {continueTarget && (
        <button
          onClick={() => navigate(`/lesson/${slug}/${continueTarget.ci}/${continueTarget.li}`)}
          className="w-full glass-card p-4 mb-4 flex items-center gap-3 border-gold/15 hover:border-gold/30 active:bg-white/5 active:scale-[0.98] transition-all animate-fade-in group animate-pulse-glow"
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
            <span className="text-[10px]">{getLessonTime(continueTarget.lesson)}</span>
          </div>
        </button>
      )}

      {/* Book completed banner */}
      {bookProgress === 100 && (
        <div className="glass-card p-4 mb-4 flex items-center gap-3 border-success/20 bg-success/5 animate-fade-in">
          <Trophy className="w-8 h-8 text-success" />
          <div className="flex-1">
            <p className="text-sm font-bold text-success">סיימת את הספר!</p>
            <p className="text-[10px] text-frost-white/40">כל הכבוד! חזור על שיעורים כדי לשפר את הציון.</p>
          </div>
        </div>
      )}

      {/* Next book CTA when 100% complete */}
      {bookProgress === 100 && (() => {
        const allSlugs = Object.keys(BOOKS)
        const nextSlug = allSlugs.find(s => {
          if (s === slug) return false
          const b = BOOKS[s]
          const total = b.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
          const done = b.chapters.reduce((acc, ch) =>
            acc + ch.lessons.filter((_, li) => player.completedLessons?.[`${s}:${ch.orderIndex}:${li}`]).length, 0)
          return done < total
        })
        if (!nextSlug) return null
        const nextBook = BOOKS[nextSlug]
        return (
          <button
            onClick={() => navigate(`/book/${nextSlug}`)}
            className="w-full glass-card p-4 mb-4 flex items-center gap-3 border-gold/15 hover:border-gold/30 transition-all animate-fade-in group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              {nextBook.icon}
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-bold text-gold">ספר הבא</p>
              <p className="text-[10px] text-frost-white/40 mt-0.5">{nextBook.title}</p>
            </div>
            <Play className="w-5 h-5 text-gold/50" />
          </button>
        )
      })()}

      {/* Review reminder */}
      {reviewCount > 0 && (
        <button
          onClick={() => navigate('/review')}
          className="w-full glass-card p-3 mb-4 flex items-center gap-3 border-warning/10 hover:border-warning/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.12s' }}
        >
          <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-warning" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs font-bold text-warning">{reviewCount} תרגילים לחזרה</p>
            <p className="text-[10px] text-frost-white/30">תשובות שגויות מהספר הזה</p>
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
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      progress.percent === 100
                        ? 'bg-success/20 text-success'
                        : unlocked
                          ? 'bg-gradient-to-br from-deep-petrol to-dusty-aqua text-frost-white'
                          : 'bg-white/5 text-frost-white/20'
                    }`}
                    aria-label={chapter.title}
                    role="img"
                  >
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
                      const isContinue = continueTarget?.ci === ci && continueTarget?.li === li

                      return (
                        <button
                          key={li}
                          onClick={() => navigate(`/lesson/${slug}/${ci}/${li}`)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-right transition-all press-scale min-h-[56px] ${
                            completed
                              ? 'bg-success/10 border border-success/20 hover:bg-success/15'
                              : isContinue
                                ? 'glass-card border-gold/20 hover:border-gold/30'
                                : 'glass-card hover:border-white/15'
                          }`}
                        >
                          <div className={`w-11 h-11 p-2.5 -m-1 rounded-xl flex items-center justify-center shrink-0 ${
                            completed ? 'bg-success/20' : isContinue ? 'bg-gold/15' : 'bg-white/5'
                          }`}>
                            {completed ? (
                              <Check className="w-5 h-5 text-success" />
                            ) : (
                              <Play className={`w-5 h-5 ${isContinue ? 'text-gold fill-gold' : 'text-frost-white/40'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm block ${
                              completed ? 'text-success' : isContinue ? 'text-frost-white' : 'text-frost-white/70'
                            }`}>
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-frost-white/25">
                                {lesson.exercises.length} תרגילים
                              </span>
                              <span className="text-frost-white/10">·</span>
                              <span className="text-[10px] text-frost-white/25">{getLessonTime(lesson)}</span>
                            </div>
                          </div>
                          {completed && (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-gold fill-gold" />
                            </div>
                          )}
                        </button>
                      )
                    })}

                    {/* Audio summary — visible when chapter is 100% complete */}
                    {progress.percent === 100 && (
                      <ChapterAudioSummary
                        bookSlug={slug}
                        chapterIndex={ci}
                        chapterTitle={chapter.title}
                      />
                    )}
                  </div>
                )}

              </div>
            )
          })}
        </div>
      </div>

      {/* Workbook link */}
      {(
        <button
          onClick={() => navigate(`/workbook/${slug}`)}
          className="w-full glass-card p-3 mt-4 flex items-center gap-3 border-dusty-aqua/10 hover:border-dusty-aqua/25 transition-all animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="w-8 h-8 rounded-lg bg-dusty-aqua/15 flex items-center justify-center">
            <FileText className="w-4 h-4 text-dusty-aqua" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs font-bold text-frost-white/70">חוברת עבודה</p>
            <p className="text-[10px] text-frost-white/30">הדפס תרגילים לתרגול נוסף</p>
          </div>
        </button>
      )}

      {/* AI Coach floating button */}
      <AICoachButton bookSlug={slug} bookTitle={book.title} systemPrompt={book.systemPrompt} />

    </main>
  )
}
