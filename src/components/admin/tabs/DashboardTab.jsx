import { useState, useEffect } from 'react'
import { supabase } from '../../../config/supabase'
import MiniStat from '../charts/MiniStat'
import BarChart from '../charts/BarChart'

export default function DashboardTab() {
  const [stats, setStats] = useState(null)
  const [dailyActive, setDailyActive] = useState([])
  const [dailySignups, setDailySignups] = useState([])
  const [topXP, setTopXP] = useState([])
  const [topStreaks, setTopStreaks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const { data: users, error } = await supabase
        .from('mindset_users')
        .select('*')

      if (error) throw error
      if (!users) return

      const today = new Date().toISOString().split('T')[0]
      const activeToday = users.filter(u => u.last_login_date === today).length
      const premiumCount = users.filter(u => u.is_premium).length
      const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0)

      setStats({
        total: users.length,
        activeToday,
        premium: premiumCount,
        totalXP,
      })

      // 7-day active users + signups
      const days = []
      const signups = []
      const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayLabel = dayNames[d.getDay()]
        days.push({
          label: dayLabel,
          value: users.filter(u => u.last_login_date === dateStr).length,
        })
        signups.push({
          label: dayLabel,
          value: users.filter(u => u.created_at?.startsWith(dateStr)).length,
        })
      }
      setDailyActive(days)
      setDailySignups(signups)

      // Top 5 by XP
      const sortedXP = [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5)
      setTopXP(sortedXP)

      // Top 5 by streak
      const sortedStreaks = [...users].sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0)).slice(0, 5)
      setTopStreaks(sortedStreaks)
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-4 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-display font-bold text-gold">סקירה כללית</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon="👥" label="סה״כ משתמשים" value={stats?.total || 0} />
        <MiniStat icon="🟢" label="פעילים היום" value={stats?.activeToday || 0} />
        <MiniStat icon="💎" label="פרימיום" value={stats?.premium || 0} />
        <MiniStat icon="⭐" label="סה״כ XP" value={stats?.totalXP || 0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white/60 mb-3">משתמשים פעילים — 7 ימים</h3>
          <BarChart data={dailyActive} barColor="var(--color-dusty-aqua)" />
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white/60 mb-3">הרשמות חדשות — 7 ימים</h3>
          <BarChart data={dailySignups} barColor="var(--color-gold)" />
        </div>
      </div>

      {/* Top tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white/60 mb-3">🏆 טופ 5 — XP</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs border-b border-white/5">
                <th className="text-right pb-2 pr-2">#</th>
                <th className="text-right pb-2">משתמש</th>
                <th className="text-right pb-2">XP</th>
                <th className="text-right pb-2">רמה</th>
              </tr>
            </thead>
            <tbody>
              {topXP.map((u, i) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="py-1.5 pr-2 text-white/40">{i + 1}</td>
                  <td className="py-1.5 text-frost-white">{u.display_name || u.user_id?.slice(0, 8)}</td>
                  <td className="py-1.5 text-gold font-medium">{(u.xp || 0).toLocaleString()}</td>
                  <td className="py-1.5 text-white/50">{u.level || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white/60 mb-3">🔥 טופ 5 — רצפים</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs border-b border-white/5">
                <th className="text-right pb-2 pr-2">#</th>
                <th className="text-right pb-2">משתמש</th>
                <th className="text-right pb-2">רצף</th>
                <th className="text-right pb-2">שיא</th>
              </tr>
            </thead>
            <tbody>
              {topStreaks.map((u, i) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="py-1.5 pr-2 text-white/40">{i + 1}</td>
                  <td className="py-1.5 text-frost-white">{u.display_name || u.user_id?.slice(0, 8)}</td>
                  <td className="py-1.5 text-gold font-medium">{u.current_streak || 0}</td>
                  <td className="py-1.5 text-white/50">{u.longest_streak || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
