import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../contexts/PlayerContext'
import { getXPProgress, LEVEL_NAMES, HEART_RECOVERY_MINUTES, MAX_HEARTS } from '../../config/constants'
import { Brain, Flame, Heart, Zap, TrendingUp } from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { player } = usePlayer()
  const [showXPDetails, setShowXPDetails] = useState(false)
  const [heartTimerStr, setHeartTimerStr] = useState('')

  // Live countdown to next heart recovery
  useEffect(() => {
    if (player.hearts >= MAX_HEARTS || !player.lastHeartLost) {
      setHeartTimerStr('')
      return
    }
    const update = () => {
      const elapsed = (Date.now() - new Date(player.lastHeartLost).getTime()) / 60000
      const remaining = HEART_RECOVERY_MINUTES - (elapsed % HEART_RECOVERY_MINUTES)
      const min = Math.floor(remaining)
      const sec = Math.floor((remaining - min) * 60)
      setHeartTimerStr(`${min}:${sec.toString().padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [player.hearts, player.lastHeartLost])

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

  return (
    <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-lg border-b border-white/5 safe-top" role="banner">
      <nav className="max-w-2xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2" aria-label="סרגל סטטוס">
        {/* Logo — 44px touch target */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 min-h-[44px] min-w-[44px] hover:opacity-80 active:opacity-60 transition-opacity"
          aria-label="דף הבית - MindSet"
        >
          <img src="/backgrounds/mindset-logo.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-frost-white text-sm hidden sm:block">MindSet</span>
        </button>

        {/* Stats bar — game status indicators */}
        <div className="flex items-center gap-3 sm:gap-4" role="status" aria-label="סטטיסטיקות שחקן">
          {/* Streak */}
          {player.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-warning min-h-[44px] justify-center" aria-label={`רצף: ${player.currentStreak} ימים`}>
              <Flame className={`w-[18px] h-[18px] ${player.currentStreak >= 7 ? 'animate-heartbeat' : ''}`} aria-hidden="true" />
              <span className="text-xs font-bold">{player.currentStreak}</span>
            </div>
          )}

          {/* Hearts — bigger touch target */}
          <div
            className={`flex items-center gap-1 min-h-[44px] justify-center ${player.hearts <= 1 ? 'text-danger animate-pulse' : 'text-danger'}`}
            aria-label={`לבבות: ${player.hearts}`}
          >
            <Heart className="w-[18px] h-[18px] fill-current" aria-hidden="true" />
            <span className="text-xs font-bold">{player.hearts}</span>
            {heartTimerStr && (
              <span className="text-[10px] text-frost-white/30 font-mono">{heartTimerStr}</span>
            )}
          </div>

          {/* Tokens */}
          <div className="flex items-center gap-1 text-gold min-h-[44px] justify-center" aria-label={`אסימונים: ${player.tokens}`}>
            <Zap className="w-[18px] h-[18px] fill-current" aria-hidden="true" />
            <span className="text-xs font-bold">{player.tokens}</span>
          </div>

          {/* XP / Level — clickable */}
          <div className="relative" ref={xpRef}>
            <button
              onClick={() => setShowXPDetails(!showXPDetails)}
              className="flex items-center gap-2 min-h-[44px]"
              aria-label={`רמה ${player.level}: ${levelName} — ${Math.round(xpProgress)}%`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-gold/70">Lv.{player.level}</span>
                <div className="w-16 sm:w-20 h-2 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={Math.round(xpProgress)} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </button>

            {/* XP details popup */}
            {showXPDetails && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 glass-card p-4 animate-drop-in z-50 shadow-xl shadow-black/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  <span className="text-xs font-bold text-frost-white">רמה {player.level}: {levelName}</span>
                </div>
                <div className="text-[11px] text-frost-white/40 space-y-1.5">
                  <p>XP כולל: <span className="text-frost-white/70 font-bold">{player.xp.toLocaleString()}</span></p>
                  <p>התקדמות: <span className="text-frost-white/70 font-bold">{Math.round(xpProgress)}%</span></p>
                  {nextLevelName && <p>הרמה הבאה: <span className="text-gold font-bold">{nextLevelName}</span></p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
