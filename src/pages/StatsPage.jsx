import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { LEVEL_NAMES, getXPProgress, LEVEL_THRESHOLDS } from '../config/constants'
import { ACHIEVEMENTS, RARITY, CATEGORIES, getAchievementsByCategory } from '../lib/achievements'
import { getActiveEvent, WEEKLY_GOALS, STREAK_MILESTONES } from '../lib/events'
import { ArrowRight, Trophy, Target, Flame, Brain, Heart, Zap, TrendingUp, BookOpen, Calendar, Award, Share2, Activity } from 'lucide-react'
import { getStreakTier, SR_INTERVALS } from '../config/constants'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'
import mindsetBook from '../data/books/mindset-book.json'
import indistractable from '../data/books/indistractable.json'

const BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves, mindsetBook, indistractable]

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

// GitHub-style learning heatmap (90 days)
function LearningHeatmap({ learningDays }) {
  const days = []
  const today = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, active: !!learningDays[key] })
  }

  const totalActive = days.filter(d => d.active).length

  return (
    <div>
      <div className="flex flex-wrap gap-[3px] justify-center mb-2" dir="ltr">
        {days.map((d, i) => (
          <div
            key={i}
            className={`w-[10px] h-[10px] rounded-[2px] transition-all ${
              d.active ? 'bg-success/70' : 'bg-white/5'
            }`}
            title={`${d.date}${d.active ? ' — למדת!' : ''}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] text-frost-white/25 px-1">
        <span>לפני 90 יום</span>
        <span className="text-frost-white/50 font-bold">{totalActive} ימי למידה</span>
        <span>היום</span>
      </div>
    </div>
  )
}

// Retention score based on SR queue
function RetentionScore({ srQueue }) {
  const total = srQueue.length
  if (total === 0) return null

  // Calculate mastery: higher interval = better retention
  const totalScore = srQueue.reduce((acc, item) => {
    const interval = item.interval || 0
    return acc + (interval / (SR_INTERVALS.length - 1)) * 100
  }, 0)
  const avgRetention = Math.round(totalScore / total)

  const today = new Date().toISOString().split('T')[0]
  const dueToday = srQueue.filter(item => item.nextReviewDate <= today).length

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <p className="text-3xl font-bold text-dusty-aqua">{avgRetention}%</p>
          <p className="text-[10px] text-frost-white/30">שימור ממוצע</p>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-frost-white/40 w-16">שיא</span>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-dusty-aqua/60 transition-all" style={{ width: `${avgRetention}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-frost-white/30">{total} פריטים בתור חזרה</span>
        {dueToday > 0 && (
          <span className="text-warning font-bold">{dueToday} לחזרה היום</span>
        )}
      </div>

      {/* SR interval distribution */}
      <div className="flex items-end gap-1 h-8 mt-3 justify-center">
        {SR_INTERVALS.map((sr, i) => {
          const count = srQueue.filter(item => item.interval === i).length
          const height = total > 0 ? Math.max(4, (count / total) * 32) : 4
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className="w-8 rounded-t bg-dusty-aqua/40 transition-all"
                style={{ height: `${height}px` }}
              />
              <span className="text-[8px] text-frost-white/25">{sr.label}</span>
              {count > 0 && <span className="text-[7px] text-frost-white/40">{count}</span>}
            </div>
          )
        })}
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
          className="p-2.5 -m-1 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors"
          aria-label="חזרה לדף הבית"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <h2 className="font-display text-xl font-bold text-frost-white flex-1">הסטטיסטיקות שלי</h2>
        {typeof navigator.share === 'function' && (
          <button
            onClick={() => {
              navigator.share({
                title: 'הסטטיסטיקות שלי ב-MindSet',
                text: `רמה ${player.level} (${levelName}) | ${player.xp} XP | דיוק ${accuracy}% | רצף ${player.currentStreak} ימים`,
              }).catch(() => {})
            }}
            className="p-2.5 -m-1 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-frost-white/30 hover:text-frost-white/60"
            aria-label="שתף סטטיסטיקות"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Level card with ring */}
      <div className="glass-card p-6 mb-6 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.05s' }}>
        <img src="/backgrounds/brain-tech.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-center gap-5">
          <ProgressRing value={player.xp - currentThreshold} max={nextThreshold - currentThreshold} size={80}>
            <span className="font-display text-lg font-bold text-gold">{player.level}</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-xs text-frost-white/40">רמה {player.level}</p>
            <h3 className="font-display text-2xl font-bold text-frost-white">{levelName}</h3>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-frost-white/40">{player.xp.toLocaleString()}/{nextThreshold.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Brain, color: 'text-dusty-aqua', bg: 'bg-dusty-aqua/10', value: player.xp.toLocaleString(), label: 'נקודות XP' },
          { icon: Target, color: 'text-success', bg: 'bg-success/10', value: `${accuracy}%`, label: 'דיוק' },
          { icon: Flame, color: 'text-warning', bg: 'bg-warning/10', value: player.longestStreak.toLocaleString(), label: 'רצף שיא' },
          { icon: Heart, color: 'text-danger', bg: 'bg-danger/10', value: player.totalCorrect.toLocaleString(), label: 'תשובות נכונות' },
          { icon: Zap, color: 'text-gold', bg: 'bg-gold/10', value: completedCount.toLocaleString(), label: 'שיעורים' },
          { icon: BookOpen, color: 'text-dusty-aqua', bg: 'bg-dusty-aqua/10', value: (player.reviewsCompleted || 0).toLocaleString(), label: 'חזרות' },
          { icon: Trophy, color: 'text-gold', bg: 'bg-gold/10', value: `${earnedAchievements}/${totalAchievements}`, label: 'הישגים' },
          { icon: Calendar, color: 'text-warning', bg: 'bg-warning/10', value: player.dailyChallengesCompleted || 0, label: 'אתגרים יומיים' },
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

      {/* Learning Heatmap */}
      <div className="glass-card p-5 mb-6 animate-fade-in" style={{ animationDelay: '0.36s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-success" />
          <h3 className="font-display text-sm font-bold text-frost-white">מפת למידה (90 יום)</h3>
        </div>
        <LearningHeatmap learningDays={player.learningDays || {}} />
      </div>

      {/* Retention Score */}
      {(player.spacedReviewQueue || []).length > 0 && (
        <div className="glass-card p-5 mb-6 animate-fade-in" style={{ animationDelay: '0.37s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-dusty-aqua" />
            <h3 className="font-display text-sm font-bold text-frost-white">ציון שימור ידע</h3>
          </div>
          <RetentionScore srQueue={player.spacedReviewQueue || []} />
        </div>
      )}

      {/* Streak Tier Badge */}
      {getStreakTier(player.currentStreak) && (() => {
        const tier = getStreakTier(player.currentStreak)
        return (
          <div className={`glass-card p-4 mb-6 animate-fade-in ${tier.bg} border-white/5`} style={{ animationDelay: '0.38s' }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tier.emoji}</span>
              <div>
                <p className={`text-sm font-bold ${tier.color}`}>דרגת רצף: {tier.label}</p>
                <p className="text-[10px] text-frost-white/40">{player.currentStreak} ימים רצופים</p>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Achievements — categorized */}
      <h3 className="font-display text-lg font-bold text-frost-white mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        הישגים ({earnedAchievements}/{totalAchievements})
      </h3>
      {Object.entries(getAchievementsByCategory(player.achievements || [])).map(([catKey, achs]) => {
        const cat = CATEGORIES[catKey]
        const earnedInCat = achs.filter(a => a.earned).length
        if (achs.length === 0) return null
        return (
          <div key={catKey} className="mb-5 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{cat.icon}</span>
              <span className="text-xs font-bold text-frost-white/60">{cat.label}</span>
              <span className="text-[10px] text-frost-white/30">{earnedInCat}/{achs.length}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {achs.map(ach => {
                const rarity = RARITY[ach.rarity || 'common']
                return (
                  <div
                    key={ach.id}
                    className={`glass-card p-3 text-center transition-all ${
                      ach.earned
                        ? `${rarity.border} hover:border-gold/40`
                        : 'opacity-25 grayscale'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{ach.icon}</span>
                    <p className="text-[11px] font-semibold text-frost-white truncate">{ach.title}</p>
                    {ach.earned && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${rarity.bg} ${rarity.color} font-bold inline-block mt-1`}>
                        {rarity.label}
                      </span>
                    )}
                    {!ach.earned && (
                      <p className="text-[9px] text-frost-white/40 mt-0.5 line-clamp-1">{ach.description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </main>
  )
}
