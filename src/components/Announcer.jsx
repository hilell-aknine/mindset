import { createContext, useContext, useCallback, useRef, useState } from 'react'

const AnnouncerContext = createContext(null)

export function AnnouncerProvider({ children }) {
  const [message, setMessage] = useState('')
  const timeoutRef = useRef(null)

  const announce = useCallback((text) => {
    // Clear then set to force screen reader re-read
    setMessage('')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setMessage(text), 50)
  }, [])

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {message}
      </div>
    </AnnouncerContext.Provider>
  )
}

export function useAnnounce() {
  const announce = useContext(AnnouncerContext)
  if (!announce) {
    // Fallback no-op if used outside provider
    return () => {}
  }
  return announce
}
