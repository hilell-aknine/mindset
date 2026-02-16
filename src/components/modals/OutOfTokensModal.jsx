import { Zap, Crown } from 'lucide-react'

export default function OutOfTokensModal({ onClose, onPurchase }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md p-4">
      <div className="glass-card max-w-sm w-full p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gold/20 mx-auto mb-4 flex items-center justify-center">
          <Zap className="w-8 h-8 text-gold" />
        </div>
        <h3 className="font-display text-xl font-bold text-frost-white mb-2">נגמרה האנרגיה!</h3>
        <p className="text-sm text-frost-white/50 mb-6">
          הטוקנים נגמרו. מחר תקבל 3 טוקנים חדשים, או שדרג לפרימיום לגישה בלתי מוגבלת למאמן AI.
        </p>

        <button
          onClick={onPurchase}
          className="w-full py-3 rounded-xl bg-gradient-to-l from-gold to-warning text-bg-base font-bold text-sm mb-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Crown className="w-4 h-4" />
          שדרג — 50 טוקנים + כל הספרים
        </button>

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
