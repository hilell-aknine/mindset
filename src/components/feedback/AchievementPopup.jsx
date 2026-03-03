import { useEffect, useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { RARITY } from '../../lib/achievements'

export default function AchievementPopup({ achievement, onClose }) {
  const [visible, setVisible] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  const rarity = RARITY[achievement.rarity || 'common']
  const isSpecial = achievement.rarity === 'epic' || achievement.rarity === 'legendary'

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 400)
  }, [onClose])

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    setTimeout(() => setShowParticles(true), 300)
    const timer = setTimeout(dismiss, isSpecial ? 5000 : 3500)
    return () => clearTimeout(timer)
  }, [dismiss, isSpecial])

  // Keyboard: Enter/Escape to dismiss early
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault()
        dismiss()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dismiss])

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`glass-card px-6 py-4 flex items-center gap-4 shadow-lg relative overflow-hidden cursor-pointer ${rarity.border}`}
        onClick={dismiss}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 progress-shimmer pointer-events-none opacity-30" />

        {/* Glow for epic/legendary */}
        {isSpecial && (
          <div className={`absolute inset-0 ${
            achievement.rarity === 'legendary' ? 'bg-gold/5' : 'bg-[#a855f7]/5'
          } animate-pulse-glow pointer-events-none`} />
        )}

        {/* Icon with particles */}
        <div className="relative">
          <span className="text-3xl block animate-bounce-in">{achievement.icon}</span>
          {showParticles && isSpecial && (
            <>
              <Sparkles className={`absolute -top-1 -right-1 w-3 h-3 ${rarity.color} animate-bounce-in`} style={{ animationDelay: '0.1s' }} />
              <Sparkles className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 ${rarity.color} animate-bounce-in`} style={{ animationDelay: '0.2s' }} />
            </>
          )}
        </div>

        <div>
          <p className={`text-xs font-bold flex items-center gap-1 ${rarity.color}`}>
            <Sparkles className="w-3 h-3" />
            הישג חדש!
          </p>
          <p className="text-sm font-semibold text-frost-white">{achievement.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-frost-white/40">{achievement.description}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${rarity.bg} ${rarity.color} font-bold`}>
              {rarity.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
