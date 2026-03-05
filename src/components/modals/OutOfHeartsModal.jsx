import { useState, useEffect, useRef, useCallback } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { HEART_RECOVERY_MINUTES } from '../../config/constants'
import { Heart, Clock, Crown } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'

export default function OutOfHeartsModal({ onClose, onPurchase }) {
  const { player } = usePlayer()
  const [timeStr, setTimeStr] = useState('')
  const modalRef = useRef(null)

  const handleEscape = useCallback(() => onClose(), [onClose])
  useFocusTrap(modalRef, { onEscape: handleEscape })

  // Live countdown timer — updates every second
  useEffect(() => {
    const update = () => {
      if (!player.lastHeartLost) {
        setTimeStr('')
        return
      }
      const elapsed = (Date.now() - new Date(player.lastHeartLost).getTime()) / 60000
      const remaining = HEART_RECOVERY_MINUTES - (elapsed % HEART_RECOVERY_MINUTES)
      const min = Math.floor(remaining)
      const sec = Math.floor((remaining - min) * 60)
      setTimeStr(`${min}:${sec.toString().padStart(2, '0')}`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [player.lastHeartLost])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-label="נגמרו הלבבות">
      <div ref={modalRef} className="glass-card max-w-sm w-full p-6 text-center animate-bounce-in">
        {/* Hearts display */}
        <div className="w-16 h-16 rounded-2xl bg-danger/20 mx-auto mb-4 flex items-center justify-center relative">
          <Heart className="w-8 h-8 text-danger animate-heartbeat" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-bg-base border-2 border-danger/30 flex items-center justify-center text-[10px] font-bold text-danger">
            {player.hearts || 0}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-frost-white mb-2">נגמרו הלבבות!</h3>

        {/* Hearts bar */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Heart
              key={i}
              className={`w-5 h-5 ${i <= (player.hearts || 0) ? 'text-danger fill-danger' : 'text-white/10'}`}
            />
          ))}
        </div>

        <p className="text-sm text-frost-white/50 mb-4">
          המתן שהלבבות יתאוששו או שדרג לפרימיום
        </p>

        {/* Live countdown */}
        {timeStr && (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 mb-5">
            <Clock className="w-4 h-4 text-frost-white/30" />
            <span className="text-sm text-frost-white/50 font-mono">{timeStr}</span>
            <span className="text-[10px] text-frost-white/25">ללב הבא</span>
          </div>
        )}

        {/* How hearts work */}
        <div className="text-right space-y-1.5 mb-5 px-3 py-3 rounded-xl bg-white/3 border border-white/5">
          <p className="text-[10px] font-bold text-frost-white/50 mb-2">איך לבבות עובדים?</p>
          <p className="text-[10px] text-frost-white/35 flex items-center gap-2">
            <span>❤️</span> מתחילים עם 5 לבבות
          </p>
          <p className="text-[10px] text-frost-white/35 flex items-center gap-2">
            <span>⏱️</span> לב חוזר כל {HEART_RECOVERY_MINUTES} דקות
          </p>
          <p className="text-[10px] text-frost-white/35 flex items-center gap-2">
            <span>👑</span> פרימיום = לבבות ללא הגבלה
          </p>
        </div>

        <button
          onClick={onPurchase}
          className="w-full py-3 rounded-xl bg-gradient-to-l from-gold to-warning text-bg-base font-bold text-sm mb-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          aria-label="שדרג לפרימיום — לבבות ללא הגבלה"
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
