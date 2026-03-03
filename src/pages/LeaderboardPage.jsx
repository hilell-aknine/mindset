import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { ArrowRight, Trophy, Medal, Crown, TrendingUp, ChevronUp, ChevronDown, Shield } from 'lucide-react'

// 10-tier league system (Duolingo-style)
const LEAGUES = [
  { name: 'ברונזה', emoji: '🥉', color: 'text-[#cd7f32]', bg: 'bg-[#cd7f32]/10', border: 'border-[#cd7f32]/20', minXP: 0 },
  { name: 'כסף', emoji: '🥈', color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/20', minXP: 200 },
  { name: 'זהב', emoji: '🥇', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20', minXP: 500 },
  { name: 'ספיר', emoji: '💎', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', minXP: 1000 },
  { name: 'רובי', emoji: '❤️‍🔥', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', minXP: 1800 },
  { name: 'אמרלד', emoji: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', minXP: 3000 },
  { name: 'אמטיסט', emoji: '🔮', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', minXP: 4500 },
  { name: 'פנינה', emoji: '🫧', color: 'text-cyan-300', bg: 'bg-cyan-300/10', border: 'border-cyan-300/20', minXP: 6500 },
  { name: 'אובסידיאן', emoji: '⬛', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20', minXP: 9000 },
  { name: 'יהלום', emoji: '💠', color: 'text-sky-300', bg: 'bg-sky-300/10', border: 'border-sky-300/20', minXP: 12000 },
]

function getLeagueForXP(xp) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].minXP) return i
  }
  return 0
}

// Generate fake players scaled to user's league
function generatePlayers(userXP) {
  const leagueIdx = getLeagueForXP(userXP)
  const league = LEAGUES[leagueIdx]
  const nextLeague = LEAGUES[leagueIdx + 1]
  const range = nextLeague ? nextLeague.minXP - league.minXP : 5000

  const names = [
    'שירה מ.', 'יונתן ק.', 'נועם ר.', 'מיכל ד.', 'אורי ב.',
    'רוני ש.', 'דניאל ל.', 'טל כ.', 'ליאור ע.', 'עמית ג.',
    'מאיה ח.', 'גיל נ.', 'הדר א.', 'תומר פ.', 'שני ו.',
    'אלון מ.', 'ענבל ר.', 'איתי ש.', 'נוי כ.', 'רון ב.',
    'דנה ג.', 'עידו ל.', 'ליה ד.', 'אריאל ח.', 'קרן ט.',
    'נדב ש.', 'יעל פ.', 'אסף נ.', 'תמר ק.',
  ]
  const avatars = ['👩‍💻', '🧑‍🎓', '👨‍💼', '👩‍🏫', '🧑‍🔬', '👩‍🎨', '🧑‍💻', '👨‍🎓', '👩‍💼', '🧑‍🎨', '👩‍🔬', '👨‍🏫', '🧑‍🎓', '👨‍💻', '👩‍🎓']

  // Seeded random based on current week
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const seeded = (i) => ((weekSeed * 31 + i * 17) % 1000) / 1000

  return names.map((name, i) => ({
    name,
    xp: Math.round(league.minXP + seeded(i) * range * 1.3),
    streak: Math.floor(seeded(i + 50) * 30),
    avatar: avatars[i % avatars.length],
  }))
}

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

  const leagueIdx = getLeagueForXP(player.xp)
  const league = LEAGUES[leagueIdx]
  const nextLeague = LEAGUES[leagueIdx + 1]
  const prevLeague = LEAGUES[leagueIdx - 1]

  // Progress to next league
  const leagueProgress = nextLeague
    ? ((player.xp - league.minXP) / (nextLeague.minXP - league.minXP)) * 100
    : 100

  // Build leaderboard with fake players scaled to user's league
  const leaderboard = useMemo(() => {
    const fakePlayers = generatePlayers(player.xp)
    const me = {
      name: 'אתה',
      xp: player.xp,
      streak: player.currentStreak,
      avatar: '🌟',
      isMe: true,
    }
    const all = [...fakePlayers, me]
    all.sort((a, b) => b.xp - a.xp)
    return all.map((p, i) => ({ ...p, rank: i + 1 }))
  }, [player.xp, player.currentStreak])

  const myRank = leaderboard.find(p => p.isMe)?.rank || leaderboard.length
  const totalPlayers = leaderboard.length

  // Promotion zone: top 7, demotion zone: bottom 5
  const promotionCutoff = 7
  const demotionCutoff = totalPlayers - 4
  const isPromotion = myRank <= promotionCutoff && nextLeague
  const isDemotion = myRank >= demotionCutoff && prevLeague

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 animate-fade-in">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-frost-white/60" />
        </button>
        <h2 className="font-display text-xl font-bold text-frost-white">טבלת מובילים</h2>
      </div>

      {/* League badge + tier progress */}
      <div className={`glass-card p-4 mb-4 ${league.border} animate-fade-in`} style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{league.emoji}</span>
          <div className="flex-1">
            <p className={`font-display text-lg font-bold ${league.color}`}>ליגת {league.name}</p>
            <p className="text-[10px] text-frost-white/30">שבועי · מתאפס ביום ראשון</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-frost-white/40">דרגה</p>
            <p className={`text-sm font-bold ${league.color}`}>{leagueIdx + 1}/10</p>
          </div>
        </div>

        {/* League tier bar */}
        <div className="flex items-center gap-1.5 mb-2">
          {LEAGUES.map((l, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < leagueIdx ? 'bg-gold' :
                i === leagueIdx ? `bg-gradient-to-l from-gold to-dusty-aqua` :
                'bg-white/5'
              }`}
              title={`ליגת ${l.name}`}
            />
          ))}
        </div>

        {/* Progress to next league */}
        {nextLeague && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-frost-white/30">הבא: {nextLeague.emoji} {nextLeague.name}</span>
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${Math.min(leagueProgress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-frost-white/30">{nextLeague.minXP - player.xp} XP</span>
          </div>
        )}
      </div>

      {/* Promotion/demotion zone indicator */}
      <div className="flex items-center justify-between mb-4 px-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {nextLeague ? (
          <div className="flex items-center gap-1.5">
            <ChevronUp className="w-3.5 h-3.5 text-success" />
            <span className="text-[10px] text-success">עלייה: מקום 1-{promotionCutoff}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] text-gold">ליגה עליונה!</span>
          </div>
        )}
        {prevLeague && (
          <div className="flex items-center gap-1.5">
            <ChevronDown className="w-3.5 h-3.5 text-danger/60" />
            <span className="text-[10px] text-danger/60">ירידה: מקום {demotionCutoff}+</span>
          </div>
        )}
      </div>

      {/* My rank card */}
      <div className="glass-card p-4 mb-5 border-gold/15 animate-fade-in" style={{ animationDelay: '0.12s' }}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isPromotion ? 'bg-success/15' : isDemotion ? 'bg-danger/15' : 'bg-gold/15'
          }`}>
            <Trophy className={`w-6 h-6 ${
              isPromotion ? 'text-success' : isDemotion ? 'text-danger' : 'text-gold'
            }`} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-frost-white/40">המיקום שלך</p>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-gold">#{myRank}</span>
              {isPromotion && <span className="text-[9px] text-success font-bold px-1.5 py-0.5 rounded-full bg-success/10">↑ עלייה</span>}
              {isDemotion && <span className="text-[9px] text-danger font-bold px-1.5 py-0.5 rounded-full bg-danger/10">↓ ירידה</span>}
            </div>
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-frost-white">{player.xp.toLocaleString()}</p>
            <p className="text-[10px] text-frost-white/40">XP</p>
          </div>
        </div>

        {myRank > 1 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-dusty-aqua" />
            <p className="text-xs text-frost-white/50">
              עוד {(leaderboard[myRank - 2].xp - player.xp).toLocaleString()} XP כדי לעלות למקום #{myRank - 1}
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard list */}
      <div className="space-y-1.5">
        {leaderboard.map((p, i) => {
          const inPromotionZone = p.rank <= promotionCutoff && nextLeague
          const inDemotionZone = p.rank >= demotionCutoff && prevLeague

          return (
            <div
              key={i}
              className={`glass-card px-3 py-2.5 flex items-center gap-2.5 transition-all animate-fade-in ${
                p.isMe ? 'border-gold/30 bg-gold/5 ring-1 ring-gold/20' :
                inPromotionZone ? 'border-success/10' :
                inDemotionZone ? 'border-danger/10' :
                getRankBg(p.rank)
              }`}
              style={{ animationDelay: `${0.15 + i * 0.02}s` }}
            >
              {/* Zone indicator */}
              <div className={`w-1 h-8 rounded-full ${
                inPromotionZone ? 'bg-success/40' :
                inDemotionZone ? 'bg-danger/40' :
                'bg-transparent'
              }`} />

              {/* Rank */}
              <div className="w-7 flex items-center justify-center shrink-0">
                {getRankIcon(p.rank)}
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${
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
                  <p className="text-[9px] text-frost-white/25">🔥 {p.streak} ימים</p>
                )}
              </div>

              {/* XP */}
              <span className={`text-sm font-bold ${p.isMe ? 'text-gold' : 'text-frost-white/50'}`}>
                {p.xp.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>

      {/* League info */}
      <div className="glass-card p-4 mt-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <p className="text-xs font-bold text-frost-white/60 mb-2">📊 על הליגות</p>
        <p className="text-[11px] text-frost-white/35 leading-relaxed">
          יש 10 ליגות מברונזה ועד יהלום.
          ה-7 הראשונים עולים ליגה, 5 האחרונים יורדים.
          הדירוג מתאפס כל שבוע. צבור XP כדי לעלות!
        </p>
      </div>
    </main>
  )
}
