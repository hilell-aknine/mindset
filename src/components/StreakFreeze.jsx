import { Shield, Zap } from 'lucide-react'
import { usePlayer } from '../contexts/PlayerContext'

/**
 * Streak Freeze — spend tokens to protect your streak for a day
 */
export default function StreakFreeze() {
  const { player, updatePlayer } = usePlayer()

  const today = new Date().toDateString()
  const hasFreeze = player.streakFreezeDate === today
  const canAfford = (player.tokens || 0) >= 2

  const buyFreeze = () => {
    if (hasFreeze || !canAfford) return
    updatePlayer(prev => ({
      ...prev,
      tokens: prev.tokens - 2,
      streakFreezeDate: today,
    }))
  }

  if (player.currentStreak < 2) return null

  return (
    <div className={`glass-card p-3 flex items-center gap-3 animate-fade-in ${
      hasFreeze ? 'border-dusty-aqua/20' : 'border-white/5'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
        hasFreeze ? 'bg-dusty-aqua/15' : 'bg-white/5'
      }`}>
        <Shield className={`w-4 h-4 ${hasFreeze ? 'text-dusty-aqua' : 'text-frost-white/30'}`} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-frost-white">
          {hasFreeze ? 'הרצף מוגן היום!' : 'הגנת רצף'}
        </p>
        <p className="text-[10px] text-frost-white/40">
          {hasFreeze ? 'הרצף שלך לא יאופס היום' : 'שמור על הרצף ליום אחד'}
        </p>
      </div>
      {!hasFreeze && (
        <button
          onClick={buyFreeze}
          disabled={!canAfford}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-dusty-aqua/10 border border-dusty-aqua/20 text-xs font-bold text-dusty-aqua hover:bg-dusty-aqua/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Zap className="w-3 h-3" />2
        </button>
      )}
    </div>
  )
}
