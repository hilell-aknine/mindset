import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { LEVEL_NAMES, getXPProgress, LEVEL_THRESHOLDS } from '../config/constants'
import { ACHIEVEMENTS } from '../lib/achievements'
import { getActiveEvent, WEEKLY_GOALS, STREAK_MILESTONES } from '../lib/events'
import { ArrowRight, Trophy, Target, Flame, Brain, Heart, Zap, TrendingUp, BookOpen, Calendar, Award } from 'lucide-react'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'

const BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves]

// Simple bar chart component
function ProgressChart({ books, completedLessons }) {
  return (
    <div className="space-y-3">
      {books.map(book => {
        const total = book.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
        const completed = book.chapters.reduce((acc, ch) =>
          acc + ch.lessons.filter((_, li) =>
            completedLessons[`${book.slug}:${ch.orderIndex}:${li}`]
          ).length, 0)
        const pct = total > 0 ? (completed / total) * 100 : 0

        return (
          <div key={book.slug} className="flex items-center gap-3">
            <span className="text-lg shrink-0">{book.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-frost-white/60 truncate">{book.title}</p>
                <span className="text-[10px] text-frost-white/30">{completed}/{total}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Circular progress ring
function ProgressRing({ value, max, size = 80, strokeWidth = 6, color = '#D4AF37', children }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  const levelName = LEVEL_NAMES[player.level - 1] || LEVEL_NAMES[0]
  const xpProgress = getXPProgress(player.xp)
  const currentThreshold = LEVEL_THRESHOLDS[player.level - 1] || 0
  const nextThreshold = LEVEL_THRESHOLDS[player.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const accuracy = player.totalCorrect + player.totalWrong > 0
    ? Math.round((player.totalCorrect / (player.totalCorrect + player.totalWrong)) * 100)
    : 0

  const totalLessonsAvailable = BOOKS.reduce((acc, b) =>
    acc + b.chapters.reduce((a, ch) => a + ch.lessons.length, 0), 0)
  const completedCount = Object.keys(player.completedLessons).length

  const earnedAchievements = (player.achievements || []).length
  const totalAchievements = ACHIEVEMENTS.length

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <h2 className="font-display text-xl font-bold text-frost-white">הסטטיסטיקות שלי</h2>
      </div>

      {/* Level card with ring */}
      <div className="glass-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-5">
          <ProgressRing value={player.xp - currentThreshold} max={nextThreshold - currentThreshold} size={80}>
            <span className="font-display text-lg font-bold text-gold">{player.level}</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-xs text-frost-white/40">רמה {player.level}</p>
            <h3 className="font-display text-2xl font-bold text-frost-white">{levelName}</h3>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-frost-white/40">{player.xp}/{nextThreshold} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Brain, color: 'text-dusty-aqua', bg: 'bg-dusty-aqua/10', value: player.xp, label: 'נקודות XP' },
          { icon: Target, color: 'text-success', bg: 'bg-success/10', value: `${accuracy}%`, label: 'דיוק' },
          { icon: Flame, color: 'text-warning', bg: 'bg-warning/10', value: player.longestStreak, label: 'רצף שיא' },
          { icon: Heart, color: 'text-danger', bg: 'bg-danger/10', value: player.totalCorrect, label: 'תשובות נכונות' },
          { icon: Zap, color: 'text-gold', bg: 'bg-gold/10', value: completedCount, label: 'שיעורים' },
          { icon: Trophy, color: 'text-gold', bg: 'bg-gold/10', value: `${earnedAchievements}/${totalAchievements}`, label: 'הישגים' },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-4 animate-fade-in"
            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-frost-white">{stat.value}</p>
            <p className="text-xs text-frost-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly XP Progress */}
      <div className="glass-card p-5 mb-4 animate-fade-in" style={{ animationDelay: '0.33s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gold" />
          <h3 className="font-display text-sm font-bold text-frost-white">יעד שבועי</h3>
        </div>
        {(() => {
          const weeklyXP = player.weeklyXP || 0
          const weeklyGoal = player.weeklyXPGoal || 250
          const currentGoal = WEEKLY_GOALS.find(g => g.xp === weeklyGoal) || WEEKLY_GOALS[1]
          const progress = Math.min((weeklyXP / weeklyGoal) * 100, 100)
          return (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-frost-white/50">{currentGoal.emoji} {currentGoal.label}</span>
                <span className="text-xs font-bold text-gold">{weeklyXP}/{weeklyGoal} XP</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-700 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 progress-shimmer rounded-full" />
                </div>
              </div>
              {weeklyXP >= weeklyGoal && (
                <p className="text-xs text-success font-bold mt-2 text-center">יעד הושלם! כל הכבוד!</p>
              )}
            </>
          )
        })()}
      </div>

      {/* Streak Milestones */}
      <div className="glass-card p-5 mb-6 animate-fade-in" style={{ animationDelay: '0.34s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-warning" />
          <h3 className="font-display text-sm font-bold text-frost-white">אבני דרך ברצף</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STREAK_MILESTONES.map(m => {
            const reached = player.currentStreak >= m.days
            return (
              <div
                key={m.days}
                className={`flex-shrink-0 w-16 p-2 rounded-xl text-center transition-all ${
                  reached ? 'bg-warning/10 border border-warning/20' : 'bg-white/3 border border-white/5 opacity-40'
                }`}
              >
                <span className="text-lg block">{m.emoji}</span>
                <span className={`text-[10px] font-bold block mt-0.5 ${reached ? 'text-warning' : 'text-frost-white/40'}`}>
                  {m.days} ימים
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Book progress chart */}
      <div className="glass-card p-5 mb-6 animate-fade-in" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-frost-white/40" />
          <h3 className="font-display text-sm font-bold text-frost-white">התקדמות בספרים</h3>
        </div>
        <ProgressChart books={BOOKS} completedLessons={player.completedLessons} />
      </div>

      {/* Achievements */}
      <h3 className="font-display text-lg font-bold text-frost-white mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        הישגים ({earnedAchievements}/{totalAchievements})
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const earned = (player.achievements || []).includes(ach.id)
          return (
            <div
              key={ach.id}
              className={`glass-card p-3 text-center animate-fade-in transition-all ${
                earned ? 'border-gold/20 hover:border-gold/40' : 'opacity-30 grayscale'
              }`}
              style={{ animationDelay: `${0.45 + i * 0.03}s` }}
            >
              <span className="text-2xl block mb-1">{ach.icon}</span>
              <p className="text-[11px] font-semibold text-frost-white truncate">{ach.title}</p>
              <p className="text-[9px] text-frost-white/40 mt-0.5 line-clamp-2">{ach.description}</p>
            </div>
          )
        })}
      </div>
    </main>
  )
}
