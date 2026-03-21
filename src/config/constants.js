export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000]

export const LEVEL_NAMES = [
  'מתחיל סקרן', 'חוקר מתחיל', 'לומד מתמיד', 'מיישם מנוסה',
  'מומחה צומח', 'אמן הלמידה', 'מאסטר ידע', 'אגדת MindSet'
]

export const MAX_HEARTS = 5
export const HEART_RECOVERY_MINUTES = 20
export const FREE_DAILY_TOKENS = 3
export const PAID_BOOK_TOKENS = 50

export const XP_CORRECT_ANSWER = 10
export const XP_LESSON_COMPLETE = 50
export const XP_DAILY_CHALLENGE = 50
export const XP_PERFECT_LESSON = 25

// Combo system — bonus XP for consecutive correct answers
export const getComboBonus = (comboStreak) => {
  if (comboStreak < 2) return 0
  return Math.min(Math.ceil(comboStreak / 3), 5) // 1-5 bonus XP
}
export const getComboLabel = (comboStreak) => {
  if (comboStreak >= 10) return 'מדהים!'
  if (comboStreak >= 7) return 'פנטסטי!'
  if (comboStreak >= 5) return 'מצוין!'
  if (comboStreak >= 3) return 'רצף!'
  return ''
}

export const PRICE_SINGLE_BOOK = 37
export const PRICE_MASTERY_BUNDLE = 97

// Spaced Repetition intervals (in days) and XP multipliers
export const SR_INTERVALS = [
  { days: 1, label: 'מחר', xpMultiplier: 1 },
  { days: 3, label: '3 ימים', xpMultiplier: 1.5 },
  { days: 7, label: 'שבוע', xpMultiplier: 2 },
  { days: 14, label: 'שבועיים', xpMultiplier: 2.5 },
  { days: 30, label: 'חודש', xpMultiplier: 3 },
]

export const XP_SR_REVIEW = 15 // Base XP for spaced repetition review
export const XP_CHAPTER_AUDIO = 30 // Bonus XP for listening to chapter audio summary

// Streak tier badges
export const STREAK_TIERS = [
  { days: 7, tier: 'bronze', label: 'ברונזה', emoji: '🥉', color: 'text-amber-600', bg: 'bg-amber-600/15' },
  { days: 30, tier: 'silver', label: 'כסף', emoji: '🥈', color: 'text-gray-300', bg: 'bg-gray-300/15' },
  { days: 100, tier: 'gold', label: 'זהב', emoji: '🥇', color: 'text-gold', bg: 'bg-gold/15' },
  { days: 365, tier: 'diamond', label: 'יהלום', emoji: '💎', color: 'text-dusty-aqua', bg: 'bg-dusty-aqua/15' },
]

export const getStreakTier = (streak) => {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].days) return STREAK_TIERS[i]
  }
  return null
}

// Daily challenge config
export const DAILY_CHALLENGE_COUNT = 5 // questions per daily challenge
export const XP_DAILY_PERFECT = 100 // bonus for perfect daily challenge

// Smart notification — preferred learning window tracking
export const NOTIFICATION_COOLDOWN_HOURS = 20

export const DEFAULT_PLAYER = {
  xp: 0,
  level: 1,
  hearts: MAX_HEARTS,
  maxHearts: MAX_HEARTS,
  tokens: FREE_DAILY_TOKENS,
  currentStreak: 0,
  longestStreak: 0,
  lastLoginDate: null,
  lastHeartLost: null,
  isPremium: false,
  premiumBooks: [],
  totalCorrect: 0,
  totalWrong: 0,
  achievements: [],
  dailyChallengeCompleted: null,
  onboardingComplete: false,
  completedLessons: {},
  reviewQueue: [],
  perfectLessons: 0,
  comboStreak: 0,
  weeklyXP: 0,
  weeklyXPGoal: 250,
  lastWeekReset: null,
  spotlightSeen: false,
  totalSpeedBonus: 0,
  dailyChallengesCompleted: 0,
  reviewsCompleted: 0,
  streakFreezeDate: null,
  lastSeenAchievements: 0,
  completedBooks: [],
  nightOwlUnlocked: false,
  earlyBirdUnlocked: false,
  comebackUnlocked: false,
  // Spaced Repetition
  spacedReviewQueue: [], // { bookSlug, chapterIndex, lessonIndex, exerciseIndex, nextReviewDate, interval, correctCount }
  // Enhanced Streaks
  streakShieldEarned: false, // earned at 7-day streak
  // Daily Challenge enhancement
  dailyChallengeStreak: 0,
  dailyChallengePerfects: 0,
  // Learning time tracking (smart notifications)
  learningHours: {}, // { "6": 3, "7": 5, ... } — hour → session count
  lastNotificationDate: null,
  // Progress tracking
  learningDays: {}, // { "2026-03-15": true, ... } — heatmap data
  // Audio summaries listened
  listenedAudioSummaries: {}, // { "atomic-habits:0": true, ... } — bookSlug:chapterIndex
}

export const getLevelName = (level) => {
  return LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1] || LEVEL_NAMES[0]
}

export const getLevelForXP = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export const getXPProgress = (xp) => {
  const level = getLevelForXP(xp)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return Math.min(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
}
