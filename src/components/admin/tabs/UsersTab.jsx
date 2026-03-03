import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../config/supabase'
import { getLevelName } from '../../../config/constants'

const PAGE_SIZE = 25

const SORT_OPTIONS = [
  { key: 'xp', label: 'XP' },
  { key: 'level', label: 'רמה' },
  { key: 'current_streak', label: 'רצף' },
  { key: 'created_at', label: 'הרשמה' },
  { key: 'last_login_date', label: 'כניסה אחרונה' },
]

export default function UsersTab() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('xp')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(null)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('mindset_users')
        .select('*')
        .order('xp', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFiltered(data || [])
    } catch (err) {
      console.error('Users load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = useCallback(() => {
    let result = [...users]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        (u.display_name || '').toLowerCase().includes(q) ||
        (u.user_id || '').toLowerCase().includes(q) ||
        (u.id || '').toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      const aVal = a[sortBy] ?? 0
      const bVal = b[sortBy] ?? 0
      if (typeof aVal === 'string') return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      return sortAsc ? aVal - bVal : bVal - aVal
    })

    setFiltered(result)
    setPage(0)
  }, [users, search, sortBy, sortAsc])

  useEffect(() => { applyFilters() }, [applyFilters])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function toggleSort(key) {
    if (sortBy === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(key)
      setSortAsc(false)
    }
  }

  function openEditModal(user, field) {
    setEditUser(user)
    setEditField(field)
    setEditValue(user[field] ?? '')
  }

  async function saveEdit() {
    if (!editUser || !editField) return
    setSaving(true)
    try {
      let val = editValue
      if (['xp', 'hearts', 'tokens', 'level', 'current_streak'].includes(editField)) {
        val = parseInt(val, 10)
        if (isNaN(val)) return
      }
      if (editField === 'is_premium') {
        val = editValue === 'true' || editValue === true
      }

      const { error } = await supabase
        .from('mindset_users')
        .update({ [editField]: val })
        .eq('id', editUser.id)

      if (error) throw error

      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, [editField]: val } : u))
      setEditUser(null)
    } catch (err) {
      console.error('Save error:', err)
      alert('שגיאה בשמירה: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function quickAction(userId, action) {
    const user = users.find(u => u.id === userId)
    if (!user) return

    let update = {}
    switch (action) {
      case 'grant_premium':
        update = { is_premium: true }
        break
      case 'revoke_premium':
        update = { is_premium: false }
        break
      case 'reset_hearts':
        update = { hearts: 5 }
        break
      case 'add_tokens':
        update = { tokens: (user.tokens || 0) + 50 }
        break
      default:
        return
    }

    try {
      const { error } = await supabase
        .from('mindset_users')
        .update(update)
        .eq('id', userId)

      if (error) throw error
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...update } : u))
    } catch (err) {
      console.error('Quick action error:', err)
    }
  }

  if (loading) {
    return <div className="glass-card p-8 text-center text-white/40 animate-pulse">טוען משתמשים...</div>
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-display font-bold text-gold">ניהול משתמשים</h2>
        <p className="text-sm text-white/40">{filtered.length} משתמשים</p>
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם או ID..."
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-frost-white placeholder:text-white/30 focus:outline-none focus:border-gold/40"
          dir="rtl"
        />
        <div className="flex gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => toggleSort(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                sortBy === opt.key
                  ? 'bg-gold/20 text-gold'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {opt.label} {sortBy === opt.key ? (sortAsc ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="text-white/30 text-xs border-b border-white/10 bg-deep-petrol/30">
              <th className="text-right px-3 py-2.5">משתמש</th>
              <th className="text-right px-3 py-2.5">רמה</th>
              <th className="text-right px-3 py-2.5">XP</th>
              <th className="text-right px-3 py-2.5">לבבות</th>
              <th className="text-right px-3 py-2.5">טוקנים</th>
              <th className="text-right px-3 py-2.5">רצף</th>
              <th className="text-right px-3 py-2.5">פרימיום</th>
              <th className="text-right px-3 py-2.5">כניסה אחרונה</th>
              <th className="text-right px-3 py-2.5">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-frost-white font-medium">{u.display_name || '—'}</span>
                    <span className="text-[10px] text-white/25 font-mono">{u.user_id?.slice(0, 12)}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => openEditModal(u, 'level')} className="hover:text-gold transition-colors">
                    <span className="text-gold font-bold">{u.level || 1}</span>
                    <span className="text-[10px] text-white/30 mr-1">{getLevelName(u.level || 1)}</span>
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => openEditModal(u, 'xp')} className="text-frost-white hover:text-gold transition-colors">
                    {(u.xp || 0).toLocaleString()}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => openEditModal(u, 'hearts')} className="hover:text-gold transition-colors">
                    {'❤️'.repeat(Math.min(u.hearts || 0, 5))}
                    {'🖤'.repeat(Math.max(5 - (u.hearts || 0), 0))}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => openEditModal(u, 'tokens')} className="text-white/60 hover:text-gold transition-colors">
                    {u.tokens ?? 0}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <span className="text-white/60">{u.current_streak || 0}</span>
                  <span className="text-[10px] text-white/20 mr-1">(שיא: {u.longest_streak || 0})</span>
                </td>
                <td className="px-3 py-2">
                  {u.is_premium ? (
                    <span className="text-gold text-xs bg-gold/10 px-2 py-0.5 rounded-full">פרימיום</span>
                  ) : (
                    <span className="text-white/30 text-xs">חינם</span>
                  )}
                </td>
                <td className="px-3 py-2 text-white/40 text-xs">
                  {u.last_login_date || '—'}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {!u.is_premium ? (
                      <button
                        onClick={() => quickAction(u.id, 'grant_premium')}
                        className="text-[10px] bg-gold/10 text-gold px-2 py-1 rounded-lg hover:bg-gold/20 transition-colors"
                        title="הענק פרימיום"
                      >
                        💎+
                      </button>
                    ) : (
                      <button
                        onClick={() => quickAction(u.id, 'revoke_premium')}
                        className="text-[10px] bg-danger/10 text-danger px-2 py-1 rounded-lg hover:bg-danger/20 transition-colors"
                        title="בטל פרימיום"
                      >
                        💎-
                      </button>
                    )}
                    <button
                      onClick={() => quickAction(u.id, 'reset_hearts')}
                      className="text-[10px] bg-white/5 text-white/50 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      title="אפס לבבות"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => quickAction(u.id, 'add_tokens')}
                      className="text-[10px] bg-white/5 text-white/50 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                      title="הוסף 50 טוקנים"
                    >
                      🪙+
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-white/50 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            הקודם
          </button>
          <span className="text-xs text-white/30">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-white/50 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            הבא
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
          <div className="glass-card p-6 w-full max-w-sm border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold text-gold mb-4">
              עריכת {editField} — {editUser.display_name || editUser.user_id?.slice(0, 8)}
            </h3>
            {editField === 'is_premium' ? (
              <select
                value={String(editValue)}
                onChange={e => setEditValue(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-frost-white focus:outline-none focus:border-gold/40"
                dir="rtl"
              >
                <option value="true">פרימיום</option>
                <option value="false">חינם</option>
              </select>
            ) : (
              <input
                type={['xp', 'hearts', 'tokens', 'level', 'current_streak'].includes(editField) ? 'number' : 'text'}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-frost-white focus:outline-none focus:border-gold/40"
                dir="ltr"
                autoFocus
              />
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-gold/20 text-gold py-2 rounded-xl text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50"
              >
                {saving ? 'שומר...' : 'שמור'}
              </button>
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 bg-white/5 text-white/50 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
