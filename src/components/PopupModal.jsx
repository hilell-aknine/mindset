import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../config/supabase'

const STORAGE_KEY = 'mindset_dismissed_popups'

function getDismissedIds() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function addDismissedId(id) {
  const ids = getDismissedIds()
  if (!ids.includes(id)) {
    ids.push(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }
}

export default function PopupModal() {
  const [popups, setPopups] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchPopups = async () => {
      const { data } = await supabase
        .from('mindset_popups')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (!data?.length) return

      const dismissed = getDismissedIds()
      const undismissed = data.filter(p => !dismissed.includes(p.id))

      // Clean up stale dismissed IDs
      const activeIds = data.map(p => p.id)
      const cleaned = dismissed.filter(id => activeIds.includes(id))
      if (cleaned.length !== dismissed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
      }

      setPopups(undismissed)
    }

    fetchPopups()
  }, [])

  const dismiss = () => {
    if (popups[currentIndex]) {
      addDismissedId(popups[currentIndex].id)
    }
    if (currentIndex + 1 < popups.length) {
      setCurrentIndex(i => i + 1)
    } else {
      setPopups([])
    }
  }

  if (!popups.length || currentIndex >= popups.length) return null

  const popup = popups[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={dismiss}
    >
      <div
        className="glass-card p-6 max-w-sm w-full mx-4 border-gold/20 animate-bounce-in relative text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 left-3 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          aria-label="סגור"
        >
          <X className="w-5 h-5 text-frost-white/40" />
        </button>

        {/* Image */}
        {popup.image_url && (
          <img
            src={popup.image_url}
            alt=""
            className="w-full h-40 object-cover rounded-xl mb-4"
          />
        )}

        {/* Title */}
        <h3 className="font-display text-xl font-bold text-gold mb-2">{popup.title}</h3>

        {/* Body */}
        <p className="text-sm text-frost-white/70 leading-relaxed mb-4 whitespace-pre-wrap">{popup.body}</p>

        {/* CTA button */}
        {popup.cta_text && popup.cta_url && (
          <a
            href={popup.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-xl bg-gold/15 border border-gold/30 text-gold font-bold text-sm hover:bg-gold/25 transition-colors mb-2"
          >
            {popup.cta_text}
          </a>
        )}

        {/* Popup counter */}
        {popups.length > 1 && (
          <p className="text-[10px] text-frost-white/20 mt-2">
            {currentIndex + 1} מתוך {popups.length}
          </p>
        )}
      </div>
    </div>
  )
}
