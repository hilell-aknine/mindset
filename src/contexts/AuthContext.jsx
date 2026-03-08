import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
      } else if (localStorage.getItem('mindset_guest') === 'true') {
        // Restore guest session from localStorage
        setIsGuest(true)
        setUser({ id: 'guest', email: 'guest@mindset.local' })
      }
      setLoading(false)
    }).catch(() => {
      // Network error on initial load — try restoring guest mode
      if (localStorage.getItem('mindset_guest') === 'true') {
        setIsGuest(true)
        setUser({ id: 'guest', email: 'guest@mindset.local' })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        setIsGuest(false)
        setAuthError(null)
        localStorage.removeItem('mindset_guest')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsGuest(false)
        setAuthError(null)
      }
      // Don't clear guest user on INITIAL_SESSION with no session
      if (event === 'TOKEN_REFRESHED') {
        setAuthError(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const clearError = useCallback(() => setAuthError(null), [])

  const loginWithGoogle = async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/home' }
    })
    if (error) {
      setAuthError(error.message)
      throw error
    }
  }

  const loginWithEmail = async (email, password) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }
    return data
  }

  const registerWithEmail = async (email, password) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }
    return data
  }

  const continueAsGuest = () => {
    setAuthError(null)
    setIsGuest(true)
    setUser({ id: 'guest', email: 'guest@mindset.local' })
    localStorage.setItem('mindset_guest', 'true')
  }

  const logout = async () => {
    if (!isGuest) {
      try { await supabase.auth.signOut() } catch {}
    }
    setUser(null)
    setIsGuest(false)
    setAuthError(null)
    localStorage.removeItem('mindset_player')
    localStorage.removeItem('mindset_guest')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user, isGuest, loading, isAuthenticated, authError, clearError,
      loginWithGoogle, loginWithEmail, registerWithEmail, continueAsGuest, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
