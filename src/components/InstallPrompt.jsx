import { useState, useEffect, useRef } from 'react'
import { Download, X } from 'lucide-react'
import { usePlayer } from '../contexts/PlayerContext'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('mindset_install_dismissed') === 'true'
  )
  const { player } = usePlayer()
  const promptRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      promptRef.current = e
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null
  // Only show after user completed at least 1 lesson
  if (!player.completedLessons || player.completedLessons.length === 0) return null

  const handleInstall = async () => {
    promptRef.current?.prompt()
    const result = await promptRef.current?.userChoice
    if (result?.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('mindset_install_dismissed', 'true')
  }

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 pb-2 animate-fade-in">
      <div className="glass-card p-3 flex items-center gap-3 max-w-lg mx-auto border-gold/20">
        <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
          <Download className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-frost-white">התקן את MindSet</p>
          <p className="text-[10px] text-frost-white/50">גישה מהירה מהמסך הראשי</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg bg-gold text-bg-base text-xs font-bold shrink-0 active:scale-95 transition-transform"
        >
          התקן
        </button>
        <button
          onClick={handleDismiss}
          className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-white/5 shrink-0"
          aria-label="סגור"
        >
          <X className="w-3.5 h-3.5 text-frost-white/40" />
        </button>
      </div>
    </div>
  )
}
