import { useEffect } from 'react'

/**
 * iOS-safe body scroll lock.
 *
 * Saves the current scroll position and body style, pins the body in place,
 * and restores everything (including scrollY) on cleanup. Safe against
 * unmount races — if the component unmounts while scrolling, the lock is
 * guaranteed to release because the cleanup runs synchronously.
 *
 * @param {boolean} locked  Whether scroll should be locked.
 */
export function useBodyScrollLock(locked = true) {
  useEffect(() => {
    if (!locked) return

    const { body } = document
    const scrollY = window.scrollY || window.pageYOffset || 0

    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    }

    // Compensate for scrollbar removal to avoid layout shift on desktop
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'

    return () => {
      body.style.overflow = prev.overflow
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.width = prev.width
      body.style.paddingRight = prev.paddingRight
      // Restore scroll position (important for long pages)
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}

export default useBodyScrollLock
