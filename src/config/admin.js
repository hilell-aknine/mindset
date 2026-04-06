// Admin email whitelist — edit here to add/remove admins
export const ADMIN_EMAILS = [
  'hillelaknine@gmail.com',
]

export const ADMIN_TABS = [
  { id: 'dashboard', label: 'סקירה כללית', icon: '📊' },
  { id: 'users', label: 'ניהול משתמשים', icon: '👥' },
  { id: 'content', label: 'תוכן וספרים', icon: '📚' },
  { id: 'analytics', label: 'אנליטיקות', icon: '📈' },
  { id: 'settings', label: 'הגדרות', icon: '⚙️' },
  { id: 'popups', label: 'פופאפים', icon: '📢' },
]

export const isAdmin = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase())
}
