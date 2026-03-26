import { useEffect, useMemo, useState } from 'react'
<<<<<<< Updated upstream:src/pages/Checkout.jsx
import { useLocation, useNavigate } from 'react-router-dom'
=======
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
>>>>>>> Stashed changes:src/pages/CheckoutPayPal.jsx
import { jsPDF } from 'jspdf'

import Navbar from '../components/Navbar.jsx'
<<<<<<< Updated upstream:src/pages/Checkout.jsx
import { getCart, getCurrentUser, getOrders, setCart, setOrders } from '../utils/session.js'
=======
import { apiFetch } from '../api/apiClient.js'
>>>>>>> Stashed changes:src/pages/CheckoutPayPal.jsx
import './Checkout.css'

const steps = ['Product', 'Delivery', 'Details', 'Payment']

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function getInitialProduct(locationState) {
  if (locationState?.product) return locationState.product
  try {
    const raw = localStorage.getItem('selectedProduct')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export default function CheckoutPayPal() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const product = useMemo(() => getInitialProduct(location.state), [location.state])
  const [activeStep, setActiveStep] = useState(0)

  const initialQuantity = useMemo(() => {
    const q = Number(location.state?.initialQuantity)
    return Number.isFinite(q) ? Math.max(1, Math.floor(q)) : 1
  }, [location.state])

  const [form, setForm] = useState({
    quantity: initialQuantity,
    addressLine: '',
    state: '',
    city: '',
    pin: '',
    fullName: '',
    mobile: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

<<<<<<< Updated upstream:src/pages/Checkout.jsx
  const product = useMemo(() => getInitialProduct(location.state), [location.state])
  const initialQuantity = useMemo(() => {
    const q = Number(location.state?.initialQuantity)
    return Number.isFinite(q) ? Math.max(1, Math.floor(q)) : 1
  }, [location.state])

  const availableStock = useMemo(() => {
    if (!product?.id) return null
    try {
      const raw = localStorage.getItem('products')
      if (!raw) return null
      const list = JSON.parse(raw)
      if (!Array.isArray(list)) return null
      const match = list.find((p) => p.id === product.id)
      const value = Number(match?.available)
      if (!Number.isFinite(value) || value < 0) return null
      return Math.floor(value)
    } catch {
      return null
    }
  }, [product])

  useEffect(() => {
    setForm((prev) => ({ ...prev, quantity: initialQuantity }))
  }, [initialQuantity])

  const cityOptions = useMemo(() => {
    const selected = form.state
    return selected ? INDIA_STATE_CITY[selected] || [] : []
  }, [form.state])
=======
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // When PayPal redirects back, it appends `token` and we use it to capture.
  useEffect(() => {
    const payment = searchParams.get('payment')
    const paypalToken = searchParams.get('token') || searchParams.get('paypalOrderId')
    if (payment !== 'success' || !paypalToken) return

    let cancelled = false
    const run = async () => {
      try {
        setBusy(true)
        setSubmitError('')
        const result = await apiFetch('/api/orders/paypal/capture', {
          method: 'POST',
          body: { paypalOrderId: paypalToken },
        })
        if (cancelled) return
        const order = result?.order
        if (!order) throw new Error('Capture failed (missing order).')

        // Best-effort cart cleanup (only clears the cart product if we stored it).
        try {
          const metaRaw = localStorage.getItem('pikaplace:lastCheckoutMeta')
          const meta = metaRaw ? JSON.parse(metaRaw) : null
          if (meta?.fromCartProductId) {
            await apiFetch(`/api/cart/items/${meta.fromCartProductId}`, { method: 'DELETE' })
          }
        } catch {
          // ignore cleanup errors
        } finally {
          localStorage.removeItem('pikaplace:lastCheckoutMeta')
        }

        downloadInvoicePdf(order)
        navigate('/orders', { replace: true })
      } catch (e) {
        if (cancelled) return
        setSubmitError(e?.message || 'Payment capture failed.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    }
    run()

    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  useEffect(() => {
    // Keep quantity synced if the user changed route state.
    setForm((prev) => ({ ...prev, quantity: initialQuantity }))
  }, [initialQuantity])
>>>>>>> Stashed changes:src/pages/CheckoutPayPal.jsx

  if (!product) {
    navigate('/product')
    return null
  }

  const quantity = Number(form.quantity) || 1
  const unitPrice = Number(product.priceValue || 0) // treated as USD in backend
  const subtotal = unitPrice * quantity
  const tax = Math.round(subtotal * 0.1) // matches your frontend logic; backend uses USD decimals
  const total = subtotal + tax

  const buildAddressText = () => {
    const parts = [form.addressLine?.trim(), form.city?.trim(), form.state?.trim()]
    const pinText = form.pin ? `PIN ${form.pin}` : ''
    return [...parts, pinText].filter(Boolean).join(', ')
  }

  const validateStep = (stepIndex) => {
    const nextErrors = {}
    if (stepIndex === 0) {
      const q = Number(form.quantity)
      if (!Number.isFinite(q) || q < 1 || !Number.isInteger(q)) {
        nextErrors.quantity = 'Quantity must be a whole number (min 1).'
      }
    }
    if (stepIndex === 1) {
      if (!form.addressLine.trim() || form.addressLine.trim().length < 8) {
        nextErrors.addressLine = 'Please enter your address (min 8 characters).'
      }
      if (!form.state) nextErrors.state = 'Please select a state.'
      if (!form.city) nextErrors.city = 'Please select a city.'
      const pin = digitsOnly(form.pin)
      if (pin.length !== 6) nextErrors.pin = 'PIN code must be 6 digits.'
    }
    if (stepIndex === 2) {
      if (!form.fullName.trim() || form.fullName.trim().length < 2) {
        nextErrors.fullName = 'Please enter your full name.'
      }
      if (digitsOnly(form.mobile).length !== 10) {
        nextErrors.mobile = 'Mobile number must be 10 digits.'
      }
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        nextErrors.email = 'Please enter a valid email address.'
      }
    }
    // Step 3 payment is not validated (sandbox payment is handled after redirect).
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function downloadInvoicePdf(order) {
    const doc = new jsPDF()
    const invoiceNo = `PKP-${Date.now()}`
    const invoiceDate = new Date().toLocaleString('en-IN')

    const left = 14
    let y = 16

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('PIKAPLACE', left, y)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Invoice / Bill', left, (y += 8))

    y += 6
    doc.setFontSize(10)
    doc.text(`Invoice No: ${invoiceNo}`, left, y)
    doc.text(`Date: ${invoiceDate}`, 140, y)

    y += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Customer details', left, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    y += 6

    const customer = order?.customer || {}
    const addressText = order?.addressText || buildAddressText()

    doc.text(`Name: ${customer.fullName || '-'}`, left, y)
    y += 5
    doc.text(`Mobile: ${digitsOnly(customer.mobile) || '-'}`, left, y)
    y += 5
    doc.text(`Email: ${customer.email || '-'}`, left, y)
    y += 5
    doc.text(`Delivery address: ${addressText || '-'}`, left, y)

    y += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Order items', left, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    y += 7

    const col1 = left
    const col2 = 120
    const col3 = 145
    const col4 = 175

    doc.setFont('helvetica', 'bold')
    doc.text('Item', col1, y)
    doc.text('Unit', col2, y, { align: 'right' })
    doc.text('Qty', col3, y, { align: 'right' })
    doc.text('Amount', col4, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    y += 4

    doc.line(left, y, 196, y)
    y += 6

    const items = order?.items || []
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const itemName = it?.product?.name || product.name || 'Product'
      const unit = it?.product?.priceValue || unitPrice
      const qty = it?.quantity || 1
      const amount = it?.amount || unit * qty

      doc.text(String(itemName), col1, y)
      doc.text(formatInr(unit), col2, y, { align: 'right' })
      doc.text(String(qty), col3, y, { align: 'right' })
      doc.text(formatInr(amount), col4, y, { align: 'right' })
      y += 6
    }

    y += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Subtotal', col3, y, { align: 'right' })
    doc.text(formatInr(order?.subtotal || subtotal), col4, y, { align: 'right' })
    y += 6
    doc.text('Tax (10%)', col3, y, { align: 'right' })
    doc.text(formatInr(order?.tax || tax), col4, y, { align: 'right' })
    y += 6
    doc.text('Total', col3, y, { align: 'right' })
    doc.text(formatInr(order?.total || total), col4, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    y += 14
    doc.setFontSize(9)
    doc.text('Thank you for shopping with PIKAPLACE.', left, y)
    doc.save(`${invoiceNo}.pdf`)
  }

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0))

<<<<<<< Updated upstream:src/pages/Checkout.jsx
  const setQuantitySafe = (nextValue) => {
    const parsed = Number(nextValue)
    const safe = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1
    setField('quantity', safe)
  }

  const validateStep = (stepIndex) => {
    const nextErrors = {}

    if (stepIndex === 0) {
      const q = Number(form.quantity)
      if (!Number.isFinite(q) || q < 1 || !Number.isInteger(q)) {
        nextErrors.quantity = 'Quantity must be a whole number (min 1).'
      } else if (Number.isFinite(availableStock) && q > availableStock) {
        nextErrors.quantity = `Available quantity is ${availableStock}; you cannot order more than this.`
      }
    }

    if (stepIndex === 1) {
      if (!form.addressLine.trim() || form.addressLine.trim().length < 8) {
        nextErrors.addressLine = 'Please enter your address (min 8 characters).'
      }
      if (!form.state) nextErrors.state = 'Please select a state.'
      if (!form.city) nextErrors.city = 'Please select a city.'
      const pin = digitsOnly(form.pin)
      if (pin.length !== 6) nextErrors.pin = 'PIN code must be 6 digits.'
    }

    if (stepIndex === 2) {
      if (!form.fullName.trim() || form.fullName.trim().length < 2) {
        nextErrors.fullName = 'Please enter your full name.'
      }
      const phone = digitsOnly(form.mobile)
      if (phone.length !== 10) {
        nextErrors.mobile = 'Mobile number must be 10 digits.'
      }
      if (!emailRegex.test(form.email.trim())) {
        nextErrors.email = 'Please enter a valid email address.'
      }
    }

    // Step 4 (Payment) validation removed as requested.

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
=======
  const handleNext = async () => {
>>>>>>> Stashed changes:src/pages/CheckoutPayPal.jsx
    if (!validateStep(activeStep)) return

    // Confirm Order -> create PayPal order and redirect to approval UI.
    if (activeStep === steps.length - 1) {
<<<<<<< Updated upstream:src/pages/Checkout.jsx
      const user = getCurrentUser()
      const email = user?.email

      if (email) {
        const addressText = buildAddressText()
        const orderId = `PKP-${Date.now()}`
        const items = [
          {
            product,
            quantity,
            unitPrice,
            amount: basePrice,
          },
        ]
        const order = {
          id: orderId,
          createdAt: new Date().toISOString(),
          email,
          items,
          subtotal: basePrice,
          tax,
          total,
          addressText,
          customer: {
            fullName: form.fullName,
            mobile: digitsOnly(form.mobile),
            email: form.email,
          },
        }
        const existing = getOrders(email)
        setOrders(email, [order, ...existing])

        const fromCartItemId = location.state?.fromCartItemId
        if (fromCartItemId) {
          const cart = getCart(email)
          setCart(email, cart.filter((c) => c.id !== fromCartItemId))
        }
      }

      downloadInvoicePdf()
      navigate('/orders')
=======
      try {
        setBusy(true)
        setSubmitError('')

        // Store minimal meta so we can clear cart on return.
        try {
          localStorage.setItem(
            'pikaplace:lastCheckoutMeta',
            JSON.stringify({ fromCartProductId: location.state?.fromCartProductId || null }),
          )
        } catch {
          // ignore
        }

        const payload = {
          productId: product.id,
          quantity,
          shipping: {
            addressLine: form.addressLine,
            state: form.state,
            city: form.city,
            pin: digitsOnly(form.pin).slice(0, 6),
          },
          customer: {
            fullName: form.fullName,
            mobile: digitsOnly(form.mobile).slice(0, 10),
            email: form.email.trim(),
          },
        }

        const created = await apiFetch('/api/orders/paypal/create', { method: 'POST', body: payload })
        const approvalUrl = created?.approvalUrl
        if (!approvalUrl) throw new Error('PayPal approval URL missing.')
        window.location.href = approvalUrl
      } catch (e) {
        setSubmitError(e?.message || 'Failed to create PayPal order.')
      } finally {
        setBusy(false)
      }
>>>>>>> Stashed changes:src/pages/CheckoutPayPal.jsx
      return
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  return (
    <>
      <Navbar />
      <main className="checkout-page">
        <section className="checkout-inner">
          <div className="checkout-steps">
            {steps.map((label, index) => {
              const done = index < activeStep
              const current = index === activeStep
              return (
                <div key={label} className="checkout-step">
                  <div
                    className={[
                      'checkout-step-circle',
                      done ? 'checkout-step-circle--done' : '',
                      current ? 'checkout-step-circle--current' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {done ? '✓' : index + 1}
                  </div>
                  <span
                    className={[
                      'checkout-step-label',
                      current ? 'checkout-step-label--current' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="checkout-layout">
            <section className="checkout-main-card">
              <h2 className="checkout-title">Selected Watch</h2>
              <div className="checkout-product-card">
                <div className="checkout-product-image-shell">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="checkout-product-body">
                  <h3 className="checkout-product-name">{product.name}</h3>
                  <p className="checkout-product-category">{product.category}</p>
                  <p className="checkout-product-specs">{product.specs}</p>
                  <p className="checkout-product-price">
                    ₹{unitPrice.toLocaleString('en-IN')} <span className="checkout-product-price-unit">/piece</span>
                  </p>
                  <p className="checkout-product-specs">
                    Quantity: {quantity} · Subtotal: ₹{subtotal.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="checkout-form-area">
                {activeStep === 0 && (
                  <div className="checkout-section">
                    <h3 className="checkout-section-title">Quantity</h3>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.quantity ? 'checkout-field--error' : ''}`}>
                        <span>Pieces</span>
                        <div className="checkout-qty">
                          <button
                            type="button"
                            className="checkout-qty-btn"
                            aria-label="Decrease quantity"
                            onClick={() => handleChange('quantity', Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                          />
                          <button
                            type="button"
                            className="checkout-qty-btn"
                            aria-label="Increase quantity"
                            onClick={() => handleChange('quantity', quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        {errors.quantity && <small className="checkout-error">{errors.quantity}</small>}
                      </label>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="checkout-section">
                    <h3 className="checkout-section-title">Delivery</h3>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.addressLine ? 'checkout-field--error' : ''}`}>
                        <span>Address line</span>
                        <input
                          type="text"
                          placeholder="House no, street, area, landmark"
                          value={form.addressLine}
                          onChange={(e) => handleChange('addressLine', e.target.value)}
                        />
                        {errors.addressLine && <small className="checkout-error">{errors.addressLine}</small>}
                      </label>
                    </div>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.state ? 'checkout-field--error' : ''}`}>
                        <span>State</span>
                        <input
                          type="text"
                          placeholder="State"
                          value={form.state}
                          onChange={(e) => handleChange('state', e.target.value)}
                        />
                        {errors.state && <small className="checkout-error">{errors.state}</small>}
                      </label>
                      <label className={`checkout-field ${errors.city ? 'checkout-field--error' : ''}`}>
                        <span>City</span>
                        <input
                          type="text"
                          placeholder="City"
                          value={form.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                        />
                        {errors.city && <small className="checkout-error">{errors.city}</small>}
                      </label>
                    </div>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.pin ? 'checkout-field--error' : ''}`}>
                        <span>PIN code</span>
                        <input
                          type="text"
                          placeholder="6-digit PIN"
                          inputMode="numeric"
                          value={form.pin}
                          onChange={(e) => handleChange('pin', digitsOnly(e.target.value).slice(0, 6))}
                        />
                        {errors.pin && <small className="checkout-error">{errors.pin}</small>}
                      </label>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="checkout-section">
                    <h3 className="checkout-section-title">Your details</h3>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.fullName ? 'checkout-field--error' : ''}`}>
                        <span>Full name</span>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={form.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                        />
                        {errors.fullName && <small className="checkout-error">{errors.fullName}</small>}
                      </label>
                    </div>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.mobile ? 'checkout-field--error' : ''}`}>
                        <span>Mobile number</span>
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          inputMode="numeric"
                          value={form.mobile}
                          onChange={(e) => handleChange('mobile', digitsOnly(e.target.value).slice(0, 10))}
                        />
                        {errors.mobile && <small className="checkout-error">{errors.mobile}</small>}
                      </label>
                      <label className={`checkout-field ${errors.email ? 'checkout-field--error' : ''}`}>
                        <span>Email</span>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {errors.email && <small className="checkout-error">{errors.email}</small>}
                      </label>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="checkout-section">
                    <h3 className="checkout-section-title">Payment</h3>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.cardNumber ? 'checkout-field--error' : ''}`}>
                        <span>Card number</span>
                        <input
                          type="text"
                          placeholder="XXXX XXXX XXXX XXXX"
                          inputMode="numeric"
                          value={form.cardNumber}
                          onChange={(e) => handleChange('cardNumber', e.target.value)}
                        />
                      </label>
                      <label className={`checkout-field ${errors.expiry ? 'checkout-field--error' : ''}`}>
                        <span>Expiry</span>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={form.expiry}
                          onChange={(e) => handleChange('expiry', e.target.value)}
                        />
                      </label>
                      <label className={`checkout-field ${errors.cvv ? 'checkout-field--error' : ''}`}>
                        <span>CVV</span>
                        <input
                          type="password"
                          placeholder="***"
                          inputMode="numeric"
                          value={form.cvv}
                          onChange={(e) => handleChange('cvv', e.target.value)}
                        />
                      </label>
                    </div>
                    {submitError ? <p className="review-error" style={{ marginTop: 10 }}>{submitError}</p> : null}
                  </div>
                )}

                <div className="checkout-actions">
                  <button
                    type="button"
                    className="checkout-secondary-btn"
                    onClick={handleBack}
                    disabled={activeStep === 0 || busy}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="checkout-primary-btn"
                    onClick={handleNext}
                    disabled={busy}
                  >
                    {busy ? 'Processing...' : activeStep === steps.length - 1 ? 'Pay with PayPal' : 'Continue'}
                  </button>
                </div>
              </div>
            </section>

            <aside className="checkout-summary-card">
              <h2 className="checkout-summary-title">Order summary</h2>
              <div className="checkout-summary-product">
                <div className="checkout-summary-thumb">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="checkout-summary-info">
                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                </div>
              </div>
              <div className="checkout-summary-breakdown">
                <div className="checkout-summary-row">
                  <span>Watch price (×{quantity})</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="checkout-summary-row checkout-summary-row--total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}

