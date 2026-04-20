/**
 * Per-user localStorage key helpers.
 *
 * All user-scoped data lives under a key that embeds the user ID, so that
 * switching Google accounts in the same browser cannot leak state between
 * users. Device-level preferences (theme, font size, sound) stay global.
 */

const UID = (userId) => userId || 'anon'

export const playerKey = (userId) => `mindset_player_${UID(userId)}`

export const lessonProgressKey = (userId, bookSlug, ch, li) =>
  `mindset_lesson_progress_${UID(userId)}_${bookSlug}_${ch}_${li}`

export const lessonProgressPrefix = (userId) =>
  `mindset_lesson_progress_${UID(userId)}_`

export const dismissedPopupsKey = (userId) =>
  `mindset_dismissed_popups_${UID(userId)}`

/**
 * Prefixes that identify user-scoped data. Anything starting with one of
 * these is considered owned by a user and purged on logout.
 */
const USER_SCOPED_PREFIXES = [
  'mindset_player_',
  'mindset_lesson_progress_',
  'mindset_dismissed_popups_',
]

/**
 * Purge all user-scoped localStorage entries. Device preferences
 * (mindset_font_size, mindset_theme, mindset_sound, mindset_volume,
 * mindset_reduced_motion, mindset_install_dismissed, mindset_guest) are
 * intentionally preserved — they belong to the browser, not the user.
 *
 * Also drops legacy unscoped keys from before this refactor so stale data
 * from older versions cannot resurrect itself.
 */
export function purgeUserScopedStorage() {
  try {
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (USER_SCOPED_PREFIXES.some((p) => key.startsWith(p))) {
        toRemove.push(key)
      }
    }
    // Legacy unscoped keys from pre-v2 versions
    toRemove.push('mindset_player', 'mindset_dismissed_popups')
    toRemove.forEach((k) => {
      try { localStorage.removeItem(k) } catch {}
    })
  } catch {
    // localStorage unavailable (private mode) — nothing to clean
  }
}
