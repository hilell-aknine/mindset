import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './AuthContext'
import {
  DEFAULT_PLAYER, MAX_HEARTS, FREE_DAILY_TOKENS,
  HEART_RECOVERY_MINUTES, getLevelForXP, XP_CORRECT_ANSWER,
  XP_LESSON_COMPLETE, XP_PERFECT_LESSON, getComboBonus,
  SR_INTERVALS, XP_SR_REVIEW, XP_CHAPTER_AUDIO
} from '../config/constants'
import strengthsFinder from '../data/books/strengths-finder.json'
import atomicHabits from '../data/books/atomic-habits.json'
import happyChemicals from '../data/books/happy-chemicals.json'
import nextFiveMoves from '../data/books/next-five-moves.json'
import mindsetBook from '../data/books/mindset-book.json'
import indistractable from '../data/books/indistractable.json'

const ALL_BOOKS = { 'strengths-finder': strengthsFinder, 'atomic-habits': atomicHabits, 'happy-chemicals': happyChemicals, 'next-five-moves': nextFiveMoves, 'mindset-book': mindsetBook, 'indistractable': indistractable }
import { getXPMultiplier, checkStreakMilestone } from '../lib/events'

const PlayerContext = createContext(null)
const STORAGE_KEY = 'mindset_player'
const SAVE_DEBOUNCE = 1000

export function PlayerProvider({ children }) {
  const { user, isGuest, isAuthenticated } = useAuth()
  const [player, setPlayer] = useState(DEFAULT_PLAYER)
  const [loaded, setLoaded] = useState(false)
  const [streakMilestone, setStreakMilestone] = useState(null)
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
    // Reset weekly XP on Sunday
    resetWeeklyXP()

    setLoaded(true)
  }

  const updateStreak = () => {
    setPlayer(prev => {
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()

      if (prev.lastLoginDate === today) return prev

      let newStreak = prev.currentStreak
      let comebackUnlocked = prev.comebackUnlocked || false
      if (prev.lastLoginDate === yesterday) {
        newStreak += 1
      } else if (prev.lastLoginDate !== today) {
        // Check if streak freeze was active
        const freezeDate = prev.streakFreezeDate
        if (freezeDate === yesterday && prev.currentStreak > 0) {
          newStreak = prev.currentStreak // preserved by freeze
        } else {
          // Check if missed 3+ days → comeback achievement
          if (prev.lastLoginDate) {
            const daysMissed = Math.floor((Date.now() - new Date(prev.lastLoginDate).getTime()) / 86400000)
            if (daysMissed >= 3) comebackUnlocked = true
          }
          newStreak = 1
        }
      }

      // Check for streak milestone
      const milestone = checkStreakMilestone(newStreak)
      if (milestone) {
        setStreakMilestone(milestone)
      }

      // Streak shield earned at 7 days
      const streakShieldEarned = prev.streakShieldEarned || newStreak >= 7

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastLoginDate: today,
        comebackUnlocked,
        streakShieldEarned,
        // Award milestone XP bonus
        xp: milestone ? prev.xp + milestone.xpBonus : prev.xp,
      }
    })
  }

  const resetWeeklyXP = () => {
    setPlayer(prev => {
      const now = new Date()
      const day = now.getDay() // 0 = Sunday
      if (day !== 0) return prev
      const today = now.toDateString()
      if (prev.lastWeekReset === today) return prev
      return { ...prev, weeklyXP: 0, lastWeekReset: today }
    })
  }

  // Track learning day + hour for heatmap and smart notifications
  const trackLearningSession = () => {
    setPlayer(prev => {
      const now = new Date()
      const dateKey = now.toISOString().split('T')[0] // "2026-03-15"
      const hour = now.getHours().toString()
      const learningDays = { ...(prev.learningDays || {}), [dateKey]: true }
      const learningHours = { ...(prev.learningHours || {}) }
      learningHours[hour] = (learningHours[hour] || 0) + 1
      return { ...prev, learningDays, learningHours }
    })
  }

  // Add to spaced repetition queue (called on wrong answer)
  const addToSpacedReview = (bookSlug, chapterIndex, lessonIndex, exerciseIndex) => {
    setPlayer(prev => {
      const queue = prev.spacedReviewQueue || []
      // Check if already in SR queue
      const exists = queue.some(q =>
        q.bookSlug === bookSlug &&
        q.chapterIndex === chapterIndex &&
        q.lessonIndex === lessonIndex &&
        q.exerciseIndex === exerciseIndex
      )
      if (exists) return prev

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const item = {
        bookSlug,
        chapterIndex,
        lessonIndex,
        exerciseIndex,
        nextReviewDate: tomorrow.toISOString().split('T')[0],
        interval: 0, // index into SR_INTERVALS
        correctCount: 0,
      }
      return { ...prev, spacedReviewQueue: [...queue, item] }
    })
  }

  // Handle SR review result — promote or reset interval
  const handleSRReview = (itemIndex, isCorrect) => {
    setPlayer(prev => {
      const queue = [...(prev.spacedReviewQueue || [])]
      if (!queue[itemIndex]) return prev
      const item = { ...queue[itemIndex] }

      if (isCorrect) {
        const nextInterval = Math.min(item.interval + 1, SR_INTERVALS.length - 1)
        if (nextInterval >= SR_INTERVALS.length - 1 && item.correctCount >= 2) {
          // Mastered — remove from queue
          queue.splice(itemIndex, 1)
        } else {
          const days = SR_INTERVALS[nextInterval].days
          const nextDate = new Date()
          nextDate.setDate(nextDate.getDate() + days)
          item.interval = nextInterval
          item.correctCount = item.correctCount + 1
          item.nextReviewDate = nextDate.toISOString().split('T')[0]
          queue[itemIndex] = item
        }
        const xpBonus = Math.round(XP_SR_REVIEW * SR_INTERVALS[Math.min(item.interval, SR_INTERVALS.length - 1)].xpMultiplier)
        return { ...prev, spacedReviewQueue: queue, xp: prev.xp + xpBonus }
      } else {
        // Reset to first interval
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        item.interval = 0
        item.correctCount = 0
        item.nextReviewDate = tomorrow.toISOString().split('T')[0]
        queue[itemIndex] = item
        return { ...prev, spacedReviewQueue: queue }
      }
    })
  }

  // Get items due for review today
  const getDueSRItems = () => {
    const today = new Date().toISOString().split('T')[0]
    return (player.spacedReviewQueue || []).filter(item => item.nextReviewDate <= today)
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

  // Flush pending saves on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
        // Sync save via sendBeacon or localStorage is already saved
        if (!isGuest && user?.id) {
          const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
          const body = JSON.stringify(mapToDB(data))
          // Use fetch with keepalive for reliable PATCH on close
          try {
            fetch(
              `${supabase.supabaseUrl}/rest/v1/mindset_users?user_id=eq.${user.id}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabase.supabaseKey,
                  'Authorization': `Bearer ${supabase.supabaseKey}`,
                  'Prefer': 'return=minimal',
                },
                body,
                keepalive: true,
              }
            )
          } catch {}
        }
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
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
  const onCorrectAnswer = useCallback((speedBonus = 0) => {
    trackLearningSession()
    updatePlayer(prev => {
      const newCombo = (prev.comboStreak || 0) + 1
      const comboBonus = getComboBonus(newCombo)
      const multiplier = getXPMultiplier()
      const baseXP = XP_CORRECT_ANSWER + comboBonus
      const earnedXP = Math.round(baseXP * multiplier) + speedBonus
      return {
        ...prev,
        xp: prev.xp + earnedXP,
        totalCorrect: prev.totalCorrect + 1,
        comboStreak: newCombo,
        weeklyXP: (prev.weeklyXP || 0) + earnedXP,
      }
    })
  }, [updatePlayer])

  const onWrongAnswer = useCallback(() => {
    updatePlayer(prev => {
      // Premium users don't lose hearts
      if (prev.isPremium) {
        return {
          ...prev,
          totalWrong: prev.totalWrong + 1,
          comboStreak: 0,
        }
      }
      return {
        ...prev,
        hearts: Math.max(0, prev.hearts - 1),
        totalWrong: prev.totalWrong + 1,
        comboStreak: 0,
        lastHeartLost: prev.hearts <= 1 ? new Date().toISOString() : (prev.lastHeartLost || new Date().toISOString()),
      }
    })
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
      const multiplier = getXPMultiplier()
      const baseXP = XP_LESSON_COMPLETE + (mistakes === 0 ? XP_PERFECT_LESSON : 0)
      const earnedXP = Math.round(baseXP * multiplier)

      const newCompletedLessons = { ...prev.completedLessons, [key]: true }

      // Check if all lessons in this book are now complete
      let newCompletedBooks = [...(prev.completedBooks || [])]
      const book = ALL_BOOKS[bookSlug]
      if (book && !newCompletedBooks.includes(bookSlug)) {
        const allDone = book.chapters.every(ch =>
          ch.lessons.every((_, li) => newCompletedLessons[`${bookSlug}:${ch.orderIndex}:${li}`])
        )
        if (allDone) newCompletedBooks.push(bookSlug)
      }

      // Time-based achievement flags
      const hour = new Date().getHours()
      const nightOwlUnlocked = prev.nightOwlUnlocked || hour >= 23
      const earlyBirdUnlocked = prev.earlyBirdUnlocked || hour < 7

      return {
        ...prev,
        xp: prev.xp + earnedXP,
        completedLessons: newCompletedLessons,
        completedBooks: newCompletedBooks,
        perfectLessons: mistakes === 0 ? (prev.perfectLessons || 0) + 1 : (prev.perfectLessons || 0),
        weeklyXP: (prev.weeklyXP || 0) + earnedXP,
        nightOwlUnlocked,
        earlyBirdUnlocked,
      }
    })
  }, [updatePlayer])

  const completeAudioSummary = useCallback((bookSlug, chapterIndex) => {
    updatePlayer(prev => {
      const key = `${bookSlug}:${chapterIndex}`
      if (prev.listenedAudioSummaries?.[key]) return prev // already earned
      const multiplier = getXPMultiplier()
      const earnedXP = Math.round(XP_CHAPTER_AUDIO * multiplier)
      return {
        ...prev,
        xp: prev.xp + earnedXP,
        weeklyXP: (prev.weeklyXP || 0) + earnedXP,
        listenedAudioSummaries: { ...(prev.listenedAudioSummaries || {}), [key]: true },
      }
    })
  }, [updatePlayer])

  return (
    <PlayerContext.Provider value={{
      player, loaded, updatePlayer,
      onCorrectAnswer, onWrongAnswer, spendToken, completeLesson,
      completeAudioSummary,
      streakMilestone, clearStreakMilestone: () => setStreakMilestone(null),
      addToSpacedReview, handleSRReview, getDueSRItems, trackLearningSession,
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
    perfectLessons: row.perfect_lessons ?? 0,
    comboStreak: row.combo_streak ?? 0,
    weeklyXP: row.weekly_xp ?? 0,
    weeklyXPGoal: row.weekly_xp_goal ?? 250,
    lastWeekReset: row.last_week_reset ?? null,
    spotlightSeen: row.spotlight_seen ?? false,
    totalSpeedBonus: row.total_speed_bonus ?? 0,
    dailyChallengesCompleted: row.daily_challenges_completed ?? 0,
    reviewsCompleted: row.reviews_completed ?? 0,
    streakFreezeDate: row.streak_freeze_date ?? null,
    lastSeenAchievements: row.last_seen_achievements ?? 0,
    completedBooks: row.completed_books ?? [],
    nightOwlUnlocked: row.night_owl_unlocked ?? false,
    earlyBirdUnlocked: row.early_bird_unlocked ?? false,
    comebackUnlocked: row.comeback_unlocked ?? false,
    spacedReviewQueue: row.spaced_review_queue ?? [],
    streakShieldEarned: row.streak_shield_earned ?? false,
    dailyChallengeStreak: row.daily_challenge_streak ?? 0,
    dailyChallengePerfects: row.daily_challenge_perfects ?? 0,
    learningHours: row.learning_hours ?? {},
    lastNotificationDate: row.last_notification_date ?? null,
    learningDays: row.learning_days ?? {},
    listenedAudioSummaries: row.listened_audio_summaries ?? {},
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
    perfect_lessons: player.perfectLessons,
    combo_streak: player.comboStreak,
    weekly_xp: player.weeklyXP,
    weekly_xp_goal: player.weeklyXPGoal,
    last_week_reset: player.lastWeekReset,
    spotlight_seen: player.spotlightSeen,
    total_speed_bonus: player.totalSpeedBonus,
    daily_challenges_completed: player.dailyChallengesCompleted,
    reviews_completed: player.reviewsCompleted,
    streak_freeze_date: player.streakFreezeDate,
    last_seen_achievements: player.lastSeenAchievements,
    completed_books: player.completedBooks,
    night_owl_unlocked: player.nightOwlUnlocked,
    early_bird_unlocked: player.earlyBirdUnlocked,
    comeback_unlocked: player.comebackUnlocked,
    spaced_review_queue: player.spacedReviewQueue,
    streak_shield_earned: player.streakShieldEarned,
    daily_challenge_streak: player.dailyChallengeStreak,
    daily_challenge_perfects: player.dailyChallengePerfects,
    learning_hours: player.learningHours,
    last_notification_date: player.lastNotificationDate,
    learning_days: player.learningDays,
    listened_audio_summaries: player.listenedAudioSummaries,
  }
}
