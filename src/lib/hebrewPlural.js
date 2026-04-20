/**
 * Hebrew plural formatting.
 * Hebrew has: singular (1), plural (2+).
 * Special: "יומיים" for 2 days, but we use "2 ימים" for simplicity.
 */
export function formatDays(n) {
  if (n === 1) return 'יום אחד'
  return `${n} ימים`
}

export function formatLessons(n) {
  if (n === 1) return 'שיעור אחד'
  return `${n} שיעורים`
}

export function formatExercises(n) {
  if (n === 1) return 'תרגיל אחד'
  return `${n} תרגילים`
}
