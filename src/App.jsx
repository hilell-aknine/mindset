import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { usePlayer } from './contexts/PlayerContext'
import { useToast } from './contexts/ToastContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import Toast from './components/shared/Toast'
import Spinner from './components/shared/Spinner'
import Onboarding from './components/Onboarding'
import ErrorBoundary from './components/ErrorBoundary'
import AdminGuard from './components/admin/AdminGuard'
import { AnnouncerProvider } from './components/Announcer'
import InstallPrompt from './components/InstallPrompt'

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const BookPage = lazy(() => import('./pages/BookPage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const ReviewPage = lazy(() => import('./pages/ReviewPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const WorkbookPage = lazy(() => import('./pages/WorkbookPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function PageSuspense({ children }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {children}
    </Suspense>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6" role="status" aria-label="טוען את האפליקציה">
      {/* Title skeleton */}
      <div className="mb-6 animate-fade-in">
        <div className="h-8 w-48 bg-white/5 rounded-xl mb-2 animate-pulse" />
        <div className="h-4 w-32 bg-white/3 rounded-lg animate-pulse" />
      </div>
      {/* Card skeletons with stagger */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="glass-card p-4 flex items-center gap-3 animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-3 w-1/2 bg-white/3 rounded-lg animate-pulse" style={{ animationDelay: '0.1s' }} />
              <div className="h-1.5 w-full bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        ))}
      </div>
      {/* Quick actions skeleton */}
      <div className="grid grid-cols-4 gap-2 mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-3 animate-fade-in" style={{ animationDelay: `${0.5 + i * 0.05}s` }}>
            <div className="w-9 h-9 rounded-xl bg-white/5 mx-auto mb-2 animate-pulse" />
            <div className="h-2.5 w-12 bg-white/3 rounded mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner size="lg" text="טוען..." />
  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

function OnboardingGate({ children }) {
  const { player } = usePlayer()
  const navigate = useNavigate()

  if (!player.onboardingComplete) {
    return (
      <Onboarding
        onComplete={(bookSlug) => {
          if (bookSlug) {
            navigate(`/book/${bookSlug}`)
          } else {
            navigate('/home')
          }
        }}
      />
    )
  }

  return children
}

function PageLayout({ children, hideFooter = false }) {
  return (
    <>
      <Header />
      <main id="main-content" className="animate-page-enter has-bottom-nav">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

function OfflineDetector() {
  const toast = useToast()
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOffline = () => {
      setWasOffline(true)
      toast.error('אין חיבור לאינטרנט — המשחק עובד במצב לא מקוון')
    }
    const handleOnline = () => {
      if (wasOffline) {
        toast.success('החיבור חזר!')
        setWasOffline(false)
      }
    }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [toast, wasOffline])

  return null
}

export default function App() {
  const { isAuthenticated, isGuest, loading } = useAuth()

  // Apply saved accessibility settings on mount
  useEffect(() => {
    const fs = localStorage.getItem('mindset_font_size')
    if (fs === 'large') document.documentElement.classList.add('font-large')
    if (fs === 'xl') document.documentElement.classList.add('font-xl')

    if (localStorage.getItem('mindset_reduced_motion') === 'true') {
      document.documentElement.classList.add('reduce-motion')
    }

    if (localStorage.getItem('mindset_theme') === 'light') {
      document.documentElement.classList.add('light')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f5f5f7')
    }
  }, [])

  return (
    <ErrorBoundary>
      <AnnouncerProvider>
      <Toast />
      <OfflineDetector />
      <BottomNav />
      <InstallPrompt />
      <Routes>
        <Route
          path="/"
          element={
            loading ? <Spinner size="lg" text="טוען..." /> :
            (isAuthenticated && !isGuest) ? <Navigate to="/home" replace /> : <PageSuspense><LandingPage /></PageSuspense>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <OnboardingGate>
                <PageLayout>
                  <PageSuspense><HomePage /></PageSuspense>
                </PageLayout>
              </OnboardingGate>
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:slug"
          element={
            <ProtectedRoute>
              <PageLayout>
                <PageSuspense><BookPage /></PageSuspense>
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:bookSlug/:chapterIndex/:lessonIndex"
          element={
            <ProtectedRoute>
              <PageSuspense><LessonPage /></PageSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <PageSuspense><ReviewPage /></PageSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <PageLayout>
                <PageSuspense><StatsPage /></PageSuspense>
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <PageLayout>
                <PageSuspense><LeaderboardPage /></PageSuspense>
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageLayout>
                <PageSuspense><SettingsPage /></PageSuspense>
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workbook/:slug"
          element={
            <ProtectedRoute>
              <PageLayout>
                <PageSuspense><WorkbookPage /></PageSuspense>
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <PageLayout>
                <PageSuspense><AdminPage /></PageSuspense>
              </PageLayout>
            </AdminGuard>
          }
        />
        <Route path="*" element={<PageSuspense><NotFoundPage /></PageSuspense>} />
      </Routes>
      </AnnouncerProvider>
    </ErrorBoundary>
  )
}
