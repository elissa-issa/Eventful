import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function RequireAuth({ children }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`

    return <Navigate to="/login" replace state={{ from }} />
  }

  return children
}

export default RequireAuth
