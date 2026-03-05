import { useEffect } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(ref, { onEscape } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const previousFocus = document.activeElement

    // Focus first focusable element inside
    const focusables = () => [...el.querySelectorAll(FOCUSABLE)]
    const first = focusables()[0]
    if (first) first.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }

      if (e.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) return

      const firstItem = items[0]
      const lastItem = items[items.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstItem) {
          e.preventDefault()
          lastItem.focus()
        }
      } else {
        if (document.activeElement === lastItem) {
          e.preventDefault()
          firstItem.focus()
        }
      }
    }

    el.addEventListener('keydown', handleKeyDown)

    return () => {
      el.removeEventListener('keydown', handleKeyDown)
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus()
      }
    }
  }, [ref, onEscape])
}
