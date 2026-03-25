import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Navbar from '../components/Navbar.jsx'
import { addToCart, getAllUsers, recordUserLogin, updateUserPassword } from '../utils/session.js'
import './Auth.css'

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  autoComplete = 'off',
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const actualType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`field ${isPassword ? 'field--password' : ''}`}>
      <label>{label}</label>
      <div className="field__input-wrapper">
        <input
          name={name}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        {isPassword && (
          <button
            type="button"
            className="field__eye-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {error ? <div className="error">{error}</div> : null}
    </div>
  )
}

export default function Auth() {
  const ADMIN_EMAILS = ['s@gmail.com'].map((e) => e.toLowerCase())
  const ADMIN_PASSWORD = 'smit@1607'

  const [actor, setActor] = useState('customer')
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [formVersion, setFormVersion] = useState(0)
  const emptyForm = {
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirm: '',
  }

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const e = {}
    if (mode === 'register' && !form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (mode === 'register' && !form.mobile.trim()) e.mobile = 'Mobile number is required'
    if (!form.password) e.password = 'Password is required'
    if (mode === 'register' && form.password !== form.confirm)
      e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotForm, setForgotForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [forgotStep, setForgotStep] = useState('request')
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState('')
  const [forgotOtpExpiresAt, setForgotOtpExpiresAt] = useState(null)
  const [forgotOtpSecondsLeft, setForgotOtpSecondsLeft] = useState(0)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
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

  const finishAuthRedirect = (user) => {
    const redirectTo = location.state?.redirectTo
    const redirectState = location.state?.redirectState

    // If user was trying to do something (buy/add to cart), handle it here.
    const isProductRedirect = typeof redirectTo === 'string' && redirectTo.startsWith('/product')

    if (user?.role === 'customer' && isProductRedirect && redirectState?.action === 'buy') {
      const product = redirectState?.product
      if (product) {
        try {
          localStorage.setItem('selectedProduct', JSON.stringify(product))
        } catch {
          // ignore
        }
        navigate('/checkout', { state: { product } })
        return
      }
    }

    if (user?.role === 'customer' && isProductRedirect && redirectState?.action === 'addToCart') {
      const product = redirectState?.product
      if (product) {
        addToCart(user.email, product, 1)
        navigate('/cart')
        return
      }
    }

    if (redirectTo) {
      navigate(redirectTo, { state: redirectState })
      return
    }

    navigate(user?.role === 'admin' ? '/admin' : '/product')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setSubmitError(null)

    try {
      if (mode === 'login') {
        if (actor === 'admin') {
          const inputEmail = (form.email || '').toLowerCase()
          const isAllowedAdmin = ADMIN_EMAILS.includes(inputEmail)
          if (!isAllowedAdmin || form.password !== ADMIN_PASSWORD) {
            setSubmitError('Invalid admin credentials')
            setForm((prev) => ({ ...prev, password: '', confirm: '' }))
            return
          }
          const user = { email: inputEmail, name: 'Admin', role: 'admin' }
          localStorage.setItem('user', JSON.stringify(user))
          recordUserLogin(user.email, user.role)
          alert('Admin logged in successfully')
          setForm(emptyForm)
          setErrors({})
          finishAuthRedirect(user)
        } else {
          const inputEmail = (form.email || '').toLowerCase()
          const usersRaw = localStorage.getItem('users')
          let users = []
          try {
            users = usersRaw ? JSON.parse(usersRaw) : []
          } catch {
            users = []
          }
          const existing = users.find((u) => (u.email || '').toLowerCase() === inputEmail)
          if (!existing) {
            setSubmitError('Account not found. Please register first.')
            setForm((prev) => ({ ...prev, password: '', confirm: '' }))
            setMode('register')
            return
          }
          if (existing.password !== form.password) {
            setSubmitError('Invalid credentials')
            setForm((prev) => ({ ...prev, password: '', confirm: '' }))
            return
          }
          const user = {
            email: existing.email,
            name: existing.name || existing.email.split('@')[0],
            role: 'customer',
          }
          localStorage.setItem('user', JSON.stringify(user))
          recordUserLogin(user.email, user.role)
          alert('Customer logged in successfully')
          setForm(emptyForm)
          setErrors({})
          finishAuthRedirect(user)
        }
      } else {
        const inputEmail = (form.email || '').toLowerCase()
        const usersRaw = localStorage.getItem('users')
        let users = []
        try {
          users = usersRaw ? JSON.parse(usersRaw) : []
        } catch {
          users = []
        }
        if (users.some((u) => (u.email || '').toLowerCase() === inputEmail)) {
          setSubmitError('Account already exists. Please login.')
          setForm((prev) => ({ ...prev, password: '', confirm: '' }))
          setMode('login')
          return
        }
        const newUser = {
          email: inputEmail,
          name: form.name || form.email.split('@')[0],
          mobile: form.mobile,
          password: form.password,
          role: 'customer',
        }
        users.push(newUser)
        localStorage.setItem('users', JSON.stringify(users))
        localStorage.setItem(
          'user',
          JSON.stringify({ email: newUser.email, name: newUser.name, role: 'customer' }),
        )
        alert('Customer registered successfully')
        setForm(emptyForm)
        setErrors({})
        finishAuthRedirect({ email: newUser.email, name: newUser.name, role: 'customer' })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setSubmitError('An error occurred. Please try again.')
      setForm((prev) => ({ ...prev, password: '', confirm: '' }))
    } finally {
      setLoading(false)
    }
  }

  // Ensure form is always empty when this page is opened (e.g. after logout)
  useEffect(() => {
    setForm(emptyForm)
    setErrors({})
    setSubmitError(null)
    setLoading(false)
    setActor('customer')
    setMode('login')
    setFormVersion((v) => v + 1)
  }, [])

  // Clear form when user logs out in another place (storage change)
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'user' && event.newValue === null) {
        setForm(emptyForm)
        setErrors({})
        setSubmitError(null)
        setLoading(false)
        setActor('customer')
        setMode('login')
        setFormVersion((v) => v + 1)
      }
    }
    window.addEventListener('storage', handleStorage)
    const handleAppLogout = () => {
      setForm(emptyForm)
      setErrors({})
      setSubmitError(null)
      setLoading(false)
      setActor('customer')
      setMode('login')
      setFormVersion((v) => v + 1)
    }
    window.addEventListener('pikaplace-logout', handleAppLogout)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pikaplace-logout', handleAppLogout)
    }
  }, [])

  const isAdmin = actor === 'admin'

  const handleSelectAdmin = () => {
    setActor('admin')
    setMode('login')
    setForm(emptyForm)
    setErrors({})
    setSubmitError(null)
    setFormVersion((v) => v + 1)
  }

  const handleSelectCustomer = () => {
    setActor('customer')
    setForm(emptyForm)
    setErrors({})
    setSubmitError(null)
    setFormVersion((v) => v + 1)
  }

  const handleToggleMode = (nextMode) => {
    if (isAdmin && nextMode === 'register') return
    setMode(nextMode)
    setForm(emptyForm)
    setErrors({})
    setSubmitError(null)
    setShowForgotPassword(false)
    setForgotForm({ email: '', otp: '', newPassword: '', confirmPassword: '' })
    setForgotStep('request')
    setForgotGeneratedOtp('')
    setForgotOtpExpiresAt(null)
    setForgotError('')
    setForgotSuccess('')
    setFormVersion((v) => v + 1)
  }

  const buildOtp = () => String(Math.floor(100000 + Math.random() * 900000))

  const handleForgotSendOtp = () => {
    setForgotError('')
    setForgotSuccess('')

    const email = (forgotForm.email || '').trim().toLowerCase()
    if (!email) {
      setForgotError('Please enter email.')
      return
    }
    if (!emailRegex.test(email)) {
      setForgotError('Please enter a valid email.')
      return
    }
    const users = getAllUsers()
    const exists = users.some((u) => String(u?.email || '').toLowerCase() === email)
    if (!exists) {
      setForgotError('Account not found with this email.')
      return
    }

    const otp = buildOtp()
    setForgotGeneratedOtp(otp)
    setForgotOtpExpiresAt(Date.now() + 2 * 60 * 1000)
    setForgotStep('verify')
    setForgotForm((prev) => ({ ...prev, email, otp: '', newPassword: '', confirmPassword: '' }))
    setForgotSuccess(`OTP sent successfully. Demo OTP: ${otp}`)
  }

  const handleForgotVerifyOtp = () => {
    setForgotError('')
    setForgotSuccess('')
    if (!forgotForm.otp.trim()) {
      setForgotError('Please enter OTP.')
      return
    }
    if (!forgotOtpExpiresAt || Date.now() > forgotOtpExpiresAt) {
      setForgotError('OTP expired. Please resend OTP.')
      return
    }
    if (forgotForm.otp.trim() !== forgotGeneratedOtp) {
      setForgotError('Invalid OTP. Please try again.')
      return
    }
    setForgotStep('reset')
    setForgotSuccess('OTP verified. Now set your new password.')
  }

  const handleForgotPasswordSubmit = () => {
    setForgotError('')
    setForgotSuccess('')
    if (forgotStep !== 'reset') return

    const email = (forgotForm.email || '').trim().toLowerCase()
    if (!forgotForm.newPassword || !forgotForm.confirmPassword) {
      setForgotError('Please fill new password fields.')
      return
    }
    if (forgotForm.newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.')
      return
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setForgotError('New password and confirm password must match.')
      return
    }
    const result = updateUserPassword(email, forgotForm.newPassword)
    if (!result.ok) {
      setForgotError('Could not reset password. Try again.')
      return
    }
    setForgotForm({ email: '', otp: '', newPassword: '', confirmPassword: '' })
    setForgotGeneratedOtp('')
    setForgotOtpExpiresAt(null)
    setForgotStep('request')
    setForgotSuccess('Password reset successfully. Please login.')
    setSubmitError(null)
  }

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-shell">
          <div className="auth-hero">
            <div className="auth-badge">PIKAPLACE ACCESS</div>
            <h2 className="auth-title">Sign in or Join</h2>
            <p className="auth-subtitle">
              Admin manages products; customers explore and shop.
            </p>
            <ul className="auth-points">
              <li>Secure access for both roles</li>
              <li>Unified, elegant experience</li>
              <li>Theme-matched visuals</li>
            </ul>
          </div>
          <div className="auth-card">
            <div className="auth-tabs">
              <div className="tab-group">
                <button
                  className={`tab-pill ${actor === 'customer' ? 'active' : ''}`}
                  onClick={handleSelectCustomer}
                >
                  Customer
                </button>
                <button
                  className={`tab-pill ${actor === 'admin' ? 'active' : ''}`}
                  onClick={handleSelectAdmin}
                >
                  Admin
                </button>
              </div>
              <div className="tab-group">
                <button
                  className={`tab-pill ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => handleToggleMode('login')}
                >
                  Login
                </button>
                {!isAdmin && (
                  <button
                    className={`tab-pill ${mode === 'register' ? 'active' : ''}`}
                    onClick={() => handleToggleMode('register')}
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
            <div className="auth-body">
              <form key={formVersion} onSubmit={handleSubmit} autoComplete="off">
                {mode === 'register' ? (
                  <Input
                    label="Full Name"
                    name="name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={onChange}
                    error={errors.name}
                    autoComplete="off"
                  />
                ) : null}
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  error={errors.email}
                  autoComplete="off"
                />
                {mode === 'register' ? (
                  <Input
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    placeholder="98765 43210"
                    value={form.mobile}
                    onChange={onChange}
                    error={errors.mobile}
                    autoComplete="off"
                  />
                ) : null}
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  error={errors.password}
                  autoComplete="new-password"
                />
                {mode === 'register' ? (
                  <Input
                    label="Confirm Password"
                    name="confirm"
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={onChange}
                    error={errors.confirm}
                    autoComplete="new-password"
                  />
                ) : null}
                {submitError && (
                  <div
                    className="error-message"
                    style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}
                  >
                    {submitError}
                  </div>
                )}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading
                    ? 'Processing...'
                    : mode === 'login'
                      ? isAdmin
                        ? 'Admin Login'
                        : 'Customer Login'
                      : 'Customer Register'}
                </button>
                {!isAdmin && mode === 'login' && (
                  <button
                    type="button"
                    className="link-btn auth-forgot-toggle"
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
                      setForgotError('')
                      setForgotSuccess('')
                    }}
                  >
                    {showForgotPassword ? 'Hide forgot password' : 'Forgot Password?'}
                  </button>
                )}
                {!isAdmin && mode === 'login' && showForgotPassword && (
                  <div className="auth-forgot-box">
                    <div className="auth-forgot-step">
                      {forgotStep === 'request'
                        ? 'Step 1: Enter Email'
                        : forgotStep === 'verify'
                          ? 'Step 2: Verify OTP'
                          : 'Step 3: Reset Password'}
                    </div>
                    <label className="field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={forgotForm.email}
                        onChange={(e) =>
                          setForgotForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="you@example.com"
                        disabled={forgotStep !== 'request'}
                      />
                    </label>
                    {forgotStep !== 'request' && (
                      <label className="field">
                        <span>OTP (6-digit)</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={forgotForm.otp}
                          onChange={(e) =>
                            setForgotForm((prev) => ({
                              ...prev,
                              otp: e.target.value.replace(/\D/g, '').slice(0, 6),
                            }))
                          }
                          placeholder="Enter OTP"
                        />
                      </label>
                    )}
                    {forgotStep === 'reset' && (
                      <>
                        <label className="field">
                          <span>New Password</span>
                          <input
                            type="password"
                            value={forgotForm.newPassword}
                            onChange={(e) =>
                              setForgotForm((prev) => ({ ...prev, newPassword: e.target.value }))
                            }
                            placeholder="Enter new password"
                          />
                        </label>
                        <label className="field">
                          <span>Confirm New Password</span>
                          <input
                            type="password"
                            value={forgotForm.confirmPassword}
                            onChange={(e) =>
                              setForgotForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                            }
                            placeholder="Repeat new password"
                          />
                        </label>
                      </>
                    )}
                    {forgotError ? <div className="error">{forgotError}</div> : null}
                    {forgotSuccess ? <div className="success">{forgotSuccess}</div> : null}
                    {forgotStep === 'verify' && forgotOtpSecondsLeft > 0 && (
                      <div className="auth-otp-timer">OTP valid for {forgotOtpSecondsLeft}s</div>
                    )}
                    {forgotStep === 'request' && (
                      <button type="button" className="submit-btn" onClick={handleForgotSendOtp}>
                        Send OTP
                      </button>
                    )}
                    {forgotStep === 'verify' && forgotOtpSecondsLeft === 0 && (
                      <button type="button" className="link-btn" onClick={handleForgotSendOtp}>
                        Resend OTP
                      </button>
                    )}
                    {forgotStep === 'verify' && (
                      <button type="button" className="submit-btn" onClick={handleForgotVerifyOtp}>
                        Verify OTP
                      </button>
                    )}
                    {forgotStep === 'reset' && (
                      <button
                        type="button"
                        className="submit-btn"
                        onClick={handleForgotPasswordSubmit}
                      >
                        Reset Password
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
            <div className="auth-footer">
              {!isAdmin && (
                <>
                  <span>
                    {mode === 'login'
                      ? "Don't have an account?"
                      : 'Already have an account?'}
                  </span>
                  <button
                    className="link-btn"
                    onClick={() =>
                      handleToggleMode(mode === 'login' ? 'register' : 'login')
                    }
                  >
                    {mode === 'login' ? 'Register' : 'Login'} now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

