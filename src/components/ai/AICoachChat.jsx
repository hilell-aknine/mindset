import { useState, useRef, useEffect } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { useToast } from '../../contexts/ToastContext'
import { X, Send, Loader2, Bot, User } from 'lucide-react'

export default function AICoachChat({ bookSlug, systemPrompt, onClose }) {
  const { player, spendToken } = usePlayer()
  const toast = useToast()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'שלום! אני המאמן שלך. שאל אותי כל שאלה על החומר 🧠' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    if (player.tokens <= 0) {
      toast.error('נגמרו הטוקנים! חזור מחר או שדרג לפרימיום')
      return
    }

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    spendToken()

    try {
      // Try the API proxy first
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
      // Fallback: local response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'המאמן לא זמין כרגע. נסה שוב מאוחר יותר, או שאל שאלה אחרת. (חיבור ל-API נדרש)'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg-base/95 backdrop-blur-lg animate-slide-up sm:inset-auto sm:bottom-6 sm:left-6 sm:w-96 sm:h-[500px] sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-deep-petrol to-dusty-aqua flex items-center justify-center">
            <Bot className="w-4 h-4 text-frost-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-frost-white">מאמן AI</p>
            <p className="text-[10px] text-frost-white/30">{player.tokens} טוקנים נותרו</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
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
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
              <Loader2 className="w-4 h-4 text-frost-white/30 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="שאל שאלה..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-frost-white placeholder:text-frost-white/20 focus:border-gold/30 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
