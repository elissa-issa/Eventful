import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function GuestOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  return children
}

export default GuestOnlyRoute
