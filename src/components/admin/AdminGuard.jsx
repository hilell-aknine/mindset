import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { isAdmin } from '../../config/admin'
import Spinner from '../shared/Spinner'

export default function AdminGuard({ children }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <Spinner size="lg" text="בודק הרשאות..." />
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (!isAdmin(user?.email)) return <Navigate to="/home" replace />

  return children
}
