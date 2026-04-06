import { useState } from 'react'
import { Shield, Check, Award } from 'lucide-react'
import { usePlayer } from '../contexts/PlayerContext'
import { useSound } from '../hooks/useSound'
import { getStreakTier, STREAK_TIERS } from '../config/constants'

/**
 * Streak Freeze — spend tokens to protect your streak for a day
 * Enhanced: streak tier badges (bronze/silver/gold/diamond) + shield reward at 7 days
 */
export default function StreakFreeze() {
  const { player, updatePlayer } = usePlayer()
  const { play } = useSound()
  const [justBought, setJustBought] = useState(false)

  const today = new Date().toDateString()
  const hasFreeze = player.streakFreezeDate === today
  const currentTier = getStreakTier(player.currentStreak)

  const buyFreeze = () => {
    if (hasFreeze) return
    updatePlayer(prev => ({
      ...prev,
      streakFreezeDate: today,
    }))
    play('streakFreeze')
    setJustBought(true)
    setTimeout(() => setJustBought(false), 2000)
  }

  if (player.currentStreak < 2) return null

  const isHighStreak = player.currentStreak >= 7
  const nextTier = STREAK_TIERS.find(t => t.days > player.currentStreak)

  return (
    <div className="space-y-2">
      {/* Streak tier badge */}
      {currentTier && (
        <div className={`glass-card p-2.5 flex items-center gap-2.5 animate-fade-in ${currentTier.bg} border-white/5`}>
          <div className={`w-8 h-8 rounded-lg ${currentTier.bg} flex items-center justify-center`}>
            <Award className={`w-4 h-4 ${currentTier.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{currentTier.emoji}</span>
              <span className={`text-xs font-bold ${currentTier.color}`}>דרגת רצף: {currentTier.label}</span>
            </div>
            {nextTier && (
              <p className="text-[9px] text-frost-white/30">
                עוד {nextTier.days - player.currentStreak} ימים ל{nextTier.emoji} {nextTier.label}
              </p>
            )}
          </div>
          {player.streakShieldEarned && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dusty-aqua/10 border border-dusty-aqua/20">
              <Shield className="w-3 h-3 text-dusty-aqua" />
              <span className="text-[9px] text-dusty-aqua font-bold">מגן</span>
            </div>
          )}
        </div>
      )}

      {/* Freeze card */}
      <div className={`glass-card p-3 flex items-center gap-3 animate-fade-in transition-all ${
        hasFreeze ? 'border-dusty-aqua/20' : isHighStreak && !hasFreeze ? 'border-warning/15 animate-pulse-glow' : 'border-white/5'
      } ${justBought ? 'animate-correct-pulse' : ''}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          hasFreeze ? 'bg-dusty-aqua/15' : isHighStreak ? 'bg-warning/10' : 'bg-white/5'
        } ${hasFreeze ? 'animate-glow-pulse' : ''}`}>
          <Shield className={`w-4 h-4 ${hasFreeze ? 'text-dusty-aqua' : isHighStreak ? 'text-warning' : 'text-frost-white/30'}`} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-frost-white flex items-center gap-1.5">
            {hasFreeze ? (
              <>
                הרצף מוגן היום!
                <Check className="w-3 h-3 text-dusty-aqua animate-bounce-in" />
              </>
            ) : isHighStreak ? (
              '🔥 הגן על הרצף!'
            ) : (
              'הגנת רצף'
            )}
          </p>
          <p className="text-[10px] text-frost-white/40">
            {hasFreeze
              ? `רצף של ${player.currentStreak} ימים לא יאופס`
              : isHighStreak
                ? `אל תפסיד ${player.currentStreak} ימים ברצף — הגן עכשיו!`
                : `הגן על הרצף (${player.currentStreak} ימים) ליום אחד`
            }
          </p>
        </div>
        {!hasFreeze && (
          <button
            onClick={buyFreeze}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 ${
              isHighStreak
                ? 'bg-warning/15 border-warning/30 text-warning hover:bg-warning/20'
                : 'bg-dusty-aqua/10 border-dusty-aqua/20 text-dusty-aqua hover:bg-dusty-aqua/15'
            }`}
            aria-label="הפעל הגנת רצף"
          >
            <Shield className="w-3 h-3" />
            הפעל
          </button>
        )}
        {justBought && (
          <span className="text-xs text-dusty-aqua font-bold animate-elastic-in">מוגן!</span>
        )}
      </div>
    </div>
  )
}
