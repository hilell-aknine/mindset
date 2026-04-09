import { useEffect, useState, useRef } from 'react'
import { Zap, Clock } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'

function getTimeUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)
  const diff = midnight - now
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { hours, mins }
}

export default function OutOfTokensModal({ onClose }) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef, { onEscape: onClose })

  // Live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={dialogRef} className="glass-card max-w-sm w-full p-6 text-center animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="tokens-dialog-title">
        <img
          src="/backgrounds/locked-books.png"
          alt="נגמרו הטוקנים"
          className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg shadow-gold/10"
        />
        <h3 id="tokens-dialog-title" className="font-display text-xl font-bold text-frost-white mb-2">נגמרה האנרגיה!</h3>
        <p className="text-sm text-frost-white/50 mb-3">
          הטוקנים נגמרו. מחר תקבל 3 טוקנים חדשים.
        </p>

        {/* Token reset countdown */}
        <div className="flex items-center justify-center gap-1.5 mb-5 text-frost-white/30">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">
            טוקנים חדשים בעוד {countdown.hours} שעות ו-{countdown.mins} דקות
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-white/10 text-frost-white/50 text-sm hover:text-frost-white hover:border-white/20 transition-colors"
        >
          אמתין למחר
        </button>
      </div>
    </div>
  )
}
