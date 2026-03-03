import { useState, useRef, useEffect, useCallback } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { useToast } from '../../contexts/ToastContext'
import { X, Send, Loader2, Bot, User, Zap, Crown } from 'lucide-react'

export default function AICoachChat({ bookSlug, systemPrompt, onClose }) {
  const { player, spendToken } = usePlayer()
  const toast = useToast()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'שלום! אני המאמן שלך. שאל אותי כל שאלה על החומר 🧠' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Escape to close, auto-focus input
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    inputRef.current?.focus()
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const tokensLeft = player.tokens || 0
  const isOutOfTokens = tokensLeft <= 0

  const handleSend = async () => {
    if (!input.trim() || loading) return

    if (isOutOfTokens) {
      toast.error('נגמרו הטוקנים! חזור מחר או שדרג לפרימיום')
      return
    }

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    spendToken()

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          systemPrompt: systemPrompt || 'אתה מאמן למידה. ענה בקצרה בעברית.',
          history: messages.filter(m => m.role !== 'system').slice(-6),
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        throw new Error('API unavailable')
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'המאמן לא זמין כרגע. נסה שוב מאוחר יותר, או שאל שאלה אחרת. (חיבור ל-API נדרש)'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg-base/95 backdrop-blur-lg animate-slide-up sm:inset-auto sm:bottom-6 sm:left-6 sm:w-96 sm:h-[500px] sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl" role="dialog" aria-label="מאמן AI">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center">
            <Bot className="w-4 h-4 text-frost-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-frost-white">מאמן AI</p>
            <div className="flex items-center gap-1">
              <Zap className={`w-2.5 h-2.5 ${tokensLeft > 0 ? 'text-gold' : 'text-frost-white/20'}`} />
              <p className={`text-[10px] ${tokensLeft > 0 ? 'text-frost-white/30' : 'text-danger/60'}`}>
                {tokensLeft > 0 ? `${tokensLeft} טוקנים נותרו` : 'אין טוקנים'}
              </p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="סגור צ'אט">
          <X className="w-5 h-5 text-frost-white/40" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-gold/20' : 'bg-dusty-aqua/20'
            }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-gold" /> : <Bot className="w-3.5 h-3.5 text-dusty-aqua" />}
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gold/10 text-frost-white border border-gold/20'
                : 'bg-white/5 text-frost-white/80 border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-dusty-aqua/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-dusty-aqua" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-frost-white/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 bg-frost-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-1.5 h-1.5 bg-frost-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Out of tokens CTA */}
      {isOutOfTokens && !loading && (
        <div className="px-4 py-3 border-t border-white/5 bg-gold/5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-xs font-bold text-gold">נגמרו הטוקנים</span>
          </div>
          <p className="text-[11px] text-frost-white/40 mb-2">
            3 טוקנים חינמיים מתחדשים כל יום. שדרג לפרימיום לטוקנים ללא הגבלה.
          </p>
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base text-xs font-bold hover:brightness-110 transition-all">
            <Crown className="w-3.5 h-3.5" />
            שדרג לפרימיום
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isOutOfTokens ? 'נגמרו הטוקנים...' : 'שאל שאלה...'}
            disabled={isOutOfTokens}
            className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-frost-white placeholder:text-frost-white/20 focus:border-gold/30 focus:outline-none disabled:opacity-40"
            aria-label="הקלד שאלה למאמן"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || isOutOfTokens}
            className="px-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white disabled:opacity-30 hover:opacity-90 transition-opacity relative"
            aria-label="שלח הודעה"
          >
            <Send className="w-4 h-4" />
            {/* Token cost indicator */}
            {tokensLeft > 0 && input.trim() && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-bg-base text-[8px] font-bold flex items-center justify-center">
                -1
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
