import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './AuthContext'
import {
  DEFAULT_PLAYER, MAX_HEARTS, FREE_DAILY_TOKENS,
  HEART_RECOVERY_MINUTES, getLevelForXP, XP_CORRECT_ANSWER
} from '../config/constants'

const PlayerContext = createContext(null)
const STORAGE_KEY = 'mindset_player'
const SAVE_DEBOUNCE = 1000

export function PlayerProvider({ children }) {
  const { user, isGuest, isAuthenticated } = useAuth()
  const [player, setPlayer] = useState(DEFAULT_PLAYER)
  const [loaded, setLoaded] = useState(false)
  const saveTimeout = useRef(null)

  // Load player data
  useEffect(() => {
    if (!isAuthenticated) return
    loadPlayerData()
  }, [isAuthenticated, user?.id])

  const loadPlayerData = async () => {
    // Try localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setPlayer(JSON.parse(stored)) } catch {}
    }

    // Then Supabase (if not guest)
    if (!isGuest && user?.id) {
      const { data } = await supabase
        .from('mindset_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        const mapped = mapFromDB(data)
        setPlayer(mapped)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped))
      } else {
        // Create new player row
        await supabase.from('mindset_users').insert({
          user_id: user.id,
          ...mapToDB(DEFAULT_PLAYER)
        })
      }
    }

    // Check streak
    updateStreak()
    // Check heart recovery
    recoverHearts()
    // Check daily token reset
    resetDailyTokens()

    setLoaded(true)
  }

  const updateStreak = () => {
    setPlayer(prev => {
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()

      if (prev.lastLoginDate === today) return prev

      let newStreak = prev.currentStreak
      if (prev.lastLoginDate === yesterday) {
        newStreak += 1
      } else if (prev.lastLoginDate !== today) {
        newStreak = 1
      }

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastLoginDate: today
      }
    })
  }

  const recoverHearts = () => {
    setPlayer(prev => {
      if (prev.hearts >= MAX_HEARTS || !prev.lastHeartLost) return prev
      const elapsed = (Date.now() - new Date(prev.lastHeartLost).getTime()) / 60000
      const recovered = Math.floor(elapsed / HEART_RECOVERY_MINUTES)
      if (recovered <= 0) return prev
      return {
        ...prev,
        hearts: Math.min(prev.hearts + recovered, MAX_HEARTS),
        lastHeartLost: recovered >= (MAX_HEARTS - prev.hearts) ? null : prev.lastHeartLost
      }
    })
  }

  const resetDailyTokens = () => {
    setPlayer(prev => {
      const today = new Date().toDateString()
      if (prev.lastLoginDate === today) return prev
      if (prev.isPremium) return prev
      return {
        ...prev,
        tokens: Math.max(prev.tokens, FREE_DAILY_TOKENS)
      }
    })
  }

  // Debounced save
  const savePlayer = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      if (!isGuest && user?.id) {
        await supabase
          .from('mindset_users')
          .update(mapToDB(data))
          .eq('user_id', user.id)
      }
    }, SAVE_DEBOUNCE)
  }, [isGuest, user?.id])

  // Update helper
  const updatePlayer = useCallback((updates) => {
    setPlayer(prev => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      next.level = getLevelForXP(next.xp)
      savePlayer(next)
      return next
    })
  }, [savePlayer])

  // Game actions
  const onCorrectAnswer = useCallback(() => {
    updatePlayer(prev => ({
      ...prev,
      xp: prev.xp + XP_CORRECT_ANSWER,
      totalCorrect: prev.totalCorrect + 1,
    }))
  }, [updatePlayer])

  const onWrongAnswer = useCallback(() => {
    updatePlayer(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
      totalWrong: prev.totalWrong + 1,
      lastHeartLost: prev.hearts <= 1 ? new Date().toISOString() : (prev.lastHeartLost || new Date().toISOString()),
    }))
  }, [updatePlayer])

  const spendToken = useCallback(() => {
    let canSpend = false
    updatePlayer(prev => {
      if (prev.tokens <= 0) return prev
      canSpend = true
      return { ...prev, tokens: prev.tokens - 1 }
    })
    return canSpend
  }, [updatePlayer])

  const completeLesson = useCallback((bookSlug, chapterId, lessonId, mistakes) => {
    updatePlayer(prev => {
      const key = `${bookSlug}:${chapterId}:${lessonId}`
      return {
        ...prev,
        xp: prev.xp + 50 + (mistakes === 0 ? 25 : 0),
        completedLessons: { ...prev.completedLessons, [key]: true },
      }
    })
  }, [updatePlayer])

  return (
    <PlayerContext.Provider value={{
      player, loaded, updatePlayer,
      onCorrectAnswer, onWrongAnswer, spendToken, completeLesson
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used within PlayerProvider')
  return context
}

// DB mapping helpers
function mapFromDB(row) {
  return {
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    hearts: row.hearts ?? MAX_HEARTS,
    maxHearts: row.max_hearts ?? MAX_HEARTS,
    tokens: row.tokens ?? FREE_DAILY_TOKENS,
    currentStreak: row.current_streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    lastLoginDate: row.last_login_date,
    lastHeartLost: row.last_heart_lost,
    isPremium: row.is_premium ?? false,
    premiumBooks: row.premium_books ?? [],
    totalCorrect: row.total_correct ?? 0,
    totalWrong: row.total_wrong ?? 0,
    achievements: row.achievements ?? [],
    dailyChallengeCompleted: row.daily_challenge_completed,
    onboardingComplete: row.onboarding_complete ?? false,
    completedLessons: row.completed_lessons ?? {},
    reviewQueue: row.review_queue ?? [],
  }
}

function mapToDB(player) {
  return {
    xp: player.xp,
    level: player.level,
    hearts: player.hearts,
    max_hearts: player.maxHearts,
    tokens: player.tokens,
    current_streak: player.currentStreak,
    longest_streak: player.longestStreak,
    last_login_date: player.lastLoginDate,
    last_heart_lost: player.lastHeartLost,
    is_premium: player.isPremium,
    premium_books: player.premiumBooks,
    total_correct: player.totalCorrect,
    total_wrong: player.totalWrong,
    achievements: player.achievements,
    daily_challenge_completed: player.dailyChallengeCompleted,
    onboarding_complete: player.onboardingComplete,
    completed_lessons: player.completedLessons,
    review_queue: player.reviewQueue,
  }
}
