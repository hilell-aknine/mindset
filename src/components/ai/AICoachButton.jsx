import { useState, useEffect, useCallback } from 'react'
import { MessageCircle } from 'lucide-react'
import AICoachChat from './AICoachChat'

export default function AICoachButton({ bookSlug, systemPrompt }) {
  const [open, setOpen] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  const toggleOpen = useCallback(() => {
    setOpen(prev => {
      if (!prev) setHasNewMessage(false)
      return !prev
    })
  }, [])

  // Keyboard shortcut: Ctrl+M to toggle AI coach
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault()
        toggleOpen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleOpen])

  // Pulse hint after 30s if user hasn't opened chat yet
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open) setHasNewMessage(true)
    }, 30000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 left-6 z-30 w-14 h-14 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua text-frost-white shadow-lg shadow-deep-petrol/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${
          hasNewMessage ? 'animate-heartbeat' : ''
        }`}
        aria-label="מאמן AI — Ctrl+M"
        title="מאמן AI (Ctrl+M)"
      >
        <MessageCircle className="w-6 h-6" />
        {/* Notification dot */}
        {hasNewMessage && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gold border-2 border-bg-base animate-pulse" />
        )}
      </button>

      {open && (
        <AICoachChat
          bookSlug={bookSlug}
          systemPrompt={systemPrompt}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
