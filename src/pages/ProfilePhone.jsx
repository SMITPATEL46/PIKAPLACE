import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'

import Navbar from '../components/Navbar.jsx'
import { auth } from '../firebase/firebaseClient.js'
import { getCurrentUser } from '../utils/session.js'
import './Profile.css'

export default function ProfilePhone() {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const displayName = useMemo(() => {
    if (!user) return ''
    return user.name?.trim() || user.phone_number || ''
  }, [user])

  if (!user) {
    navigate('/auth', { replace: true })
    return null
  }

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <section className="profile-card">
          <h1 className="profile-title">My Profile</h1>

          <div className="profile-details">
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <span className="profile-value">{displayName || 'User'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Phone</span>
              <span className="profile-value">{user.phone_number}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Role</span>
              <span className="profile-value">{user.role}</span>
            </div>
          </div>

          <div className="profile-password-panel">
            <button
              type="button"
              className="profile-toggle-link"
              onClick={() => {
                localStorage.removeItem('user')
                signOut(auth).catch(() => {})
                navigate('/auth', { replace: true })
              }}
            >
              Logout
            </button>
          </div>
        </section>
      </main>
    </>
  )
}

