import { useState, useEffect } from 'react'
import { supabase } from '../../../config/supabase'
import { ADMIN_EMAILS } from '../../../config/admin'
import {
  LEVEL_THRESHOLDS,
  LEVEL_NAMES,
  MAX_HEARTS,
  HEART_RECOVERY_MINUTES,
  FREE_DAILY_TOKENS,
  PAID_BOOK_TOKENS,
  XP_CORRECT_ANSWER,
  XP_LESSON_COMPLETE,
  XP_DAILY_CHALLENGE,
  XP_PERFECT_LESSON,
  PRICE_SINGLE_BOOK,
  PRICE_MASTERY_BUNDLE,
} from '../../../config/constants'

export default function SettingsTab() {
  const [tableCounts, setTableCounts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadTableCounts() }, [])

  async function loadTableCounts() {
    try {
      const tables = [
        'mindset_users',
        'mindset_ai_chats',
        'mindset_user_progress',
        'mindset_review_queue',
      ]

      const counts = {}
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        counts[table] = error ? '—' : count
      }

      setTableCounts(counts)
    } catch (err) {
      console.error('Settings load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const gameConstants = [
    { section: 'XP', items: [
      { label: 'תשובה נכונה', value: `+${XP_CORRECT_ANSWER} XP` },
      { label: 'סיום שיעור', value: `+${XP_LESSON_COMPLETE} XP` },
      { label: 'שיעור מושלם', value: `+${XP_PERFECT_LESSON} XP` },
      { label: 'אתגר יומי', value: `+${XP_DAILY_CHALLENGE} XP` },
    ]},
    { section: 'לבבות', items: [
      { label: 'מקסימום', value: MAX_HEARTS },
      { label: 'התאוששות', value: `${HEART_RECOVERY_MINUTES} דקות` },
    ]},
    { section: 'טוקנים', items: [
      { label: 'חינם יומי', value: FREE_DAILY_TOKENS },
      { label: 'רכישת ספר', value: PAID_BOOK_TOKENS },
    ]},
    { section: 'מחירים', items: [
      { label: 'ספר בודד', value: `${PRICE_SINGLE_BOOK} ₪` },
      { label: 'חבילה מלאה', value: `${PRICE_MASTERY_BUNDLE} ₪` },
    ]},
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-display font-bold text-gold">הגדרות</h2>

      {/* Admin emails */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-white/60 mb-3">מנהלים מורשים</h3>
        <p className="text-[10px] text-white/20 mb-2">לעריכה, שנה את הקובץ src/config/admin.js</p>
        <div className="space-y-1">
          {ADMIN_EMAILS.map(email => (
            <div key={email} className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2">
              <span className="text-success text-sm">●</span>
              <span className="text-sm text-frost-white font-mono">{email}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Game constants */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-white/60 mb-3">קבועי משחק</h3>
        <p className="text-[10px] text-white/20 mb-3">לעריכה, שנה את src/config/constants.js</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gameConstants.map(section => (
            <div key={section.section} className="bg-white/[0.02] rounded-xl p-3">
              <h4 className="text-xs text-gold font-medium mb-2">{section.section}</h4>
              {section.items.map(item => (
                <div key={item.label} className="flex items-center justify-between py-1 text-xs">
                  <span className="text-white/40">{item.label}</span>
                  <span className="text-frost-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Level thresholds */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-white/60 mb-3">מערכת רמות</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LEVEL_NAMES.map((name, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl p-3 text-center">
              <p className="text-gold font-bold text-lg">{i + 1}</p>
              <p className="text-xs text-frost-white">{name}</p>
              <p className="text-[10px] text-white/30">{LEVEL_THRESHOLDS[i].toLocaleString()} XP</p>
            </div>
          ))}
        </div>
      </div>

      {/* DB table counts */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-white/60 mb-3">מסד נתונים</h3>
        {loading ? (
          <div className="text-white/30 text-sm animate-pulse">טוען...</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(tableCounts || {}).map(([table, count]) => (
              <div key={table} className="flex items-center justify-between bg-white/[0.02] rounded-xl px-3 py-2">
                <span className="text-xs text-white/40 font-mono">{table.replace('mindset_', '')}</span>
                <span className="text-sm text-frost-white font-bold">{typeof count === 'number' ? count.toLocaleString() : count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
