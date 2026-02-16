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

export const PRICE_SINGLE_BOOK = 37
export const PRICE_MASTERY_BUNDLE = 97

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
