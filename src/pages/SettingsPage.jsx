import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePlayer } from '../contexts/PlayerContext'
import { useSound } from '../hooks/useSound'
import { WEEKLY_GOALS } from '../lib/events'
import { ArrowRight, Volume2, VolumeX, Trash2, LogOut, User, Target, Timer, Bell } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, isGuest, logout } = useAuth()
  const { player, updatePlayer } = usePlayer()
  const { toggle, isEnabled } = useSound()
  const [soundOn, setSoundOn] = useState(isEnabled())
  const [confirmReset, setConfirmReset] = useState(false)

  const handleToggleSound = () => {
    const newState = toggle()
    setSoundOn(newState)
  }

  const handleSetWeeklyGoal = (xp) => {
    updatePlayer(prev => ({ ...prev, weeklyXPGoal: xp }))
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

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <h2 className="font-display text-xl font-bold text-frost-white">הגדרות</h2>
      </div>

      {/* Profile */}
      <div className="glass-card p-5 mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center">
            <User className="w-6 h-6 text-frost-white" />
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
        <div className="grid grid-cols-4 gap-2">
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
        {/* Sound */}
        <button
          onClick={handleToggleSound}
          className="glass-card w-full p-4 flex items-center justify-between animate-fade-in"
          style={{ animationDelay: '0.1s' }}
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

        {/* Premium status */}
        <div
          className="glass-card w-full p-4 flex items-center justify-between animate-fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="text-sm text-frost-white">סטטוס</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            player.isPremium
              ? 'bg-gold/20 text-gold'
              : 'bg-white/5 text-frost-white/40'
          }`}>
            {player.isPremium ? 'פרימיום' : 'חינם'}
          </span>
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
            <span className="text-xs text-danger">בטוח?</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="glass-card w-full p-4 flex items-center gap-3 animate-fade-in"
          style={{ animationDelay: '0.25s' }}
        >
          <LogOut className="w-5 h-5 text-frost-white/40" />
          <span className="text-sm text-frost-white">התנתק</span>
        </button>
      </div>

      {/* Version */}
      <p className="text-center text-[10px] text-frost-white/20 mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        MindSet v1.0.0
      </p>
    </main>
  )
}
