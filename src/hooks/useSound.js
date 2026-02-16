import { useRef, useCallback } from 'react'

export function useSound() {
  const ctx = useRef(null)
  const enabled = useRef(localStorage.getItem('mindset_sound') !== 'off')

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.current.state === 'suspended') ctx.current.resume()
    return ctx.current
  }

  const tone = (freq, duration, type = 'sine', gain = 0.3, delay = 0) => {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.value = gain
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)
    osc.connect(g).connect(c.destination)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + duration)
  }

  const play = useCallback((type) => {
    if (!enabled.current) return
    try {
      switch (type) {
        case 'correct':
          tone(523, 0.15); tone(659, 0.15, 'sine', 0.3, 0.1); tone(784, 0.2, 'sine', 0.3, 0.2)
          break
        case 'wrong':
          tone(200, 0.3, 'triangle', 0.25)
          break
        case 'levelUp':
          [523, 587, 659, 784, 880].forEach((f, i) => tone(f, 0.15, 'sine', 0.25, i * 0.1))
          break
        case 'achievement':
          tone(659, 0.15); tone(784, 0.15, 'sine', 0.3, 0.15); tone(1047, 0.3, 'sine', 0.3, 0.3)
          break
        case 'lessonComplete':
          [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'sine', 0.25, i * 0.12))
          tone(1047, 0.4, 'sine', 0.2, 0.5)
          break
        case 'click':
          tone(600, 0.08, 'sine', 0.15)
          break
      }
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    enabled.current = !enabled.current
    localStorage.setItem('mindset_sound', enabled.current ? 'on' : 'off')
    return enabled.current
  }, [])

  return { play, toggle, isEnabled: () => enabled.current }
}
