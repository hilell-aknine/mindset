import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../contexts/PlayerContext'
import { getXPProgress, LEVEL_NAMES } from '../../config/constants'
import { Brain, Flame, Heart, Zap, Settings, Crown, TrendingUp } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { player } = usePlayer()
  const [showXPDetails, setShowXPDetails] = useState(false)

  const xpProgress = getXPProgress(player.xp)
  const levelName = LEVEL_NAMES[player.level - 1] || LEVEL_NAMES[0]
  const nextLevelName = LEVEL_NAMES[player.level] || null

  const xpRef = useRef(null)

  // Close XP popup on click outside
  useEffect(() => {
    if (!showXPDetails) return
    const handler = (e) => {
      if (xpRef.current && !xpRef.current.contains(e.target)) {
        setShowXPDetails(false)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [showXPDetails])

  // Unread achievements badge
  const achievementCount = player.achievements?.length || 0
  const lastSeenAchievements = player.lastSeenAchievements || 0
  const newAchievements = achievementCount - lastSeenAchievements

  return (
    <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-lg border-b border-white/5" role="banner">
      <nav className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 overflow-hidden" aria-label="ניווט ראשי">
        {/* Logo */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 hover:opacity-80 active:opacity-60 transition-opacity"
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
              <Flame className={`w-4 h-4 ${player.currentStreak >= 7 ? 'animate-heartbeat' : ''}`} aria-hidden="true" />
              <span className="text-xs font-bold">{player.currentStreak}</span>
            </div>
          )}

          {/* Hearts */}
          <div className={`flex items-center gap-1 ${player.hearts <= 1 ? 'text-danger animate-pulse' : 'text-danger'}`} aria-label={`לבבות: ${player.hearts}`}>
            <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
            <span className="text-xs font-bold">{player.hearts}</span>
          </div>

          {/* Tokens */}
          <div className="flex items-center gap-1 text-gold" aria-label={`אסימונים: ${player.tokens}`}>
            <Zap className="w-4 h-4 fill-current" aria-hidden="true" />
            <span className="text-xs font-bold">{player.tokens}</span>
          </div>

          {/* XP / Level — clickable on mobile to show details */}
          <div className="relative" ref={xpRef}>
            <button
              onClick={() => setShowXPDetails(!showXPDetails)}
              className="flex items-center gap-2"
              aria-label={`רמה ${player.level}: ${levelName} — ${Math.round(xpProgress)}%`}
            >
              <div className="w-16 sm:w-20 h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={Math.round(xpProgress)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-frost-white/50 hidden sm:inline">{levelName}</span>
            </button>

            {/* XP details popup */}
            {showXPDetails && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 glass-card p-3 animate-drop-in z-50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs font-bold text-frost-white">רמה {player.level}: {levelName}</span>
                </div>
                <div className="text-[10px] text-frost-white/40 space-y-1">
                  <p>XP כולל: <span className="text-frost-white/70 font-bold">{player.xp.toLocaleString()}</span></p>
                  <p>התקדמות: <span className="text-frost-white/70 font-bold">{Math.round(xpProgress)}%</span></p>
                  {nextLevelName && <p>הרמה הבאה: <span className="text-gold font-bold">{nextLevelName}</span></p>}
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="p-2.5 -m-1 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-gold/50 hover:text-gold"
            aria-label="טבלת מובילים"
          >
            <Crown className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Stats — with achievement badge */}
          <button
            onClick={() => navigate('/stats')}
            className="p-2.5 -m-1 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-frost-white/40 hover:text-frost-white/70 relative"
            aria-label={`סטטיסטיקות${newAchievements > 0 ? ` — ${newAchievements} הישגים חדשים` : ''}`}
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            {newAchievements > 0 && (
              <span className="absolute top-0.5 right-0.5 z-[1] w-3.5 h-3.5 rounded-full bg-danger text-[8px] font-bold text-white flex items-center justify-center animate-bounce-in">
                {newAchievements}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
