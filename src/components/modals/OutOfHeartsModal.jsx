import { usePlayer } from '../../contexts/PlayerContext'
import { HEART_RECOVERY_MINUTES } from '../../config/constants'
import { Heart, Clock, Crown } from 'lucide-react'

export default function OutOfHeartsModal({ onClose, onPurchase }) {
  const { player } = usePlayer()

  const getTimeToRecover = () => {
    if (!player.lastHeartLost) return null
    const elapsed = (Date.now() - new Date(player.lastHeartLost).getTime()) / 60000
    const remaining = HEART_RECOVERY_MINUTES - (elapsed % HEART_RECOVERY_MINUTES)
    const min = Math.floor(remaining)
    const sec = Math.floor((remaining - min) * 60)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md p-4">
      <div className="glass-card max-w-sm w-full p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-danger/20 mx-auto mb-4 flex items-center justify-center">
          <Heart className="w-8 h-8 text-danger" />
        </div>
        <h3 className="font-display text-xl font-bold text-frost-white mb-2">נגמרו הלבבות!</h3>
        <p className="text-sm text-frost-white/50 mb-4">
          המתן שהלבבות יתאוששו או שדרג לפרימיום
        </p>

        {getTimeToRecover() && (
          <div className="flex items-center justify-center gap-2 text-frost-white/40 text-sm mb-6">
            <Clock className="w-4 h-4" />
            <span>לב הבא בעוד: {getTimeToRecover()}</span>
          </div>
        )}

        <button
          onClick={onPurchase}
          className="w-full py-3 rounded-xl bg-gradient-to-l from-gold to-warning text-bg-base font-bold text-sm mb-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4" />
          שדרג לפרימיום — לבבות ללא הגבלה
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-white/10 text-frost-white/50 text-sm hover:text-frost-white hover:border-white/20 transition-colors"
        >
          אמתין
        </button>
      </div>
    </div>
  )
}
