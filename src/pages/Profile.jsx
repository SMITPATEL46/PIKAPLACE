import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { getAllUsers, getCurrentUser, updateUserPassword } from '../utils/session.js'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showChangePasswords, setShowChangePasswords] = useState(false)
  const [forgotForm, setForgotForm] = useState({
    email: user?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [forgotStep, setForgotStep] = useState('request')
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotOtpExpiresAt, setForgotOtpExpiresAt] = useState(null)
  const [forgotOtpSecondsLeft, setForgotOtpSecondsLeft] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  useEffect(() => {
    if (!forgotOtpExpiresAt) {
      setForgotOtpSecondsLeft(0)
      return
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((forgotOtpExpiresAt - Date.now()) / 1000))
      setForgotOtpSecondsLeft(remaining)
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [forgotOtpExpiresAt])

  const accountData = useMemo(() => {
    if (!user) return null
    const users = getAllUsers()
    return users.find((u) => String(u?.email || '').toLowerCase() === String(user.email).toLowerCase()) || null
  }, [user])

  if (!user) {
    navigate('/auth', { replace: true })
    return null
  }

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setSuccess('')
  }

  const onForgotChange = (key, value) => {
    setForgotForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setSuccess('')
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (user.role === 'admin') {
      setError('Admin password cannot be changed from profile.')
      return
    }
    if (!accountData) {
      setError('Account details not found. Please login again.')
      return
    }
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Please fill all password fields.')
      return
    }
    if (accountData.password !== form.currentPassword) {
      setError('Current password is incorrect.')
      return
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password must match.')
      return
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from current password.')
      return
    }

    const result = updateUserPassword(user.email, form.newPassword)
    if (!result.ok) {
      setError('Failed to change password. Please try again.')
      return
    }

    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setSuccess('Password changed successfully.')
  }

  const buildOtp = () => String(Math.floor(100000 + Math.random() * 900000))

  const handleForgotSendOtp = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const email = (forgotForm.email || '').trim().toLowerCase()
    if (!email) {
      setError('Please enter account email.')
      return
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email.')
      return
    }
    const users = getAllUsers()
    const exists = users.some((u) => String(u?.email || '').toLowerCase() === email)
    if (!exists) {
      setError('Account not found for this email.')
      return
    }
    const otp = buildOtp()
    setForgotGeneratedOtp(otp)
    setForgotOtpExpiresAt(Date.now() + 2 * 60 * 1000)
    setForgotStep('verify')
    setForgotForm((prev) => ({ ...prev, email, otp: '', newPassword: '', confirmPassword: '' }))
    setSuccess(`OTP sent successfully. Demo OTP: ${otp}`)
  }

  const handleForgotVerifyOtp = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!forgotForm.otp.trim()) {
      setError('Please enter OTP.')
      return
    }
    if (!forgotOtpExpiresAt || Date.now() > forgotOtpExpiresAt) {
      setError('OTP expired. Please resend OTP.')
      return
    }
    if (forgotForm.otp.trim() !== forgotGeneratedOtp) {
      setError('Invalid OTP. Please try again.')
      return
    }
    setForgotStep('reset')
    setSuccess('OTP verified. Now set your new password.')
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (forgotStep !== 'reset') return
    if (!forgotForm.newPassword || !forgotForm.confirmPassword) {
      setError('Please fill new password fields.')
      return
    }
    if (forgotForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setError('New password and confirm password must match.')
      return
    }
    const result = updateUserPassword(forgotForm.email, forgotForm.newPassword)
    if (!result.ok) {
      setError('Account not found for this email.')
      return
    }
    setForgotForm({ email: user?.email || '', otp: '', newPassword: '', confirmPassword: '' })
    setForgotGeneratedOtp('')
    setForgotOtpExpiresAt(null)
    setForgotStep('request')
    setSuccess('Password reset successfully.')
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
              <span className="profile-value">
                {user.name || user.email?.split('@')?.[0] || 'User'}
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Role</span>
              <span className="profile-value">{user.role}</span>
            </div>
            {accountData?.mobile && (
              <div className="profile-row">
                <span className="profile-label">Mobile</span>
                <span className="profile-value">{accountData.mobile}</span>
              </div>
            )}
          </div>

          <div className="profile-password-panel">
            <button
              type="button"
              className="profile-toggle-link"
              onClick={() => {
                setShowChangePassword((v) => !v)
                setShowForgotPassword(false)
                setError('')
                setSuccess('')
              }}
            >
              {showChangePassword ? 'Hide Change Password' : 'Change Password'}
            </button>

            {showChangePassword && (
              <form className="password-form" onSubmit={handleChangePassword}>
                <h2>Change Password</h2>
                <label>
                  Current Password
                  <input
                    type={showChangePasswords ? 'text' : 'password'}
                    value={form.currentPassword}
                    onChange={(e) => onChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                  />
                </label>
                <label>
                  New Password
                  <input
                    type={showChangePasswords ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={(e) => onChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                </label>
                <label>
                  Confirm New Password
                  <input
                    type={showChangePasswords ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => onChange('confirmPassword', e.target.value)}
                    placeholder="Repeat new password"
                  />
                </label>
                <label className="profile-show-pass">
                  <input
                    type="checkbox"
                    checked={showChangePasswords}
                    onChange={(e) => setShowChangePasswords(e.target.checked)}
                  />
                  <span>Show Passwords</span>
                </label>
                <button type="submit">Update Password</button>
                <button
                  type="button"
                  className="profile-inline-link"
                  onClick={() => {
                    setShowForgotPassword((v) => !v)
                    setForgotStep('request')
                    setForgotGeneratedOtp('')
                    setForgotOtpExpiresAt(null)
                    setForgotForm((prev) => ({
                      ...prev,
                      otp: '',
                      newPassword: '',
                      confirmPassword: '',
                    }))
                    setError('')
                    setSuccess('')
                  }}
                >
                  {showForgotPassword ? 'Hide Forgot Password' : 'Forgot Password?'}
                </button>
              </form>
            )}

            {showForgotPassword && (
              <form
                className="password-form profile-forgot-form"
                onSubmit={
                  forgotStep === 'request'
                    ? handleForgotSendOtp
                    : forgotStep === 'verify'
                      ? handleForgotVerifyOtp
                      : handleForgotPassword
                }
              >
                <h2>Forgot Password</h2>
                <div className="profile-forgot-step">
                  {forgotStep === 'request'
                    ? 'Step 1: Enter Email'
                    : forgotStep === 'verify'
                      ? 'Step 2: Verify OTP'
                      : 'Step 3: Reset Password'}
                </div>
                <label>
                  Account Email
                  <input
                    type="email"
                    value={forgotForm.email}
                    onChange={(e) => onForgotChange('email', e.target.value)}
                    placeholder="Enter account email"
                    disabled={forgotStep !== 'request'}
                  />
                </label>
                {forgotStep !== 'request' && (
                  <label>
                    OTP (6-digit)
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={forgotForm.otp}
                      onChange={(e) => onForgotChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter OTP"
                    />
                  </label>
                )}
                {forgotStep === 'reset' && (
                  <>
                    <label>
                      New Password
                      <input
                        type="password"
                        value={forgotForm.newPassword}
                        onChange={(e) => onForgotChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                    </label>
                    <label>
                      Confirm New Password
                      <input
                        type="password"
                        value={forgotForm.confirmPassword}
                        onChange={(e) => onForgotChange('confirmPassword', e.target.value)}
                        placeholder="Repeat new password"
                      />
                    </label>
                  </>
                )}
                <button type="submit">
                  {forgotStep === 'request'
                    ? 'Send OTP'
                    : forgotStep === 'verify'
                      ? 'Verify OTP'
                      : 'Reset Password'}
                </button>
                {forgotStep === 'verify' && forgotOtpSecondsLeft > 0 && (
                  <span className="profile-inline-link">OTP valid for {forgotOtpSecondsLeft}s</span>
                )}
                {forgotStep === 'verify' && forgotOtpSecondsLeft === 0 && (
                  <button type="button" className="profile-inline-link" onClick={handleForgotSendOtp}>
                    Resend OTP
                  </button>
                )}
              </form>
            )}

            {error ? <p className="profile-message profile-message--error">{error}</p> : null}
            {success ? <p className="profile-message profile-message--success">{success}</p> : null}
          </div>
        </section>
      </main>
    </>
  )
}
