import { useLocation, useNavigate } from 'react-router-dom'
import { usePlayer } from '../../contexts/PlayerContext'
import { Home, RotateCcw, BarChart2, Settings, Trophy } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/settings', icon: Settings, label: 'הגדרות' },
  { path: '/stats', icon: BarChart2, label: 'סטטיסטיקות' },
  { path: '/leaderboard', icon: Trophy, label: 'מובילים' },
  { path: '/review', icon: RotateCcw, label: 'חזרה', badgeKey: 'review' },
  { path: '/home', icon: Home, label: 'בית' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { player } = usePlayer()

  // Include both manual review queue and due spaced-repetition items
  const today = new Date().toISOString().split('T')[0]
  const srDueCount = (player.spacedReviewQueue || []).filter(i => i.nextReviewDate <= today).length
  const reviewCount = (player.reviewQueue || []).length + srDueCount

  // Don't show on lesson page, landing, onboarding
  const hiddenPaths = ['/', '/lesson']
  const shouldHide = hiddenPaths.some(p =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  )
  if (shouldHide) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-base/90 backdrop-blur-xl border-t border-white/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="ניווט ראשי"
    >
      <ul className="max-w-2xl mx-auto flex items-center justify-around px-2 list-none m-0 p-0">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path === '/home' && location.pathname.startsWith('/book/'))
          const Icon = item.icon
          const badge = item.badgeKey === 'review' ? reviewCount : 0

          return (
            <li key={item.path}>
            <button
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 min-w-[56px] min-h-[52px] transition-colors ${
                isActive ? 'text-gold' : 'text-frost-white/30'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 1.5} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-warning text-[8px] font-bold text-bg-base flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 font-medium ${isActive ? 'text-gold' : 'text-frost-white/40'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gold nav-dot-in" />
              )}
            </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
