import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../utils/session.js'

export default function RequireCustomer() {
  const location = useLocation()
  const user = getCurrentUser()

  if (!user || user.role !== 'customer') {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          redirectTo: location.pathname,
          redirectState: location.state,
        }}
      />
    )
  }

  return <Outlet />
}

