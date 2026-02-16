import { useEffect, useState } from 'react'

export default function AchievementPopup({ achievement, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 400)
    }, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="glass-card px-6 py-4 flex items-center gap-4 border-gold/30 shadow-lg shadow-gold/10">
        <span className="text-3xl">{achievement.icon}</span>
        <div>
          <p className="text-xs text-gold font-bold">הישג חדש!</p>
          <p className="text-sm font-semibold text-frost-white">{achievement.title}</p>
          <p className="text-xs text-frost-white/40">{achievement.description}</p>
        </div>
      </div>
    </div>
  )
}
