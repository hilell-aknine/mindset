import { useToast } from '../../contexts/ToastContext'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-success/20 border-success/30 text-success',
  error: 'bg-danger/20 border-danger/30 text-danger',
  warning: 'bg-warning/20 border-warning/30 text-warning',
  info: 'bg-dusty-aqua/20 border-dusty-aqua/30 text-dusty-aqua',
}

export default function Toast() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4" role="status" aria-live="polite">
      {toasts.slice(0, 3).map((toast, i) => {
        const Icon = icons[toast.type] || icons.info
        const color = colors[toast.type] || colors.info
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg animate-slide-down shadow-lg ${color}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium text-frost-white flex-1">{toast.message}</span>
            {dismiss && (
              <button
                onClick={() => dismiss(toast.id)}
                className="p-0.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="סגור התראה"
              >
                <X className="w-3.5 h-3.5 opacity-40" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
