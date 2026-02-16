import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AuthScreen from './components/auth/AuthScreen'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Toast from './components/shared/Toast'
import Spinner from './components/shared/Spinner'
import HomePage from './pages/HomePage'
import BookPage from './pages/BookPage'
import LessonPage from './pages/LessonPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner size="lg" text="טוען..." />
  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  return (
    <>
      <Toast />
      <Routes>
        <Route
          path="/"
          element={
            loading ? <Spinner size="lg" text="טוען..." /> :
            isAuthenticated ? <Navigate to="/home" replace /> : <AuthScreen />
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Header />
              <HomePage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:slug"
          element={
            <ProtectedRoute>
              <Header />
              <BookPage />
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:bookSlug/:chapterIndex/:lessonIndex"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
