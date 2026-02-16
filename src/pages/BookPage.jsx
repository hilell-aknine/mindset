import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { ArrowRight, Lock, Check, Play } from 'lucide-react'
import PurchaseModal from '../components/modals/PurchaseModal'
import AICoachButton from '../components/ai/AICoachButton'
import strengthsFinder from '../data/books/strengths-finder.json'

const BOOKS = { 'strengths-finder': strengthsFinder }

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

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <div>
          <h2 className="font-display text-xl font-bold text-frost-white">{book.title}</h2>
          <p className="text-xs text-frost-white/40">{book.author}</p>
        </div>
      </div>

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
                style={{ animationDelay: `${ci * 0.08}s` }}
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
                    <h3 className={`font-semibold text-sm ${unlocked ? 'text-frost-white' : 'text-frost-white/30'}`}>
                      {chapter.title}
                    </h3>
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
                          <span className={`text-sm ${completed ? 'text-success' : 'text-frost-white/70'}`}>
                            {lesson.title}
                          </span>
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
