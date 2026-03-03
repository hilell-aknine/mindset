import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Brain, Mail, User, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getPasswordStrength(pw) {
  if (!pw) return { level: 0, text: '', color: '' }
  if (pw.length < 6) return { level: 1, text: 'חלשה מדי', color: 'text-danger' }
  if (pw.length < 8) return { level: 2, text: 'בינונית', color: 'text-warning' }
  const hasUpper = /[A-Z]/.test(pw)
  const hasNum = /[0-9]/.test(pw)
  if (hasUpper && hasNum && pw.length >= 10) return { level: 4, text: 'חזקה מאוד', color: 'text-success' }
  if (hasNum || hasUpper) return { level: 3, text: 'טובה', color: 'text-dusty-aqua' }
  return { level: 2, text: 'בינונית', color: 'text-warning' }
}

export default function AuthScreen() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, continueAsGuest } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState('main') // main | email-login | email-register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')

  const handleGoogle = async () => {
    try {
      setLoading(true)
      await loginWithGoogle()
    } catch (err) {
      toast.error('שגיאה בהתחברות עם Google')
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('נא למלא את כל השדות')
    if (!validateEmail(email)) {
      setEmailError('כתובת אימייל לא תקינה')
      return
    }
    if (mode === 'email-register' && password.length < 6) {
      return toast.error('סיסמה חייבת להיות לפחות 6 תווים')
    }
    setEmailError('')
    try {
      setLoading(true)
      if (mode === 'email-login') {
        await loginWithEmail(email, password)
      } else {
        await registerWithEmail(email, password)
        toast.success('נרשמת בהצלחה! בדוק את המייל לאישור')
      }
    } catch (err) {
      toast.error(err.message || 'שגיאה בהתחברות')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = mode === 'email-register' ? getPasswordStrength(password) : null

  const handleGuest = () => {
    continueAsGuest()
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-deep-petrol/20 blur-[100px]" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-gold/10 blur-[80px]" />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-deep-petrol to-dusty-aqua mb-4">
            <Brain className="w-10 h-10 text-frost-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-frost-white mb-2">MindSet</h1>
          <p className="text-frost-white/60 text-sm">למד ספר ב-15 דקות</p>
        </div>

        {mode === 'main' && (
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              התחבר עם Google
            </button>

            {/* Email */}
            <button
              onClick={() => setMode('email-login')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-bg-card border border-white/10 text-frost-white font-medium text-sm hover:bg-bg-card-hover transition-colors"
            >
              <Mail className="w-5 h-5" />
              התחבר עם אימייל
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-frost-white/40">או</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Guest */}
            <button
              onClick={handleGuest}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-white/10 text-frost-white/60 text-sm hover:text-frost-white hover:border-white/20 transition-colors"
            >
              <User className="w-5 h-5" />
              המשך כאורח
            </button>

            <p className="text-center text-xs text-frost-white/30 mt-4">
              במצב אורח ההתקדמות נשמרת רק במכשיר זה
            </p>
          </div>
        )}

        {(mode === 'email-login' || mode === 'email-register') && (
          <form onSubmit={handleEmailSubmit} className="space-y-3" aria-label={mode === 'email-login' ? 'טופס התחברות' : 'טופס הרשמה'}>
            <div>
              <label htmlFor="auth-email" className="sr-only">אימייל</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                placeholder="אימייל"
                autoComplete="email"
                aria-invalid={!!emailError}
                className={`w-full px-4 py-3 rounded-xl bg-bg-card border text-frost-white placeholder:text-frost-white/30 text-sm focus:outline-none transition-colors ${
                  emailError ? 'border-danger/50 focus:border-danger' : 'border-white/10 focus:border-gold/50'
                }`}
                dir="ltr"
              />
              {emailError && (
                <p className="flex items-center gap-1 mt-1 text-[10px] text-danger" role="alert">
                  <AlertCircle className="w-3 h-3" />
                  {emailError}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="auth-password" className="sr-only">סיסמה</label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמה"
                  autoComplete={mode === 'email-login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-bg-card border border-white/10 text-frost-white placeholder:text-frost-white/30 text-sm focus:border-gold/50 focus:outline-none transition-colors"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-frost-white/30 hover:text-frost-white/60 transition-colors"
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator for registration */}
              {passwordStrength && password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength.level ? (
                        passwordStrength.level <= 1 ? 'bg-danger' :
                        passwordStrength.level <= 2 ? 'bg-warning' :
                        passwordStrength.level <= 3 ? 'bg-dusty-aqua' :
                        'bg-success'
                      ) : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-[9px] font-bold ${passwordStrength.color}`}>{passwordStrength.text}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-l from-deep-petrol to-dusty-aqua text-frost-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : mode === 'email-login' ? 'התחבר' : 'הירשם'}
            </button>

            <div className="flex justify-between text-xs text-frost-white/40">
              <button
                type="button"
                onClick={() => { setMode(mode === 'email-login' ? 'email-register' : 'email-login'); setEmailError('') }}
                className="hover:text-gold transition-colors"
              >
                {mode === 'email-login' ? 'עדיין אין לך חשבון? הירשם' : 'יש לך חשבון? התחבר'}
              </button>
              <button
                type="button"
                onClick={() => setMode('main')}
                className="hover:text-gold transition-colors"
              >
                חזרה
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
