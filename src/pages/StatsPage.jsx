import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { LEVEL_NAMES, getXPProgress, LEVEL_THRESHOLDS } from '../config/constants'
import { ACHIEVEMENTS } from '../lib/achievements'
import { ArrowRight, Trophy, Target, Flame, Brain, Heart, Zap } from 'lucide-react'

export default function StatsPage() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  const levelName = LEVEL_NAMES[player.level - 1] || LEVEL_NAMES[0]
  const xpProgress = getXPProgress(player.xp)
  const nextThreshold = LEVEL_THRESHOLDS[player.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const accuracy = player.totalCorrect + player.totalWrong > 0
    ? Math.round((player.totalCorrect / (player.totalCorrect + player.totalWrong)) * 100)
    : 0

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
        <h2 className="font-display text-xl font-bold text-frost-white">הסטטיסטיקות שלי</h2>
      </div>

      {/* Level card */}
      <div className="glass-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-warning/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-gold" />
          </div>
          <div>
            <p className="text-xs text-frost-white/40">רמה {player.level}</p>
            <h3 className="font-display text-2xl font-bold text-frost-white">{levelName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-gold to-dusty-aqua transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <span className="text-xs text-frost-white/40">{player.xp}/{nextThreshold} XP</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { icon: Brain, color: 'text-dusty-aqua', bg: 'bg-dusty-aqua/10', value: player.xp, label: 'נקודות XP' },
          { icon: Target, color: 'text-success', bg: 'bg-success/10', value: `${accuracy}%`, label: 'דיוק' },
          { icon: Flame, color: 'text-warning', bg: 'bg-warning/10', value: player.longestStreak, label: 'רצף שיא' },
          { icon: Heart, color: 'text-danger', bg: 'bg-danger/10', value: player.totalCorrect, label: 'תשובות נכונות' },
          { icon: Zap, color: 'text-gold', bg: 'bg-gold/10', value: Object.keys(player.completedLessons).length, label: 'שיעורים' },
          { icon: Trophy, color: 'text-gold', bg: 'bg-gold/10', value: (player.achievements || []).length, label: 'הישגים' },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card p-4 animate-fade-in"
            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-frost-white">{stat.value}</p>
            <p className="text-xs text-frost-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <h3 className="font-display text-lg font-bold text-frost-white mb-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        הישגים
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const earned = (player.achievements || []).includes(ach.id)
          return (
            <div
              key={ach.id}
              className={`glass-card p-3 text-center animate-fade-in ${
                earned ? 'border-gold/20' : 'opacity-40'
              }`}
              style={{ animationDelay: `${0.35 + i * 0.03}s` }}
            >
              <span className="text-2xl block mb-1">{ach.icon}</span>
              <p className="text-xs font-semibold text-frost-white truncate">{ach.title}</p>
              <p className="text-[9px] text-frost-white/40 mt-0.5">{ach.description}</p>
            </div>
          )
        })}
      </div>
    </main>
  )
}
