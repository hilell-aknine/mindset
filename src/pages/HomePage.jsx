import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { BookOpen, Trophy, Flame, RotateCcw, BarChart2, Settings, Zap, Target, Crown, X } from 'lucide-react'
import DailyChallenge from '../components/DailyChallenge'
import StreakFreeze from '../components/StreakFreeze'
import FeatureSpotlight from '../components/FeatureSpotlight'
import { getActiveEvent, WEEKLY_GOALS, STREAK_MILESTONES } from '../lib/events'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'

const BOOKS = [strengthsFinder, atomicHabits, happyChemicals, nextFiveMoves]

const DAILY_QUOTES = [
  { text: 'אתה לא צריך להיות מושלם כדי להתחיל, אבל צריך להתחיל כדי להשתפר.', source: 'הרגלים אטומים' },
  { text: 'כשאתה שם לב למה שעובד לך — אתה מתחזק. זו מהות החוזקות.', source: 'חוזקות' },
  { text: 'דופמין לא נועד לגרום לך להרגיש טוב — הוא נועד לגרום לך לחפש.', source: 'כימיקלים של אושר' },
  { text: 'לפני שאתה עושה מהלך, שאל: מה יקרה אחרי המהלך הזה?', source: '5 מהלכים' },
  { text: 'המטרה שלך היא לא להשיג תוצאה — המטרה היא להפוך לאדם שמשיג אותה.', source: 'הרגלים אטומים' },
  { text: 'אנשים חזקים לא עושים הכל טוב — הם עושים כמה דברים יוצא מן הכלל.', source: 'חוזקות' },
  { text: 'אוקסיטוצין נבנה לאט — דרך אמון, לא דרך קיצורי דרך.', source: 'כימיקלים של אושר' },
  { text: 'שינוי קטן ועקבי מנצח שינוי גדול וחד-פעמי.', source: 'הרגלים אטומים' },
  { text: 'הסביבה שלך מעצבת את ההרגלים שלך יותר ממוטיבציה.', source: 'הרגלים אטומים' },
  { text: 'אל תחפש תשבחות — חפש אתגרים שמצמיחים אותך.', source: '5 מהלכים' },
  { text: 'סרוטונין מגיע כשאחרים מכירים בערך שלך. תן ערך קודם.', source: 'כימיקלים של אושר' },
  { text: 'הכישרון שלך הוא דפוס חשיבה שחוזר בטבעיות. הקשב לו.', source: 'חוזקות' },
  { text: 'המהלך הראשון קובע את כל המשחק. תכנן לפני שאתה פועל.', source: '5 מהלכים' },
  { text: 'אנדורפין נוצר מאימון — הגוף מתגמל אותך על המאמץ.', source: 'כימיקלים של אושר' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { player, streakMilestone, clearStreakMilestone } = usePlayer()
  const [showDailyChallenge, setShowDailyChallenge] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)

  const reviewCount = (player.reviewQueue || []).length
  const today = new Date().toDateString()
  const dailyCompleted = player.dailyChallengeCompleted === today
  const activeEvent = getActiveEvent()

  // Weekly XP progress
  const weeklyXP = player.weeklyXP || 0
  const weeklyGoal = player.weeklyXPGoal || 250
  const weeklyProgress = Math.min((weeklyXP / weeklyGoal) * 100, 100)
  const currentGoal = WEEKLY_GOALS.find(g => g.xp === weeklyGoal) || WEEKLY_GOALS[1]

  // Streak milestone popup
  useEffect(() => {
    if (streakMilestone) {
      setShowMilestone(true)
      const t = setTimeout(() => {
        setShowMilestone(false)
        clearStreakMilestone()
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [streakMilestone])

  // Daily rotating quote
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 overflow-hidden">
      {/* Welcome */}
      <div className="mb-6 animate-fade-in">
        <h2 className="font-display text-2xl font-bold text-frost-white mb-1 truncate">
          שלום! 👋
        </h2>
        <p className="text-frost-white/50 text-sm">
          מה תרצה ללמוד היום?
        </p>
      </div>

      {/* Streak Milestone Popup */}
      {showMilestone && streakMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => { setShowMilestone(false); clearStreakMilestone() }}>
          <div className="glass-card p-8 text-center max-w-sm mx-4 border-gold/30 animate-bounce-in">
            <div className="text-6xl mb-4">{streakMilestone.emoji}</div>
            <h3 className="font-display text-2xl font-bold text-gold mb-2">{streakMilestone.title}</h3>
            <p className="text-frost-white/60 text-sm mb-3">{streakMilestone.reward}</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-gold font-bold">+{streakMilestone.xpBonus} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Active XP Event Banner */}
      {activeEvent && (
        <div className="glass-card p-3 mb-4 flex items-center gap-3 animate-fade-in border-warning/20 bg-warning/5" style={{ animationDelay: '0.05s' }}>
          <span className="text-2xl">{activeEvent.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-warning">{activeEvent.name}</p>
            <p className="text-[10px] text-frost-white/40">{activeEvent.description}</p>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-warning/15 border border-warning/30">
            <span className="text-xs font-bold text-warning">x{activeEvent.multiplier}</span>
          </div>
        </div>
      )}

      {/* Weekly XP Goal */}
      <div className="glass-card p-3 mb-4 animate-fade-in" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{currentGoal.emoji}</span>
            <span className="text-xs font-semibold text-frost-white/70">יעד שבועי: {currentGoal.label}</span>
          </div>
          <span className="text-[10px] text-frost-white/40">{weeklyXP}/{weeklyGoal} XP</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-700"
            style={{ width: `${weeklyProgress}%` }}
          />
        </div>
        {weeklyXP >= weeklyGoal && (
          <p className="text-[10px] text-success font-bold mt-1.5">הושלם! כל הכבוד!</p>
        )}
      </div>

      {/* Streak banner with next milestone */}
      {player.currentStreak > 1 && (() => {
        const nextMilestone = STREAK_MILESTONES.find(m => m.days > player.currentStreak)
        return (
          <div className="glass-card p-4 mb-4 animate-fade-in border-warning/10" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-frost-white">רצף של {player.currentStreak} ימים!</p>
                {nextMilestone ? (
                  <p className="text-[10px] text-frost-white/40">
                    עוד {nextMilestone.days - player.currentStreak} ימים ל{nextMilestone.emoji} {nextMilestone.title} (+{nextMilestone.xpBonus} XP)
                  </p>
                ) : (
                  <p className="text-[10px] text-frost-white/40">המשך ללמוד כדי לשמור על הרצף</p>
                )}
              </div>
              <div className="text-2xl font-bold text-warning">{player.currentStreak}</div>
            </div>
            {/* Milestone progress bar */}
            {nextMilestone && (() => {
              const prevMilestone = [...STREAK_MILESTONES].reverse().find(m => m.days <= player.currentStreak)
              const from = prevMilestone ? prevMilestone.days : 0
              const pct = ((player.currentStreak - from) / (nextMilestone.days - from)) * 100
              return (
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-warning/60 transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              )
            })()}
          </div>
        )
      })()}

      {/* Daily Challenge Card */}
      <button
        onClick={() => setShowDailyChallenge(true)}
        className={`w-full glass-card p-4 mb-6 flex items-center gap-3 animate-fade-in transition-all hover:border-gold/20 ${
          dailyCompleted ? 'border-success/20' : 'border-gold/10 animate-pulse-glow'
        }`}
        style={{ animationDelay: '0.15s' }}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          dailyCompleted ? 'bg-success/15' : 'bg-gold/15'
        }`}>
          {dailyCompleted ? (
            <Trophy className="w-6 h-6 text-success" />
          ) : (
            <Target className="w-6 h-6 text-gold" />
          )}
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm font-semibold text-frost-white">
            {dailyCompleted ? 'אתגר יומי הושלם!' : 'אתגר יומי'}
          </p>
          <p className="text-xs text-frost-white/40">
            {dailyCompleted ? 'חזור מחר לאתגר חדש' : 'ענה נכון וקבל +50 XP'}
          </p>
        </div>
        {!dailyCompleted && (
          <div className="px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30">
            <span className="text-xs font-bold text-gold">+50 XP</span>
          </div>
        )}
      </button>

      {/* Streak Freeze */}
      <div className="mb-4">
        <StreakFreeze />
      </div>

      {/* Books grid */}
      <div className="grid gap-4">
        {BOOKS.map((book, idx) => {
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
              className="glass-card p-4 flex items-center gap-3 text-right hover:border-gold/20 transition-all group overflow-hidden w-full animate-fade-in"
              style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-105 transition-transform">
                {book.icon}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="font-display text-base sm:text-lg font-bold text-frost-white truncate">{book.title}</h3>
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
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6">
        {/* Review */}
        <button
          onClick={() => navigate('/review')}
          className="glass-card p-3 text-center hover:border-gold/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
            <RotateCcw className="w-4 h-4 text-warning" />
          </div>
          <p className="text-[10px] text-frost-white/60">חזרה</p>
          {reviewCount > 0 && (
            <span className="text-[9px] text-gold font-bold">{reviewCount}</span>
          )}
        </button>

        {/* Leaderboard */}
        <button
          onClick={() => navigate('/leaderboard')}
          className="glass-card p-3 text-center hover:border-gold/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.43s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-2">
            <Crown className="w-4 h-4 text-gold" />
          </div>
          <p className="text-[10px] text-frost-white/60">מובילים</p>
        </button>

        {/* Stats */}
        <button
          onClick={() => navigate('/stats')}
          className="glass-card p-3 text-center hover:border-gold/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.46s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-dusty-aqua/10 flex items-center justify-center mx-auto mb-2">
            <BarChart2 className="w-4 h-4 text-dusty-aqua" />
          </div>
          <p className="text-[10px] text-frost-white/60">סטטיסטיקות</p>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="glass-card p-3 text-center hover:border-gold/20 transition-all animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="w-9 h-9 rounded-xl bg-frost-white/5 flex items-center justify-center mx-auto mb-2">
            <Settings className="w-4 h-4 text-frost-white/40" />
          </div>
          <p className="text-[10px] text-frost-white/60">הגדרות</p>
        </button>
      </div>

      {/* Daily quote */}
      <div className="glass-card p-4 mt-6 border-white/5 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <p className="text-sm text-frost-white/60 leading-relaxed italic">
          &ldquo;{dailyQuote.text}&rdquo;
        </p>
        <p className="text-[10px] text-frost-white/25 mt-2">— {dailyQuote.source}</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
        <div className="glass-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.55s' }}>
          <p className="text-2xl font-bold text-gold">{player.xp}</p>
          <p className="text-[10px] text-frost-white/40 mt-1">XP</p>
        </div>
        <div className="glass-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-2xl font-bold text-success">{player.totalCorrect}</p>
          <p className="text-[10px] text-frost-white/40 mt-1">תשובות נכונות</p>
        </div>
        <div className="glass-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.65s' }}>
          <p className="text-2xl font-bold text-dusty-aqua">{Object.keys(player.completedLessons).length}</p>
          <p className="text-[10px] text-frost-white/40 mt-1">שיעורים</p>
        </div>
      </div>

      {/* Daily Challenge Modal */}
      {showDailyChallenge && (
        <DailyChallenge onClose={() => setShowDailyChallenge(false)} />
      )}

      {/* First-time feature spotlight */}
      <FeatureSpotlight />
    </main>
  )
}
