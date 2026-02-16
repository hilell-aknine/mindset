import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../contexts/PlayerContext'
import { getXPProgress, LEVEL_NAMES } from '../../config/constants'
import { Brain, Flame, Heart, Zap, Settings } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  const xpProgress = getXPProgress(player.xp)
  const levelName = LEVEL_NAMES[player.level - 1] || LEVEL_NAMES[0]

  return (
    <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 overflow-hidden">
        {/* Logo */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center">
            <Brain className="w-4 h-4 text-frost-white" />
          </div>
          <span className="font-display font-bold text-frost-white text-sm hidden sm:block">MindSet</span>
        </button>

        {/* Stats bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Streak */}
          {player.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-warning">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold">{player.currentStreak}</span>
            </div>
          )}

          {/* Hearts */}
          <div className="flex items-center gap-1 text-danger">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{player.hearts}</span>
          </div>

          {/* Tokens */}
          <div className="flex items-center gap-1 text-gold">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{player.tokens}</span>
          </div>

          {/* XP / Level */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-frost-white/50">{levelName}</span>
          </div>

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-frost-white/40 hover:text-frost-white/70"
            title="הגדרות"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
