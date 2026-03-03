import { Component } from 'react'
import { RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/home'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-bg-base">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="font-display text-2xl font-bold text-frost-white mb-2">
            משהו השתבש
          </h1>
          <p className="text-frost-white/40 text-sm mb-6 max-w-xs">
            קרתה שגיאה לא צפויה. נסה לרענן את הדף או לחזור לדף הבית.
          </p>

          <div className="flex gap-3">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              רענן
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-frost-white/60 font-bold text-sm hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4" />
              דף הבית
            </button>
          </div>

          {/* Error details (collapsed) */}
          {this.state.error && (
            <details className="mt-8 text-right w-full max-w-sm">
              <summary className="text-[10px] text-frost-white/20 cursor-pointer hover:text-frost-white/30">
                פרטי שגיאה טכניים
              </summary>
              <pre className="mt-2 p-3 rounded-xl bg-white/5 text-[10px] text-frost-white/20 overflow-x-auto text-left" dir="ltr">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
