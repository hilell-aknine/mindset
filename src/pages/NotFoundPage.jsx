import { useNavigate } from 'react-router-dom'
import { Home, BookOpen, BarChart3, Search } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  const links = [
    { label: 'דף הבית', path: '/home', icon: Home, color: 'text-gold' },
    { label: 'הספרייה', path: '/home', icon: BookOpen, color: 'text-dusty-aqua' },
    { label: 'סטטיסטיקות', path: '/stats', icon: BarChart3, color: 'text-muted-teal' },
  ]

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 text-center">
      {/* Big 404 */}
      <div className="relative mb-6 animate-fade-in">
        <span className="text-[120px] sm:text-[160px] font-display font-black text-white/[0.03] leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="w-16 h-16 text-frost-white/10" />
        </div>
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-frost-white mb-2 animate-bounce-in">
        הדף לא נמצא
      </h1>
      <p className="text-frost-white/40 text-sm mb-8 max-w-xs animate-bounce-in" style={{ animationDelay: '0.1s' }}>
        נראה שהגעת לעמוד שלא קיים. אולי השיעור הוזז או שהקישור לא נכון.
      </p>

      {/* Quick links */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {links.map((link, i) => (
          <button
            key={link.path + link.label}
            onClick={() => navigate(link.path)}
            className="glass-card p-4 flex items-center gap-3 hover:border-white/20 transition-all animate-bounce-in"
            style={{ animationDelay: `${0.2 + i * 0.08}s` }}
          >
            <link.icon className={`w-5 h-5 ${link.color}`} />
            <span className="text-sm font-medium text-frost-white">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-xs text-frost-white/30 hover:text-frost-white/50 transition-colors animate-fade-in"
        style={{ animationDelay: '0.5s' }}
      >
        ← חזור לעמוד הקודם
      </button>
    </main>
  )
}
