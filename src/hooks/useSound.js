import { useRef, useCallback } from 'react'

const VOLUME_KEY = 'mindset_volume'
const DEFAULT_VOLUME = 0.7

export function useSound() {
  const ctx = useRef(null)
  const enabled = useRef(localStorage.getItem('mindset_sound') !== 'off')
  const volume = useRef(parseFloat(localStorage.getItem(VOLUME_KEY)) || DEFAULT_VOLUME)

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
    g.gain.value = gain * volume.current
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)
    osc.connect(g).connect(c.destination)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + duration)
  }

  const vibrate = (pattern) => {
    try { navigator?.vibrate?.(pattern) } catch {}
  }

  const play = useCallback((type) => {
    if (!enabled.current) return
    try {
      switch (type) {
        case 'correct':
          tone(523, 0.15); tone(659, 0.15, 'sine', 0.3, 0.1); tone(784, 0.2, 'sine', 0.3, 0.2)
          vibrate(50)
          break
        case 'wrong':
          tone(200, 0.3, 'triangle', 0.25)
          vibrate([50, 30, 50])
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
        case 'combo':
          tone(700, 0.1, 'sine', 0.2); tone(900, 0.1, 'sine', 0.2, 0.08); tone(1100, 0.15, 'sine', 0.2, 0.16)
          break
        case 'dailyComplete':
          [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'sine', 0.2, i * 0.1))
          tone(1319, 0.5, 'sine', 0.15, 0.55)
          break
        case 'hint':
          tone(880, 0.1, 'triangle', 0.15); tone(660, 0.15, 'triangle', 0.1, 0.1)
          break
        case 'timerWarning':
          tone(440, 0.08, 'square', 0.1); tone(440, 0.08, 'square', 0.1, 0.15)
          break
        case 'secondChance':
          tone(350, 0.15, 'triangle', 0.15); tone(440, 0.15, 'triangle', 0.15, 0.12)
          break
        case 'streakFreeze':
          tone(523, 0.1, 'sine', 0.2); tone(784, 0.15, 'sine', 0.2, 0.1)
          tone(1047, 0.2, 'sine', 0.15, 0.2)
          break
        case 'milestone':
          // Epic ascending scale with harmonics
          [440, 554, 659, 880, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'sine', 0.2, i * 0.08))
          tone(1319, 0.6, 'sine', 0.15, 0.5)
          vibrate([50, 30, 50, 30, 100])
          break
        case 'eventBoost':
          tone(660, 0.1); tone(880, 0.1, 'sine', 0.25, 0.08)
          tone(1100, 0.15, 'sine', 0.2, 0.16)
          vibrate(30)
          break
      }
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    enabled.current = !enabled.current
    localStorage.setItem('mindset_sound', enabled.current ? 'on' : 'off')
    return enabled.current
  }, [])

  const setVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val))
    volume.current = clamped
    localStorage.setItem(VOLUME_KEY, clamped.toString())
  }, [])

  const getVolume = useCallback(() => volume.current, [])

  return { play, toggle, isEnabled: () => enabled.current, setVolume, getVolume }
}
