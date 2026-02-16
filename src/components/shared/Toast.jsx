import { useToast } from '../../contexts/ToastContext'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const colors = {
  success: 'bg-success/20 border-success/30 text-success',
  error: 'bg-danger/20 border-danger/30 text-danger',
  info: 'bg-dusty-aqua/20 border-dusty-aqua/30 text-dusty-aqua',
}

export default function Toast() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map(toast => {
        const Icon = icons[toast.type] || icons.info
        const color = colors[toast.type] || colors.info
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg animate-slide-down ${color}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium text-frost-white">{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}
