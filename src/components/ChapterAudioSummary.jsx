import { useState, useRef, useEffect } from 'react'
import { Headphones, Play, Pause, Trophy, Check } from 'lucide-react'
import { usePlayer } from '../contexts/PlayerContext'
import { XP_CHAPTER_AUDIO } from '../config/constants'
import { getXPMultiplier } from '../lib/events'

export default function ChapterAudioSummary({ bookSlug, chapterIndex, chapterTitle }) {
  const { player, completeAudioSummary } = usePlayer()
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [xpAwarded, setXpAwarded] = useState(false)
  const [showXpToast, setShowXpToast] = useState(false)

  const key = `${bookSlug}:${chapterIndex}`
  const alreadyListened = !!player.listenedAudioSummaries?.[key]
  const audioSrc = `/audio/${bookSlug}/chapter-${chapterIndex}.mp3`

  // Award XP when user listens to 50%+
  useEffect(() => {
    if (xpAwarded || alreadyListened) return
    if (duration > 0 && progress >= 0.5) {
      completeAudioSummary(bookSlug, chapterIndex)
      setXpAwarded(true)
      setShowXpToast(true)
      setTimeout(() => setShowXpToast(false), 3000)
    }
  }, [progress, duration, xpAwarded, alreadyListened])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress(audio.currentTime / audio.duration)
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio) setDuration(audio.duration)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    // RTL: right side = start, left side = end
    const clickX = e.clientX - rect.left
    const ratio = 1 - (clickX / rect.width)
    audio.currentTime = ratio * audio.duration
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const multiplier = getXPMultiplier()
  const xpValue = Math.round(XP_CHAPTER_AUDIO * multiplier)

  return (
    <div className="mr-14 mt-2 mb-1">
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => e.currentTarget.parentElement.style.display = 'none'}
      />

      <div className={`glass-card px-4 py-3 border transition-all ${
        alreadyListened ? 'border-success/20 bg-success/5' : 'border-dusty-aqua/15 hover:border-dusty-aqua/30'
      }`}>
        {/* Header row */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 ${
              isPlaying
                ? 'bg-gold/20 text-gold'
                : alreadyListened
                  ? 'bg-success/15 text-success'
                  : 'bg-dusty-aqua/15 text-dusty-aqua hover:bg-dusty-aqua/25'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Headphones className={`w-3 h-3 ${alreadyListened ? 'text-success' : 'text-dusty-aqua/60'}`} />
              <span className={`text-xs font-medium ${alreadyListened ? 'text-success' : 'text-frost-white/70'}`}>
                סיכום שמיעה
              </span>
              {alreadyListened && <Check className="w-3 h-3 text-success" />}
            </div>
            <p className="text-[10px] text-frost-white/30 mt-0.5 truncate">{chapterTitle}</p>
          </div>

          {/* XP badge */}
          {!alreadyListened && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/20">
              <Trophy className="w-3 h-3 text-gold" />
              <span className="text-[10px] font-bold text-gold">+{xpValue}</span>
            </div>
          )}
        </div>

        {/* Progress bar — only show if audio has been interacted with */}
        {duration > 0 && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] text-frost-white/30 w-8 text-left tabular-nums">
              {formatTime((audioRef.current?.currentTime) || 0)}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full bg-white/5 cursor-pointer relative overflow-hidden"
              onClick={handleSeek}
            >
              <div
                className={`absolute top-0 right-0 h-full rounded-full transition-all ${
                  alreadyListened ? 'bg-success' : 'bg-dusty-aqua'
                }`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-frost-white/30 w-8 text-right tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        )}
      </div>

      {/* Floating XP toast */}
      {showXpToast && (
        <div className="flex items-center justify-center gap-1.5 mt-2 animate-bounce-in">
          <span className="text-xs font-bold text-gold">+{xpValue} XP</span>
          <Headphones className="w-3 h-3 text-gold" />
          <span className="text-[10px] text-frost-white/40">בונוס סיכום שמיעה!</span>
        </div>
      )}
    </div>
  )
}
