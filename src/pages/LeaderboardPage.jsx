import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { LEVEL_NAMES } from '../config/constants'
import { ArrowRight, Trophy, Medal, Crown, TrendingUp } from 'lucide-react'

// Simulated leaderboard players — feel real, motivate the user
const FAKE_PLAYERS = [
  { name: 'שירה מ.', xp: 4250, streak: 28, avatar: '👩‍💻' },
  { name: 'יונתן ק.', xp: 3800, streak: 21, avatar: '🧑‍🎓' },
  { name: 'נועם ר.', xp: 3200, streak: 15, avatar: '👨‍💼' },
  { name: 'מיכל ד.', xp: 2950, streak: 19, avatar: '👩‍🏫' },
  { name: 'אורי ב.', xp: 2600, streak: 12, avatar: '🧑‍🔬' },
  { name: 'רוני ש.', xp: 2100, streak: 9, avatar: '👩‍🎨' },
  { name: 'דניאל ל.', xp: 1850, streak: 7, avatar: '🧑‍💻' },
  { name: 'טל כ.', xp: 1600, streak: 11, avatar: '👨‍🎓' },
  { name: 'ליאור ע.', xp: 1200, streak: 5, avatar: '👩‍💼' },
  { name: 'עמית ג.', xp: 900, streak: 4, avatar: '🧑‍🎨' },
  { name: 'מאיה ח.', xp: 650, streak: 3, avatar: '👩‍🔬' },
  { name: 'גיל נ.', xp: 400, streak: 2, avatar: '👨‍🏫' },
]

function getRankIcon(rank) {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold fill-gold" />
  if (rank === 2) return <Medal className="w-5 h-5 text-frost-white/60" />
  if (rank === 3) return <Medal className="w-5 h-5 text-[#cd7f32]" />
  return <span className="text-xs font-bold text-frost-white/30 w-5 text-center">{rank}</span>
}

function getRankBg(rank) {
  if (rank === 1) return 'border-gold/30 bg-gold/5'
  if (rank === 2) return 'border-frost-white/15 bg-frost-white/[0.02]'
  if (rank === 3) return 'border-[#cd7f32]/20 bg-[#cd7f32]/5'
  return ''
}

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const { player } = usePlayer()

  // Insert real player into fake leaderboard
  const leaderboard = useMemo(() => {
    const me = {
      name: 'אתה',
      xp: player.xp,
      streak: player.currentStreak,
      avatar: '🌟',
      isMe: true,
    }
    const all = [...FAKE_PLAYERS, me]
    all.sort((a, b) => b.xp - a.xp)
    return all.map((p, i) => ({ ...p, rank: i + 1 }))
  }, [player.xp, player.currentStreak])

  const myRank = leaderboard.find(p => p.isMe)?.rank || leaderboard.length
  const levelName = LEVEL_NAMES[player.level - 1] || LEVEL_NAMES[0]

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
        <h2 className="font-display text-xl font-bold text-frost-white">טבלת מובילים</h2>
      </div>

      {/* My rank card */}
      <div className="glass-card p-5 mb-6 border-gold/15 animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-warning/20 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-frost-white/40">המיקום שלך</p>
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl font-bold text-gold">#{myRank}</span>
              <span className="text-xs text-frost-white/50">מתוך {leaderboard.length}</span>
            </div>
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-frost-white">{player.xp} XP</p>
            <p className="text-[10px] text-frost-white/40">{levelName}</p>
          </div>
        </div>

        {myRank > 1 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-dusty-aqua" />
            <p className="text-xs text-frost-white/50">
              עוד {leaderboard[myRank - 2].xp - player.xp} XP כדי לעלות למקום #{myRank - 1}
            </p>
          </div>
        )}
      </div>

      {/* League badge */}
      <div className="flex items-center justify-center gap-2 mb-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <span className="px-3 py-1 rounded-full bg-dusty-aqua/10 border border-dusty-aqua/20 text-dusty-aqua text-xs font-bold">
          ליגת ברונזה
        </span>
        <span className="text-[10px] text-frost-white/30">שבועי · מתאפס ביום ראשון</span>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-2">
        {leaderboard.map((p, i) => (
          <div
            key={i}
            className={`glass-card px-4 py-3 flex items-center gap-3 transition-all animate-fade-in ${
              p.isMe ? 'border-gold/30 bg-gold/5 ring-1 ring-gold/20' : getRankBg(p.rank)
            }`}
            style={{ animationDelay: `${0.12 + i * 0.03}s` }}
          >
            {/* Rank */}
            <div className="w-8 flex items-center justify-center shrink-0">
              {getRankIcon(p.rank)}
            </div>

            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
              p.isMe ? 'bg-gold/15' : 'bg-white/5'
            }`}>
              {p.avatar}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${p.isMe ? 'text-gold' : 'text-frost-white'}`}>
                {p.name}
              </p>
              {p.streak > 0 && (
                <p className="text-[10px] text-frost-white/30">🔥 {p.streak} ימים</p>
              )}
            </div>

            {/* XP */}
            <span className={`text-sm font-bold ${p.isMe ? 'text-gold' : 'text-frost-white/60'}`}>
              {p.xp.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>

      {/* Info */}
      <p className="text-center text-[10px] text-frost-white/20 mt-6 animate-fade-in">
        הדירוג מתעדכן בזמן אמת. המשך לצבור XP כדי לעלות!
      </p>
    </main>
  )
}
