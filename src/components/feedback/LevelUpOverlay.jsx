import { useEffect, useState } from 'react'
import { LEVEL_NAMES } from '../../config/constants'
import { Trophy } from 'lucide-react'

export default function LevelUpOverlay({ level, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 400)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const levelName = LEVEL_NAMES[level - 1] || LEVEL_NAMES[0]

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-md transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`text-center transition-transform duration-500 ${visible ? 'scale-100' : 'scale-75'}`}>
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold to-warning mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
          <Trophy className="w-12 h-12 text-bg-base" />
        </div>
        <p className="text-gold text-sm font-bold mb-2">עלית רמה!</p>
        <h2 className="font-display text-4xl font-bold text-frost-white mb-2">רמה {level}</h2>
        <p className="text-frost-white/60 text-lg">{levelName}</p>
      </div>
    </div>
  )
}
