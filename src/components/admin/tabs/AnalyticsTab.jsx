import { useState, useEffect } from 'react'
import { supabase } from '../../../config/supabase'
import { ACHIEVEMENTS } from '../../../lib/achievements'
import BarChart from '../charts/BarChart'

const STREAK_BUCKETS = [
  { label: '0', min: 0, max: 0 },
  { label: '1-2', min: 1, max: 2 },
  { label: '3-6', min: 3, max: 6 },
  { label: '7-13', min: 7, max: 13 },
  { label: '14-29', min: 14, max: 29 },
  { label: '30+', min: 30, max: Infinity },
]

const XP_BUCKETS = [
  { label: '0', min: 0, max: 0 },
  { label: '1-99', min: 1, max: 99 },
  { label: '100-499', min: 100, max: 499 },
  { label: '500-999', min: 500, max: 999 },
  { label: '1K-2K', min: 1000, max: 1999 },
  { label: '2K+', min: 2000, max: Infinity },
]

export default function AnalyticsTab() {
  const [funnel, setFunnel] = useState([])
  const [streakDist, setStreakDist] = useState([])
  const [xpDist, setXpDist] = useState([])
  const [achievementRates, setAchievementRates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAnalytics() }, [])

  async function loadAnalytics() {
    try {
      const { data: users, error } = await supabase
        .from('mindset_users')
        .select('*')

      if (error) throw error
      if (!users?.length) return

      const total = users.length

      // Completion funnel
      const onboarded = users.filter(u => u.onboarding_complete).length
      const lesson1 = users.filter(u => Object.keys(u.completed_lessons || {}).length >= 1).length
      const lesson5 = users.filter(u => Object.keys(u.completed_lessons || {}).length >= 5).length
      const lesson10 = users.filter(u => Object.keys(u.completed_lessons || {}).length >= 10).length
      const lessonAll = users.filter(u => Object.keys(u.completed_lessons || {}).length >= 15).length

      setFunnel([
        { label: 'נרשמו', value: total, pct: 100 },
        { label: 'Onboarded', value: onboarded, pct: Math.round((onboarded / total) * 100) },
        { label: '1 שיעור', value: lesson1, pct: Math.round((lesson1 / total) * 100) },
        { label: '5 שיעורים', value: lesson5, pct: Math.round((lesson5 / total) * 100) },
        { label: '10 שיעורים', value: lesson10, pct: Math.round((lesson10 / total) * 100) },
        { label: 'כל השיעורים', value: lessonAll, pct: Math.round((lessonAll / total) * 100) },
      ])

      // Streak distribution
      setStreakDist(STREAK_BUCKETS.map(b => ({
        label: b.label,
        value: users.filter(u => {
          const s = u.current_streak || 0
          return s >= b.min && s <= b.max
        }).length,
      })))

      // XP distribution
      setXpDist(XP_BUCKETS.map(b => ({
        label: b.label,
        value: users.filter(u => {
          const x = u.xp || 0
          return x >= b.min && x <= b.max
        }).length,
      })))

      // Achievement unlock rates
      const rates = ACHIEVEMENTS.map(a => {
        const earned = users.filter(u => (u.achievements || []).includes(a.id)).length
        return {
          id: a.id,
          icon: a.icon,
          title: a.title,
          rarity: a.rarity,
          earned,
          rate: Math.round((earned / total) * 100),
        }
      }).sort((a, b) => a.rate - b.rate)

      setAchievementRates(rates)
    } catch (err) {
      console.error('Analytics load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="glass-card p-8 text-center text-white/40 animate-pulse">טוען אנליטיקות...</div>
  }

  const RARITY_COLORS = {
    common: 'text-white/50',
    rare: 'text-dusty-aqua',
    epic: 'text-[#a855f7]',
    legendary: 'text-gold',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-display font-bold text-gold">אנליטיקות</h2>

      {/* Completion funnel */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-white/60 mb-4">משפך השלמה</h3>
        <div className="space-y-2">
          {funnel.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 text-xs text-white/50 text-left shrink-0">{step.label}</span>
              <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                <div
                  className="h-full rounded-lg bg-gradient-to-l from-gold/80 to-dusty-aqua/80 transition-all duration-700"
                  style={{ width: `${step.pct}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] text-frost-white font-medium">
                  {step.value} ({step.pct}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white/60 mb-3">שימור לפי רצף (ימים)</h3>
          <BarChart data={streakDist} barColor="var(--color-gold)" height={140} />
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white/60 mb-3">התפלגות XP</h3>
          <BarChart data={xpDist} barColor="var(--color-dusty-aqua)" height={140} />
        </div>
      </div>

      {/* Achievement unlock rates */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-white/60 mb-3">שיעור פתיחת הישגים (מהנדיר לנפוץ)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
          {achievementRates.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-white/[0.02] rounded-xl px-3 py-2">
              <span className="text-lg">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${RARITY_COLORS[a.rarity]}`}>{a.title}</p>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gold/60 transition-all"
                    style={{ width: `${Math.max(a.rate, 2)}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-white/30 shrink-0">{a.earned} ({a.rate}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
