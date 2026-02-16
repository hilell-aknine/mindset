import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import AICoachChat from './AICoachChat'

export default function AICoachButton({ bookSlug, systemPrompt }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-30 w-14 h-14 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua text-frost-white shadow-lg shadow-deep-petrol/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="מאמן AI"
      >
        <MessageCircle className="w-6 h-6" />
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
