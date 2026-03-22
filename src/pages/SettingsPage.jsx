import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePlayer } from '../contexts/PlayerContext'
import { useSound } from '../hooks/useSound'
import { WEEKLY_GOALS } from '../lib/events'
import {
  ArrowRight, Volume2, VolumeX, Trash2, LogOut, User, Target,
  Download, Shield, Info, ChevronDown, BookOpen, Zap, Crown,
  Type, MonitorOff
} from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, isGuest, logout } = useAuth()
  const { player, updatePlayer } = usePlayer()
  const { toggle, isEnabled, setVolume, getVolume } = useSound()
  const [soundOn, setSoundOn] = useState(isEnabled())
  const [vol, setVol] = useState(() => Math.round(getVolume() * 100))
  const [confirmReset, setConfirmReset] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('mindset_font_size') || 'normal')
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('mindset_reduced_motion') === 'true')

  const handleToggleSound = () => {
    const newState = toggle()
    setSoundOn(newState)
  }

  const handleFontSize = (size) => {
    setFontSize(size)
    localStorage.setItem('mindset_font_size', size)
    document.documentElement.classList.remove('font-large', 'font-xl')
    if (size === 'large') document.documentElement.classList.add('font-large')
    if (size === 'xl') document.documentElement.classList.add('font-xl')
  }

  const handleReducedMotion = () => {
    const next = !reducedMotion
    setReducedMotion(next)
    localStorage.setItem('mindset_reduced_motion', String(next))
    document.documentElement.classList.toggle('reduce-motion', next)
  }

  const handleSetWeeklyGoal = (xp) => {
    updatePlayer(prev => ({ ...prev, weeklyXPGoal: xp }))
  }

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      player: {
        level: player.level,
        xp: player.xp,
        totalCorrect: player.totalCorrect,
        totalWrong: player.totalWrong,
        currentStreak: player.currentStreak,
        longestStreak: player.longestStreak,
        perfectLessons: player.perfectLessons,
        completedLessons: player.completedLessons,
        achievements: player.achievements,
        weeklyXP: player.weeklyXP,
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindset-progress-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleResetProgress = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    updatePlayer({
      xp: 0,
      level: 1,
      totalCorrect: 0,
      totalWrong: 0,
      completedLessons: {},
      reviewQueue: [],
      achievements: [],
      perfectLessons: 0,
      weeklyXP: 0,
    })
    setConfirmReset(false)
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Stats summary for profile
  const totalLessons = Object.values(player.completedLessons || {}).flat().length
  const accuracy = player.totalCorrect + player.totalWrong > 0
    ? Math.round((player.totalCorrect / (player.totalCorrect + player.totalWrong)) * 100)
    : 0

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <button
          onClick={() => navigate('/home')}
          className="p-2.5 -m-1 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors"
          aria-label="חזרה לדף הבית"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <h2 className="font-display text-xl font-bold text-frost-white">הגדרות</h2>
      </div>

      {/* Profile card with stats */}
      <div className="glass-card p-5 mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center relative">
            <User className="w-7 h-7 text-frost-white" />
            {player.isPremium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                <Crown className="w-3 h-3 text-bg-base" />
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-frost-white text-sm">
              {isGuest ? 'אורח' : (user?.email || 'משתמש')}
            </p>
            <p className="text-xs text-frost-white/40">
              {isGuest ? 'מצב אורח — ההתקדמות נשמרת מקומית' : 'חשבון מחובר'}
            </p>
          </div>
        </div>
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <span className="text-gold font-bold text-sm block">{player.level}</span>
            <span className="text-[10px] text-frost-white/30">רמה</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <span className="text-dusty-aqua font-bold text-sm block">{totalLessons}</span>
            <span className="text-[10px] text-frost-white/30">שיעורים</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <span className="text-success font-bold text-sm block">{accuracy}%</span>
            <span className="text-[10px] text-frost-white/30">דיוק</span>
          </div>
        </div>
      </div>

      {/* Weekly XP Goal Picker */}
      <div className="glass-card p-5 mb-4 animate-fade-in" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-gold" />
          <h3 className="text-sm font-bold text-frost-white">יעד שבועי</h3>
        </div>
        <p className="text-xs text-frost-white/40 mb-3">
          כמה XP תרצה לצבור בשבוע? יעד גבוה = התקדמות מהירה.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WEEKLY_GOALS.map(goal => {
            const isSelected = (player.weeklyXPGoal || 250) === goal.xp
            return (
              <button
                key={goal.xp}
                onClick={() => handleSetWeeklyGoal(goal.xp)}
                className={`p-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-gold/15 border border-gold/40 ring-1 ring-gold/20'
                    : 'bg-white/5 border border-white/5 hover:border-white/10'
                }`}
              >
                <span className="text-lg block mb-1">{goal.emoji}</span>
                <span className={`text-xs font-bold block ${isSelected ? 'text-gold' : 'text-frost-white/60'}`}>
                  {goal.label}
                </span>
                <span className="text-[10px] text-frost-white/30 block mt-0.5">
                  {goal.xp} XP
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings list */}
      <div className="space-y-2">
        {/* Sound toggle + volume */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={handleToggleSound}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {soundOn ? (
                <Volume2 className="w-5 h-5 text-dusty-aqua" />
              ) : (
                <VolumeX className="w-5 h-5 text-frost-white/30" />
              )}
              <span className="text-sm text-frost-white">צלילים</span>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${
              soundOn ? 'bg-dusty-aqua justify-end' : 'bg-white/10 justify-start'
            }`}>
              <div className="w-5 h-5 rounded-full bg-white m-0.5 shadow-sm transition-all" />
            </div>
          </button>
          {soundOn && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 animate-fade-in">
              <VolumeX className="w-3.5 h-3.5 text-frost-white/20" />
              <input
                type="range"
                min="0"
                max="100"
                value={vol}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  setVol(v)
                  setVolume(v / 100)
                }}
                className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-dusty-aqua cursor-pointer"
                aria-label="עוצמת שמע"
              />
              <Volume2 className="w-3.5 h-3.5 text-frost-white/20" />
              <span className="text-[10px] text-frost-white/30 w-7 text-center font-mono">{vol}%</span>
            </div>
          )}
        </div>

        {/* Font size setting */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.11s' }}>
          <div className="flex items-center gap-3 mb-3">
            <Type className="w-5 h-5 text-dusty-aqua" />
            <span className="text-sm text-frost-white">גודל טקסט</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'normal', label: 'רגיל' },
              { value: 'large', label: 'גדול' },
              { value: 'xl', label: 'גדול מאוד' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleFontSize(opt.value)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  fontSize === opt.value
                    ? 'bg-dusty-aqua/15 border border-dusty-aqua/40 text-dusty-aqua'
                    : 'bg-white/5 border border-white/5 text-frost-white/50 hover:border-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reduced motion toggle */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.115s' }}>
          <button
            onClick={handleReducedMotion}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <MonitorOff className={`w-5 h-5 ${reducedMotion ? 'text-dusty-aqua' : 'text-frost-white/30'}`} />
              <span className="text-sm text-frost-white">הפחת אנימציות</span>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${
              reducedMotion ? 'bg-dusty-aqua justify-end' : 'bg-white/10 justify-start'
            }`}>
              <div className="w-5 h-5 rounded-full bg-white m-0.5 shadow-sm transition-all" />
            </div>
          </button>
        </div>

        {/* Premium status */}
        <div
          className="glass-card w-full p-4 flex items-center justify-between animate-fade-in"
          style={{ animationDelay: '0.12s' }}
        >
          <div className="flex items-center gap-3">
            <Crown className={`w-5 h-5 ${player.isPremium ? 'text-gold' : 'text-frost-white/30'}`} />
            <span className="text-sm text-frost-white">סטטוס</span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            player.isPremium
              ? 'bg-gold/20 text-gold'
              : 'bg-white/5 text-frost-white/40'
          }`}>
            {player.isPremium ? 'פרימיום' : 'חינם'}
          </span>
        </div>

        {/* Learning stats section (collapsible) */}
        <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.14s' }}>
          <button
            onClick={() => toggleSection('stats')}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-dusty-aqua" />
              <span className="text-sm text-frost-white">סטטיסטיקות למידה</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-frost-white/30 transition-transform ${expandedSection === 'stats' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'stats' && (
            <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3 animate-fade-in">
              <div className="flex justify-between text-xs">
                <span className="text-frost-white/40">XP כולל</span>
                <span className="text-frost-white/70 font-medium">{player.xp?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-frost-white/40">תשובות נכונות</span>
                <span className="text-success font-medium">{player.totalCorrect}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-frost-white/40">שגיאות</span>
                <span className="text-danger font-medium">{player.totalWrong}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-frost-white/40">שיעורים מושלמים</span>
                <span className="text-gold font-medium">{player.perfectLessons || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-frost-white/40">רצף נוכחי</span>
                <span className="text-warning font-medium">{player.currentStreak} ימים</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-frost-white/40">רצף שיא</span>
                <span className="text-frost-white/70 font-medium">{player.longestStreak} ימים</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-frost-white/40">הישגים</span>
                <span className="text-frost-white/70 font-medium">{player.achievements?.length || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Data & Privacy section (collapsible) */}
        <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.16s' }}>
          <button
            onClick={() => toggleSection('data')}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-teal" />
              <span className="text-sm text-frost-white">נתונים ופרטיות</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-frost-white/30 transition-transform ${expandedSection === 'data' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'data' && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
              <p className="text-[11px] text-frost-white/30 leading-relaxed">
                הנתונים שלך נשמרים {isGuest ? 'מקומית על המכשיר' : 'בענן בצורה מאובטחת'}.
                אתה יכול לייצא את כל ההתקדמות שלך בכל רגע.
              </p>
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-frost-white/60 hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
                ייצא את ההתקדמות שלי (JSON)
              </button>
            </div>
          )}
        </div>

        {/* AI Coach info */}
        <div className="glass-card w-full p-4 flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.18s' }}>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-gold" />
            <div>
              <span className="text-sm text-frost-white block">טוקני AI</span>
              <span className="text-[10px] text-frost-white/30">מתחדשים כל יום</span>
            </div>
          </div>
          <span className="text-sm font-bold text-gold">{player.tokens || 0}</span>
        </div>

        {/* Reset progress */}
        <button
          onClick={handleResetProgress}
          className="glass-card w-full p-4 flex items-center justify-between animate-fade-in border-danger/10 hover:border-danger/30 transition-colors"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-danger/60" />
            <span className="text-sm text-frost-white">
              {confirmReset ? 'לחץ שוב לאישור' : 'איפוס התקדמות'}
            </span>
          </div>
          {confirmReset && (
            <span className="text-xs text-danger font-bold">בטוח?</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="glass-card w-full p-4 flex items-center gap-3 animate-fade-in"
          style={{ animationDelay: '0.22s' }}
        >
          <LogOut className="w-5 h-5 text-frost-white/40" />
          <span className="text-sm text-frost-white">התנתק</span>
        </button>
      </div>

      {/* App info */}
      <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Info className="w-3 h-3 text-frost-white/15" />
          <p className="text-[10px] text-frost-white/20">MindSet v1.0.0</p>
        </div>
        <p className="text-[9px] text-frost-white/10">
          מדריך לא רשמי. אינו קשור למחברים המקוריים.
        </p>
      </div>
    </main>
  )
}
