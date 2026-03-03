import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../contexts/PlayerContext'
import { getXPProgress, LEVEL_NAMES } from '../../config/constants'
import { Brain, Flame, Heart, Zap, Settings, Crown } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  const xpProgress = getXPProgress(player.xp)
  const levelName = LEVEL_NAMES[player.level - 1] || LEVEL_NAMES[0]

  return (
    <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-lg border-b border-white/5" role="banner">
      <nav className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 overflow-hidden" aria-label="ניווט ראשי">
        {/* Logo */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="דף הבית - MindSet"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center">
            <Brain className="w-4 h-4 text-frost-white" />
          </div>
          <span className="font-display font-bold text-frost-white text-sm hidden sm:block">MindSet</span>
        </button>

        {/* Stats bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0" role="status" aria-label="סטטיסטיקות שחקן">
          {/* Streak */}
          {player.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-warning" aria-label={`רצף: ${player.currentStreak} ימים`}>
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-bold">{player.currentStreak}</span>
            </div>
          )}

          {/* Hearts */}
          <div className="flex items-center gap-1 text-danger" aria-label={`לבבות: ${player.hearts}`}>
            <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
            <span className="text-xs font-bold">{player.hearts}</span>
          </div>

          {/* Tokens */}
          <div className="flex items-center gap-1 text-gold" aria-label={`אסימונים: ${player.tokens}`}>
            <Zap className="w-4 h-4 fill-current" aria-hidden="true" />
            <span className="text-xs font-bold">{player.tokens}</span>
          </div>

          {/* XP / Level */}
          <div className="hidden sm:flex items-center gap-2" aria-label={`רמה: ${levelName}`}>
            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={Math.round(xpProgress)} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-frost-white/50">{levelName}</span>
          </div>

          {/* Leaderboard */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gold/50 hover:text-gold"
            aria-label="טבלת מובילים"
          >
            <Crown className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-frost-white/40 hover:text-frost-white/70"
            aria-label="הגדרות"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>
  )
}
