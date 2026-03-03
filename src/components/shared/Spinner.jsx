import { useState, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'

const LOADING_TIPS = [
  'טיפ: ענה מהר יותר לבונוס מהירות!',
  'טיפ: רצף של תשובות נכונות = XP כפול',
  'טיפ: תרגל כל יום לשמור על הרצף',
  'טיפ: השתמש ברמז אם נתקעת',
  'טיפ: חזרות מחזקות את הזיכרון',
]

export default function Spinner({ size = 'md', text, showTip = false }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const tip = useMemo(() =>
    LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)],
  [])

  // Show tip after 1.5s of loading
  const [tipVisible, setTipVisible] = useState(false)
  useEffect(() => {
    if (!showTip) return
    const timer = setTimeout(() => setTipVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [showTip])

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8" role="status" aria-label={text || 'טוען'}>
      <Loader2 className={`${sizes[size]} text-gold animate-spin`} />
      {text && <p className="text-sm text-frost-white/60">{text}</p>}
      {showTip && tipVisible && (
        <p className="text-[11px] text-frost-white/25 animate-fade-in mt-2 max-w-xs text-center">
          {tip}
        </p>
      )}
    </div>
  )
}
