// Rarity tiers with colors
export const RARITY = {
  common: { label: 'נפוץ', color: 'text-frost-white/60', bg: 'bg-white/5', border: 'border-white/10' },
  rare: { label: 'נדיר', color: 'text-dusty-aqua', bg: 'bg-dusty-aqua/10', border: 'border-dusty-aqua/30' },
  epic: { label: 'אפי', color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/10', border: 'border-[#a855f7]/30' },
  legendary: { label: 'אגדי', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
}

export const CATEGORIES = {
  lessons: { label: 'שיעורים', icon: '📚' },
  streak: { label: 'רצף', icon: '🔥' },
  xp: { label: 'ניקוד', icon: '⭐' },
  accuracy: { label: 'דיוק', icon: '🎯' },
  speed: { label: 'מהירות', icon: '⚡' },
  social: { label: 'חברתי', icon: '🏆' },
}

export const ACHIEVEMENTS = [
  // --- Lessons ---
  { id: 'first_lesson', icon: '🎯', title: 'צעד ראשון', description: 'סיים שיעור ראשון', category: 'lessons', rarity: 'common', check: (p) => Object.keys(p.completedLessons).length >= 1 },
  { id: 'five_lessons', icon: '⭐', title: 'לומד מתמיד', description: 'סיים 5 שיעורים', category: 'lessons', rarity: 'common', check: (p) => Object.keys(p.completedLessons).length >= 5 },
  { id: 'ten_lessons', icon: '📖', title: 'קורא נלהב', description: 'סיים 10 שיעורים', category: 'lessons', rarity: 'rare', check: (p) => Object.keys(p.completedLessons).length >= 10 },
  { id: 'all_lessons', icon: '🏆', title: 'מאסטר', description: 'סיים את כל השיעורים', category: 'lessons', rarity: 'legendary', check: (p) => Object.keys(p.completedLessons).length >= 15 },
  { id: 'perfect_lesson', icon: '💯', title: 'מושלם', description: 'שיעור ללא שגיאות', category: 'lessons', rarity: 'common', check: (p) => p.perfectLessons > 0 },
  { id: 'perfect_3', icon: '🏅', title: 'פרפקציוניסט', description: '3 שיעורים מושלמים', category: 'lessons', rarity: 'rare', check: (p) => (p.perfectLessons || 0) >= 3 },
  { id: 'perfect_5', icon: '✨', title: 'ללא רבב', description: '5 שיעורים מושלמים', category: 'lessons', rarity: 'epic', check: (p) => (p.perfectLessons || 0) >= 5 },

  // --- Streak ---
  { id: 'streak_3', icon: '🔥', title: 'רצף של 3', description: '3 ימים רצופים', category: 'streak', rarity: 'common', check: (p) => p.currentStreak >= 3 },
  { id: 'streak_7', icon: '💥', title: 'שבוע שלם', description: '7 ימים רצופים', category: 'streak', rarity: 'rare', check: (p) => p.currentStreak >= 7 },
  { id: 'streak_14', icon: '🌟', title: 'שבועיים!', description: '14 ימים רצופים', category: 'streak', rarity: 'rare', check: (p) => p.currentStreak >= 14 },
  { id: 'streak_30', icon: '👑', title: 'אגדה', description: '30 ימים רצופים', category: 'streak', rarity: 'epic', check: (p) => p.currentStreak >= 30 },
  { id: 'streak_100', icon: '💎', title: 'בלתי ניתן לעצירה', description: '100 ימים רצופים', category: 'streak', rarity: 'legendary', check: (p) => p.currentStreak >= 100 },

  // --- XP ---
  { id: 'xp_500', icon: '💎', title: 'אספן נקודות', description: '500 נקודות XP', category: 'xp', rarity: 'common', check: (p) => p.xp >= 500 },
  { id: 'xp_1000', icon: '🌟', title: 'כוכב עולה', description: '1,000 נקודות XP', category: 'xp', rarity: 'rare', check: (p) => p.xp >= 1000 },
  { id: 'xp_2000', icon: '💫', title: 'סופרנובה', description: '2,000 נקודות XP', category: 'xp', rarity: 'rare', check: (p) => p.xp >= 2000 },
  { id: 'xp_5000', icon: '🌠', title: 'גלקסיה', description: '5,000 נקודות XP', category: 'xp', rarity: 'epic', check: (p) => p.xp >= 5000 },
  { id: 'xp_10000', icon: '🏅', title: 'יקום שלם', description: '10,000 נקודות XP', category: 'xp', rarity: 'legendary', check: (p) => p.xp >= 10000 },

  // --- Accuracy ---
  { id: 'accuracy_80', icon: '🎯', title: 'חד עין', description: 'דיוק מעל 80%', category: 'accuracy', rarity: 'common', check: (p) => p.totalCorrect + p.totalWrong > 10 && (p.totalCorrect / (p.totalCorrect + p.totalWrong)) >= 0.8 },
  { id: 'accuracy_90', icon: '🎪', title: 'צלף', description: 'דיוק מעל 90%', category: 'accuracy', rarity: 'rare', check: (p) => p.totalCorrect + p.totalWrong > 20 && (p.totalCorrect / (p.totalCorrect + p.totalWrong)) >= 0.9 },
  { id: 'correct_50', icon: '✅', title: 'ידע מוצק', description: '50 תשובות נכונות', category: 'accuracy', rarity: 'common', check: (p) => p.totalCorrect >= 50 },
  { id: 'correct_100', icon: '🧠', title: 'מוח חד', description: '100 תשובות נכונות', category: 'accuracy', rarity: 'rare', check: (p) => p.totalCorrect >= 100 },
  { id: 'correct_250', icon: '🦉', title: 'חכם כינשוף', description: '250 תשובות נכונות', category: 'accuracy', rarity: 'epic', check: (p) => p.totalCorrect >= 250 },

  // --- Speed / Combos ---
  { id: 'combo_5', icon: '⚡', title: 'רצף חם', description: 'רצף של 5 תשובות נכונות', category: 'speed', rarity: 'common', check: (p) => (p.comboStreak || 0) >= 5 },
  { id: 'combo_10', icon: '🔥', title: 'על אש', description: 'רצף של 10 תשובות נכונות', category: 'speed', rarity: 'rare', check: (p) => (p.comboStreak || 0) >= 10 },
  { id: 'speed_demon', icon: '⏱️', title: 'שד המהירות', description: 'צבור 50 נקודות מהירות', category: 'speed', rarity: 'rare', check: (p) => (p.totalSpeedBonus || 0) >= 50 },

  // --- Social / Special ---
  { id: 'daily_first', icon: '🌅', title: 'בוקר טוב', description: 'סיים אתגר יומי ראשון', category: 'social', rarity: 'common', check: (p) => (p.dailyChallengesCompleted || 0) >= 1 },
  { id: 'daily_7', icon: '📅', title: 'שבוע של אתגרים', description: '7 אתגרים יומיים', category: 'social', rarity: 'rare', check: (p) => (p.dailyChallengesCompleted || 0) >= 7 },
  { id: 'review_master', icon: '🔄', title: 'מלך החזרות', description: 'סיים 10 תרגילי חזרה', category: 'social', rarity: 'rare', check: (p) => (p.reviewsCompleted || 0) >= 10 },
  { id: 'weekly_goal', icon: '🎯', title: 'יעד שבועי', description: 'השג יעד XP שבועי', category: 'social', rarity: 'rare', check: (p) => (p.weeklyXP || 0) >= (p.weeklyXPGoal || 250) },

  // --- Book Completion ---
  { id: 'first_book', icon: '📕', title: 'ספר ראשון', description: 'סיים את כל השיעורים בספר', category: 'lessons', rarity: 'legendary', check: (p) => (p.completedBooks || []).length >= 1 },
  { id: 'two_books', icon: '📚', title: 'קורא רציני', description: 'סיים 2 ספרים שלמים', category: 'lessons', rarity: 'epic', check: (p) => (p.completedBooks || []).length >= 2 },

  // --- Time-based ---
  { id: 'night_owl', icon: '🦉', title: 'ינשוף לילה', description: 'סיים שיעור אחרי 23:00', category: 'social', rarity: 'common', check: (p) => p.nightOwlUnlocked === true },
  { id: 'early_bird', icon: '🐦', title: 'ציפור מוקדמת', description: 'סיים שיעור לפני 7:00', category: 'social', rarity: 'common', check: (p) => p.earlyBirdUnlocked === true },

  // --- Comeback ---
  { id: 'comeback', icon: '💪', title: 'חזרה חזקה', description: 'חזור ללמוד אחרי 3+ ימים הפסקה', category: 'streak', rarity: 'rare', check: (p) => p.comebackUnlocked === true },
]

export function checkNewAchievements(player) {
  const earned = player.achievements || []
  return ACHIEVEMENTS.filter(a => !earned.includes(a.id) && a.check(player))
}

export function getAchievementsByCategory(earned = []) {
  const result = {}
  for (const cat of Object.keys(CATEGORIES)) {
    result[cat] = ACHIEVEMENTS.filter(a => a.category === cat).map(a => ({
      ...a,
      earned: earned.includes(a.id),
    }))
  }
  return result
}

/**
 * Get the next closest unearned achievement per category
 */
export function getNextAchievements(player) {
  const earned = player.achievements || []
  const next = {}
  for (const cat of Object.keys(CATEGORIES)) {
    const unearned = ACHIEVEMENTS
      .filter(a => a.category === cat && !earned.includes(a.id))
    if (unearned.length > 0) {
      next[cat] = unearned[0] // First unearned in order = closest to achieving
    }
  }
  return next
}

/**
 * Overall achievement progress percentage
 */
export function getAchievementProgress(earned = []) {
  return Math.round((earned.length / ACHIEVEMENTS.length) * 100)
}
