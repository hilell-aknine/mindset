import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { BookOpen, Trophy, Flame, RotateCcw, BarChart2, Settings } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'

const BOOKS = [strengthsFinder]

export default function HomePage() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  const reviewCount = (player.reviewQueue || []).length

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 overflow-hidden">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in">
        <h2 className="font-display text-2xl font-bold text-frost-white mb-1">
          שלום! 👋
        </h2>
        <p className="text-frost-white/50 text-sm">
          מה תרצה ללמוד היום?
        </p>
      </div>

      {/* Streak banner */}
      {player.currentStreak > 1 && (
        <div className="glass-card p-4 mb-6 flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-frost-white">רצף של {player.currentStreak} ימים!</p>
            <p className="text-xs text-frost-white/40">המשך ללמוד כדי לשמור על הרצף</p>
          </div>
        </div>
      )}

      {/* Books grid */}
      <div className="grid gap-4">
        {BOOKS.map(book => {
          const totalLessons = book.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
          const completedCount = book.chapters.reduce((acc, ch) =>
            acc + ch.lessons.filter((_, li) =>
              player.completedLessons[`${book.slug}:${ch.orderIndex}:${li}`]
            ).length, 0)
          const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

          return (
            <button
              key={book.slug}
              onClick={() => navigate(`/book/${book.slug}`)}
              className="glass-card p-5 flex items-center gap-4 text-right hover:border-gold/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                {book.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-frost-white truncate">{book.title}</h3>
                <p className="text-xs text-frost-white/40 mt-0.5">{book.author}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-frost-white/40">{Math.round(progress)}%</span>
                </div>
              </div>
              <BookOpen className="w-5 h-5 text-frost-white/20 group-hover:text-gold transition-colors shrink-0" />
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {/* Review */}
        <button
          onClick={() => navigate('/review')}
          className="glass-card p-3 text-center hover:border-gold/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
            <RotateCcw className="w-4 h-4 text-warning" />
          </div>
          <p className="text-xs text-frost-white/60">חזרה</p>
          {reviewCount > 0 && (
            <span className="text-[9px] text-gold font-bold">{reviewCount} תרגילים</span>
          )}
        </button>

        {/* Stats */}
        <button
          onClick={() => navigate('/stats')}
          className="glass-card p-3 text-center hover:border-gold/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-dusty-aqua/10 flex items-center justify-center mx-auto mb-2">
            <BarChart2 className="w-4 h-4 text-dusty-aqua" />
          </div>
          <p className="text-xs text-frost-white/60">סטטיסטיקות</p>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="glass-card p-3 text-center hover:border-gold/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-frost-white/5 flex items-center justify-center mx-auto mb-2">
            <Settings className="w-4 h-4 text-frost-white/40" />
          </div>
          <p className="text-xs text-frost-white/60">הגדרות</p>
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="glass-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-2xl font-bold text-gold">{player.xp}</p>
          <p className="text-[10px] text-frost-white/40 mt-1">XP</p>
        </div>
        <div className="glass-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <p className="text-2xl font-bold text-success">{player.totalCorrect}</p>
          <p className="text-[10px] text-frost-white/40 mt-1">תשובות נכונות</p>
        </div>
        <div className="glass-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-2xl font-bold text-dusty-aqua">{Object.keys(player.completedLessons).length}</p>
          <p className="text-[10px] text-frost-white/40 mt-1">שיעורים</p>
        </div>
      </div>
    </main>
  )
}
