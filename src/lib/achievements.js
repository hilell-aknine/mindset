export const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: '🎯', title: 'צעד ראשון', description: 'סיים שיעור ראשון', check: (p) => Object.keys(p.completedLessons).length >= 1 },
  { id: 'five_lessons', icon: '⭐', title: 'לומד מתמיד', description: 'סיים 5 שיעורים', check: (p) => Object.keys(p.completedLessons).length >= 5 },
  { id: 'all_lessons', icon: '🏆', title: 'מאסטר', description: 'סיים את כל השיעורים', check: (p) => Object.keys(p.completedLessons).length >= 15 },
  { id: 'streak_3', icon: '🔥', title: 'רצף של 3', description: '3 ימים רצופים', check: (p) => p.currentStreak >= 3 },
  { id: 'streak_7', icon: '💥', title: 'שבוע שלם', description: '7 ימים רצופים', check: (p) => p.currentStreak >= 7 },
  { id: 'streak_30', icon: '👑', title: 'אגדה', description: '30 ימים רצופים', check: (p) => p.currentStreak >= 30 },
  { id: 'xp_500', icon: '💎', title: 'אספן נקודות', description: '500 נקודות XP', check: (p) => p.xp >= 500 },
  { id: 'xp_1000', icon: '🌟', title: 'כוכב עולה', description: '1000 נקודות XP', check: (p) => p.xp >= 1000 },
  { id: 'accuracy_80', icon: '🎯', title: 'חד עין', description: 'דיוק מעל 80%', check: (p) => p.totalCorrect + p.totalWrong > 10 && (p.totalCorrect / (p.totalCorrect + p.totalWrong)) >= 0.8 },
  { id: 'perfect_lesson', icon: '💯', title: 'מושלם', description: 'שיעור ללא שגיאות', check: (p) => p.perfectLessons > 0 },
  { id: 'correct_50', icon: '✅', title: 'ידע מוצק', description: '50 תשובות נכונות', check: (p) => p.totalCorrect >= 50 },
  { id: 'correct_100', icon: '🧠', title: 'מוח חד', description: '100 תשובות נכונות', check: (p) => p.totalCorrect >= 100 },
]

export function checkNewAchievements(player) {
  const earned = player.achievements || []
  return ACHIEVEMENTS.filter(a => !earned.includes(a.id) && a.check(player))
}
