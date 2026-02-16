import { useState } from 'react'
import ReactConfetti from 'react-confetti'
import { usePlayer } from '../../contexts/PlayerContext'
import { useToast } from '../../contexts/ToastContext'
import { PRICE_SINGLE_BOOK, PRICE_MASTERY_BUNDLE, PAID_BOOK_TOKENS } from '../../config/constants'
import { Crown, BookOpen, Sparkles, Loader2, Check } from 'lucide-react'

export default function PurchaseModal({ bookSlug, onClose }) {
  const { updatePlayer } = usePlayer()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const simulatePurchase = async (tier) => {
    setLoading(true)
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000))

    if (tier === 'book') {
      updatePlayer(prev => ({
        ...prev,
        premiumBooks: [...prev.premiumBooks, bookSlug],
        tokens: prev.tokens + PAID_BOOK_TOKENS,
      }))
      toast.success(`הספר נפתח! קיבלת ${PAID_BOOK_TOKENS} טוקנים`)
    } else {
      updatePlayer(prev => ({
        ...prev,
        isPremium: true,
        tokens: 999,
      }))
      toast.success('שדרגת לפרימיום! כל הספרים פתוחים')
    }

    setLoading(false)
    setSuccess(true)
    setTimeout(onClose, 3000)
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md">
        <ReactConfetti recycle={false} numberOfPieces={200} />
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-success/20 mx-auto mb-4 flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h3 className="font-display text-2xl font-bold text-frost-white">התשלום הצליח!</h3>
          <p className="text-frost-white/50 mt-2">תהנה מהלמידה 🎉</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-bg-base/80 backdrop-blur-md p-4">
      <div className="glass-card max-w-md w-full p-6 animate-slide-up sm:animate-fade-in">
        <h3 className="font-display text-xl font-bold text-frost-white text-center mb-6">
          בחר תוכנית
        </h3>

        <div className="space-y-3">
          {/* Free tier */}
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-frost-white/30" />
              <span className="font-bold text-sm text-frost-white/50">חינם</span>
            </div>
            <ul className="text-xs text-frost-white/30 space-y-1 mr-8">
              <li>פרק ראשון של כל ספר</li>
              <li>3 טוקני AI ביום</li>
            </ul>
          </div>

          {/* Single book */}
          <button
            onClick={() => simulatePurchase('book')}
            disabled={loading}
            className="w-full p-4 rounded-xl border border-dusty-aqua/30 bg-dusty-aqua/5 hover:bg-dusty-aqua/10 transition-colors text-right"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gold font-bold text-sm">₪{PRICE_SINGLE_BOOK}</span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-dusty-aqua" />
                <span className="font-bold text-sm text-frost-white">ספר מלא</span>
              </div>
            </div>
            <ul className="text-xs text-frost-white/50 space-y-1 mr-7">
              <li>כל הפרקים של הספר</li>
              <li>{PAID_BOOK_TOKENS} טוקני AI</li>
            </ul>
          </button>

          {/* Bundle */}
          <button
            onClick={() => simulatePurchase('bundle')}
            disabled={loading}
            className="w-full p-4 rounded-xl border border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors text-right relative overflow-hidden"
          >
            <span className="absolute top-2 left-2 text-[9px] font-bold bg-gold text-bg-base px-2 py-0.5 rounded-full">
              מומלץ
            </span>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gold font-bold text-sm">₪{PRICE_MASTERY_BUNDLE}</span>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold" />
                <span className="font-bold text-sm text-frost-white">חבילת מאסטר</span>
              </div>
            </div>
            <ul className="text-xs text-frost-white/50 space-y-1 mr-7">
              <li>כל הספרים — ללא הגבלה</li>
              <li>מאמן AI ללא הגבלה</li>
              <li>חוברות עבודה להדפסה</li>
            </ul>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-gold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">מעבד תשלום...</span>
          </div>
        )}

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full mt-4 py-2 text-xs text-frost-white/30 hover:text-frost-white/50 transition-colors"
        >
          לא עכשיו
        </button>
      </div>
    </div>
  )
}
