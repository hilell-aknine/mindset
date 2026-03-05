import { useState, useEffect } from 'react'
import { supabase } from '../../../config/supabase'

// Import book data
import atomicHabits from '../../../data/books/atomic-habits.json'
import strengthsFinder from '../../../data/books/strengths-finder.json'
import happyChemicals from '../../../data/books/happy-chemicals.json'
import nextFiveMoves from '../../../data/books/next-five-moves.json'
import mindsetBook from '../../../data/books/mindset-book.json'

const BOOKS = [atomicHabits, strengthsFinder, happyChemicals, nextFiveMoves, mindsetBook]

export default function ContentTab() {
  const [completionData, setCompletionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedBook, setExpandedBook] = useState(null)

  useEffect(() => { loadContent() }, [])

  async function loadContent() {
    try {
      const { data: users, error } = await supabase
        .from('mindset_users')
        .select('completed_lessons')

      if (error) throw error

      const totalUsers = users?.length || 1

      // Aggregate completions
      const lessonCounts = {}
      for (const u of users || []) {
        const completed = u.completed_lessons || {}
        for (const key of Object.keys(completed)) {
          lessonCounts[key] = (lessonCounts[key] || 0) + 1
        }
      }

      // Build per-book stats
      const bookStats = BOOKS.map(book => {
        let totalLessons = 0
        let totalCompletions = 0

        const chapters = book.chapters.map((ch, ci) => {
          const lessons = ch.lessons.map((les, li) => {
            totalLessons++
            const key = `${book.slug}:${ci}:${li}`
            const completions = lessonCounts[key] || 0
            totalCompletions += completions
            return {
              title: les.title,
              exerciseCount: les.exercises?.length || 0,
              completions,
              rate: Math.round((completions / totalUsers) * 100),
            }
          })

          const chapterCompletions = lessons.reduce((s, l) => s + l.completions, 0)
          return {
            title: ch.title,
            icon: ch.icon,
            isFree: ch.isFree,
            lessons,
            avgRate: lessons.length
              ? Math.round(lessons.reduce((s, l) => s + l.rate, 0) / lessons.length)
              : 0,
            totalCompletions: chapterCompletions,
          }
        })

        return {
          slug: book.slug,
          title: book.title,
          icon: book.icon,
          author: book.author,
          totalLessons,
          totalCompletions,
          chapters,
          avgRate: totalLessons
            ? Math.round((totalCompletions / (totalLessons * totalUsers)) * 100)
            : 0,
        }
      })

      // Exercise type breakdown
      const typeCounts = {}
      for (const book of BOOKS) {
        for (const ch of book.chapters) {
          for (const les of ch.lessons) {
            for (const ex of les.exercises || []) {
              typeCounts[ex.type] = (typeCounts[ex.type] || 0) + 1
            }
          }
        }
      }

      setCompletionData({ bookStats, typeCounts, totalUsers })
    } catch (err) {
      console.error('Content load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="glass-card p-8 text-center text-white/40 animate-pulse">טוען נתוני תוכן...</div>
  }

  const { bookStats, typeCounts, totalUsers } = completionData || {}
  const TYPE_LABELS = {
    'multiple-choice': 'בחירה מרובה',
    'fill-blank': 'השלם חסר',
    'order': 'סידור',
    'compare': 'השוואה',
    'match': 'התאמה',
    'improve': 'שיפור',
    'identify': 'זיהוי',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gold">תוכן וספרים</h2>
        <span className="text-xs text-white/30">{totalUsers} משתמשים רשומים</span>
      </div>

      {/* Books overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bookStats?.map(book => (
          <div key={book.slug} className="glass-card p-4">
            <button
              onClick={() => setExpandedBook(expandedBook === book.slug ? null : book.slug)}
              className="w-full text-right"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{book.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-frost-white text-base">{book.title}</h3>
                  <p className="text-[10px] text-white/30">{book.author} — {book.totalLessons} שיעורים</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-gold">{book.avgRate}%</p>
                  <p className="text-[10px] text-white/30">השלמה ממוצעת</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
                  style={{ width: `${book.avgRate}%` }}
                />
              </div>
            </button>

            {/* Expanded chapter breakdown */}
            {expandedBook === book.slug && (
              <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                {book.chapters.map((ch, ci) => (
                  <div key={ci} className="bg-white/[0.02] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{ch.icon}</span>
                      <span className="text-sm text-frost-white font-medium flex-1">{ch.title}</span>
                      {ch.isFree && <span className="text-[9px] bg-success/10 text-success px-1.5 py-0.5 rounded">חינם</span>}
                      <span className="text-xs text-gold font-medium">{ch.avgRate}%</span>
                    </div>
                    {ch.lessons.map((les, li) => (
                      <div key={li} className="flex items-center gap-2 text-xs text-white/40 py-0.5 pr-6">
                        <span className="flex-1">{les.title}</span>
                        <span className="text-white/20">{les.exerciseCount} תרגילים</span>
                        <span className={`font-medium ${les.rate > 50 ? 'text-success' : les.rate > 20 ? 'text-warning' : 'text-white/30'}`}>
                          {les.completions} ({les.rate}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exercise type distribution */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-white/60 mb-3">התפלגות סוגי תרגילים</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(typeCounts || {}).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <div key={type} className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-frost-white">{count}</p>
              <p className="text-[10px] text-white/40">{TYPE_LABELS[type] || type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
