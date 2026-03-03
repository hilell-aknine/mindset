/**
 * XP Boost Events — time-limited events that multiply XP earnings
 * Based on research: "Double XP weekends led to 50% surge in activity"
 */

const EVENTS = [
  {
    id: 'double_xp_weekend',
    name: 'סוף שבוע כפול!',
    emoji: '⚡',
    description: 'XP כפול על כל תשובה נכונה',
    multiplier: 2,
    // Active on Friday evening to Saturday evening (Israel time)
    isActive: () => {
      const now = new Date()
      const day = now.getDay() // 0=Sun, 5=Fri, 6=Sat
      const hour = now.getHours()
      // Friday 18:00 to Saturday 23:59
      return (day === 5 && hour >= 18) || day === 6
    },
  },
  {
    id: 'morning_boost',
    name: 'בונוס בוקר',
    emoji: '🌅',
    description: '+50% XP ללמידה בבוקר',
    multiplier: 1.5,
    isActive: () => {
      const hour = new Date().getHours()
      return hour >= 6 && hour < 9
    },
  },
  {
    id: 'night_owl',
    name: 'ינשוף לילה',
    emoji: '🦉',
    description: '+50% XP ללמידה בלילה',
    multiplier: 1.5,
    isActive: () => {
      const hour = new Date().getHours()
      return hour >= 22 || hour < 1
    },
  },
]

export function getActiveEvent() {
  return EVENTS.find(e => e.isActive()) || null
}

export function getXPMultiplier() {
  const event = getActiveEvent()
  return event ? event.multiplier : 1
}

/**
 * Streak Milestones — celebrations at key streak counts
 * Research: "Users 2.3x more likely to engage daily after 7+ day streak"
 */
export const STREAK_MILESTONES = [
  { days: 3, emoji: '🔥', title: 'רצף של 3 ימים!', reward: 'החלת בטוב', xpBonus: 15 },
  { days: 7, emoji: '⭐', title: 'שבוע שלם!', reward: 'עקביות מעולה', xpBonus: 50 },
  { days: 14, emoji: '🏅', title: 'שבועיים!', reward: 'אתה לומד ברצינות', xpBonus: 100 },
  { days: 30, emoji: '🏆', title: 'חודש שלם!', reward: 'אגדה', xpBonus: 200 },
  { days: 50, emoji: '💎', title: '50 ימים!', reward: 'אין עצירה', xpBonus: 300 },
  { days: 100, emoji: '👑', title: 'מאה ימים!', reward: 'מאסטר הרצף', xpBonus: 500 },
  { days: 365, emoji: '🌟', title: 'שנה שלמה!', reward: 'אגדת MindSet', xpBonus: 1000 },
]

export function checkStreakMilestone(streak) {
  return STREAK_MILESTONES.find(m => m.days === streak) || null
}

/**
 * Weekly XP Goals
 * Research: "Daily quests increased DAU by 25%"
 */
export const WEEKLY_GOALS = [
  { xp: 100, label: 'קל', emoji: '🌱' },
  { xp: 250, label: 'רגיל', emoji: '🌿' },
  { xp: 500, label: 'רציני', emoji: '🌳' },
  { xp: 1000, label: 'אינטנסיבי', emoji: '🔥' },
]

export function getWeeklyXPEarned(player) {
  // Calculate XP earned this week (since last Monday)
  const now = new Date()
  const dayOfWeek = now.getDay() || 7 // Make Sunday = 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)
  monday.setHours(0, 0, 0, 0)

  return player.weeklyXP || 0
}
