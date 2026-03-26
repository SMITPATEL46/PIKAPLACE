import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { signInWithPhoneNumber } from 'firebase/auth'

import Navbar from '../components/Navbar.jsx'
import { auth, getRecaptchaVerifier } from '../firebase/firebaseClient'
import { apiFetchNoAuth } from '../utils/apiNoAuth.js'
import './Auth.css'

const normalizePhone = (raw) => String(raw || '').replace(/\s+/g, '')

export default function AuthPhone() {
  const navigate = useNavigate()
  const location = useLocation()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)

  const [step, setStep] = useState('phone') // phone | otp
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = location.state?.redirectTo
  const redirectState = location.state?.redirectState

  const canSendOtp = useMemo(() => normalizePhone(phone).length >= 10, [phone])

  useEffect(() => {
    // Reset auth form on open (and if user navigates back after logout).
    setPhone('')
    setOtp('')
    setConfirmationResult(null)
    setStep('phone')
    setLoading(false)
    setError('')
  }, [])

  async function sendOtp() {
    setError('')
    const normalized = normalizePhone(phone)
    if (!normalized) {
      setError('Phone number is required.')
      return
    }

    try {
      setLoading(true)
      const verifier = getRecaptchaVerifier()
      const result = await signInWithPhoneNumber(auth, normalized, verifier)
      setConfirmationResult(result)
      setStep('otp')
    } catch (e) {
      setError(e?.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtpAndExchange() {
    setError('')
    if (!confirmationResult) {
      setError('OTP session not started. Please resend OTP.')
      return
    }

    const safeOtp = String(otp || '').replace(/\D/g, '').slice(0, 6)
    if (safeOtp.length !== 6) {
      setError('Enter the 6-digit OTP.')
      return
    }

    try {
      setLoading(true)
      const cred = await confirmationResult.confirm(safeOtp)
      const user = cred.user
      const idToken = await user.getIdToken()

      const exchanged = await apiFetchNoAuth('/api/auth/exchange', {
        method: 'POST',
        body: { idToken },
      })

      const appUser = exchanged.user
      // Keep localStorage.user for your existing route guard (`RequireCustomer`) and navbar.
      localStorage.setItem('user', JSON.stringify(appUser))
      try {
        window.dispatchEvent(new Event('pikaplace-user-changed'))
      } catch {
        // ignore
      }

      // Redirect handling: preserve the behavior of your current `Auth.jsx`.
      if (appUser.role === 'admin') {
        navigate('/admin', { replace: true })
        return
      }

      const isProductRedirect = typeof redirectTo === 'string' && redirectTo.startsWith('/product')
      if (isProductRedirect && redirectState?.action === 'buy') {
        const product = redirectState?.product
        if (product) {
          navigate('/checkout', { state: { product } })
          return
        }
      }

      if (isProductRedirect && redirectState?.action === 'addToCart') {
        const product = redirectState?.product
        if (product) {
          // Add to cart after successful login
          await apiFetchNoAuth('/api/cart/items', {
            method: 'POST',
            body: { productId: product.id, quantity: 1 },
            // Authorization is still handled by Firebase in `apiFetchNoAuth` because
            // we send the token from the current Firebase session.
            // (If your backend requires it, switch this call to a real auth-aware client.)
          })

          navigate('/cart')
          return
        }
      }

      if (typeof redirectTo === 'string' && redirectTo) {
        navigate(redirectTo, { state: redirectState })
        return
      }

      navigate('/product', { replace: true })
    } catch (e) {
      setError(e?.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-shell">
          <div className="auth-hero">
            <div className="auth-badge">PIKAPLACE ACCESS</div>
            <h2 className="auth-title">Login with Phone OTP</h2>
            <p className="auth-subtitle">Admin manages products. Customers explore and shop.</p>
            <ul className="auth-points">
              <li>Firebase Phone Auth OTP</li>
              <li>Secure server-side token exchange</li>
              <li>Role by phone number</li>
            </ul>

            {/* Firebase reCAPTCHA container */}
            <div id="recaptcha-container" />
          </div>

          <div className="auth-card">
            <div className="auth-tabs">
              <div className="tab-group">
                <button className={`tab-pill ${step === 'phone' ? 'active' : ''}`} onClick={() => setStep('phone')}>
                  Phone
                </button>
                <button
                  className={`tab-pill ${step === 'otp' ? 'active' : ''}`}
                  onClick={() => setStep('otp')}
                  disabled={!confirmationResult}
                  style={!confirmationResult ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                >
                  OTP
                </button>
              </div>
            </div>

            <div className="auth-body">
              {step === 'phone' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendOtp()
                  }}
                  autoComplete="off"
                >
                  <div className="field">
                    <label>Phone Number (E.164)</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+911234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="off"
                      inputMode="tel"
                    />
                    {error ? <div className="error">{error}</div> : null}
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading || !canSendOtp}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    verifyOtpAndExchange()
                  }}
                  autoComplete="off"
                >
                  <div className="field">
                    <label>OTP</label>
                    <input
                      name="otp"
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                    />
                    {error ? <div className="error">{error}</div> : null}
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setOtp('')
                      setStep('phone')
                      setConfirmationResult(null)
                    }}
                    disabled={loading}
                    style={{ marginTop: 10 }}
                  >
                    Change phone
                  </button>
                </form>
              )}
            </div>

            <div className="auth-footer">
              <span>After login, role is determined by your phone number in MySQL.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

