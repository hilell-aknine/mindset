import { useState, useRef, useEffect } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { useToast } from '../../contexts/ToastContext'
import { X, Send, Loader2, Bot, User, Crown, Theater, Sparkles } from 'lucide-react'

const SCENARIO_PROMPTS = {
  'atomic-habits': 'אתה מנחה סימולציה. צור תרחיש מהחיים האמיתיים שדורש יישום של עקרונות "הרגלים אטומים" (שינוי סביבה, זהות, מערכות vs מטרות, חוק 1% וכו\'). הצג מצב ושאל "מה היית עושה?" עם 3 אפשרויות. רק אחת מיישמת נכון את העיקרון. אחרי שהמשתמש בוחר, הסבר למה. ענה בעברית.',
  'strengths-finder': 'אתה מנחה סימולציה. צור תרחיש מקצועי שדורש שימוש בחוזקות אישיות (לא תיקון חולשות). הצג מצב ושאל "מה היית עושה?" עם 3 אפשרויות. רק אחת מיישמת את גישת החוזקות. ענה בעברית.',
  'happy-chemicals': 'אתה מנחה סימולציה. צור תרחיש יומיומי הקשור לדופמין/סרוטונין/אוקסיטוצין/אנדורפין. הצג מצב ושאל "מה היית עושה?" עם 3 אפשרויות. רק אחת מתאימה לפי המדע. ענה בעברית.',
  'next-five-moves': 'אתה מנחה סימולציה עסקית. צור תרחיש של יזם שצריך לחשוב 5 מהלכים קדימה. הצג מצב ושאל "מה המהלך הנכון?" עם 3 אפשרויות. ענה בעברית.',
  'mindset-book': 'אתה מנחה סימולציה. צור תרחיש שדורש בחירה בין חשיבה קבועה לחשיבה צמיחה. הצג מצב ושאל "מה היית עושה?" עם 3 אפשרויות. רק אחת משקפת growth mindset. ענה בעברית.',
}

export default function AIScenarioChat({ bookSlug, onClose }) {
  const { player } = usePlayer()
  const toast = useToast()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'ברוך הבא לסימולציה! אני אציג לך תרחיש מהחיים האמיתיים ותצטרך להחליט מה לעשות — לפי העקרונות שלמדת. מוכן?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const messagesEnd = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const isPremium = player.isPremium

  const startScenario = async () => {
    if (!isPremium) {
      toast.error('סימולציות זמינות למנויי פרימיום בלבד')
      return
    }
    setStarted(true)
    setLoading(true)

    try {
      const systemPrompt = SCENARIO_PROMPTS[bookSlug] || SCENARIO_PROMPTS['atomic-habits']
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'התחל סימולציה חדשה',
          systemPrompt,
          history: [],
        })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'לא הצלחתי ליצור תרחיש. נסה שוב.' }])
      } else {
        throw new Error()
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'הסימולציה לא זמינה כרגע. נסה שוב מאוחר יותר.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const systemPrompt = SCENARIO_PROMPTS[bookSlug] || SCENARIO_PROMPTS['atomic-habits']
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          systemPrompt,
          history: messages.filter(m => m.role !== 'system').slice(-8),
        })
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'נסה שוב.' }])
      } else {
        throw new Error()
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'הסימולציה לא זמינה כרגע.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg-base/95 backdrop-blur-lg animate-slide-up sm:inset-auto sm:bottom-6 sm:left-6 sm:w-96 sm:h-[520px] sm:rounded-2xl sm:border sm:border-gold/20 sm:shadow-2xl" role="dialog" aria-label="סימולציה AI">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10 bg-gold/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-warning flex items-center justify-center">
            <Theater className="w-4 h-4 text-bg-base" />
          </div>
          <div>
            <p className="text-sm font-bold text-frost-white flex items-center gap-1">
              סימולציה
              <Crown className="w-3 h-3 text-gold" />
            </p>
            <p className="text-[10px] text-frost-white/30">תרגול יישום עקרונות בתרחישים אמיתיים</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="סגור">
          <X className="w-5 h-5 text-frost-white/40" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-gold/20' : 'bg-warning/20'
            }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-gold" /> : <Theater className="w-3.5 h-3.5 text-warning" />}
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
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
            <div className="w-7 h-7 rounded-lg bg-warning/20 flex items-center justify-center">
              <Theater className="w-3.5 h-3.5 text-warning" />
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

      {/* Start button or input */}
      {!started ? (
        <div className="p-4 border-t border-white/5">
          {isPremium ? (
            <button
              onClick={startScenario}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-gold to-warning text-bg-base font-bold text-sm hover:brightness-110 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              התחל סימולציה
            </button>
          ) : (
            <div className="text-center">
              <p className="text-xs text-frost-white/40 mb-2">סימולציות זמינות למנויי פרימיום</p>
              <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-l from-gold via-gold to-[#e8c84a] text-bg-base text-xs font-bold hover:brightness-110 transition-all">
                <Crown className="w-3.5 h-3.5" />
                שדרג לפרימיום
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 border-t border-white/5">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="הקלד את תשובתך..."
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-frost-white placeholder:text-frost-white/20 focus:border-gold/30 focus:outline-none"
              aria-label="הקלד תשובה"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-3 rounded-xl bg-gradient-to-l from-gold to-warning text-bg-base disabled:opacity-30 hover:opacity-90 transition-opacity"
              aria-label="שלח"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
