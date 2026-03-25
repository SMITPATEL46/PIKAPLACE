import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import Navbar from '../components/Navbar.jsx'
import { getCart, getCurrentUser, getOrders, setCart, setOrders } from '../utils/session.js'
import './Checkout.css'

const steps = ['Product', 'Delivery', 'Details', 'Payment']

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const digitsOnly = (value) => (value || '').replace(/\D/g, '')

const INDIA_STATE_CITY = {
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Silvassa', 'Diu'],
  Delhi: ['New Delhi', 'Delhi'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal'],
  'Himachal Pradesh': ['Shimla', 'Solan', 'Dharamshala', 'Mandi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
  Manipur: ['Imphal'],
  Meghalaya: ['Shillong'],
  Mizoram: ['Aizawl'],
  Nagaland: ['Kohima', 'Dimapur'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'],
  Puducherry: ['Puducherry', 'Karaikal'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  Sikkim: ['Gangtok'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  Tripura: ['Agartala'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Ghaziabad', 'Noida'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee'],
  'West Bengal': ['Kolkata', 'Siliguri', 'Durgapur', 'Asansol'],
}

const INDIA_STATES = Object.keys(INDIA_STATE_CITY).sort((a, b) => a.localeCompare(b))

const isValidExpiry = (value) => {
  const raw = (value || '').trim()
  const match = raw.match(/^(\d{2})\s*\/\s*(\d{2})$/)
  if (!match) return false
  const mm = Number(match[1])
  const yy = Number(match[2])
  if (mm < 1 || mm > 12) return false
  const now = new Date()
  const fullYear = 2000 + yy
  const exp = new Date(fullYear, mm, 1) // first day of month after expiry month
  return exp > now
}

const isValidCardNumber = (value) => {
  const num = digitsOnly(value)
  if (num.length < 13 || num.length > 19) return false
  // Luhn check
  let sum = 0
  let doubleIt = false
  for (let i = num.length - 1; i >= 0; i -= 1) {
    let digit = Number(num[i])
    if (doubleIt) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    doubleIt = !doubleIt
  }
  return sum % 10 === 0
}

const getInitialProduct = (locationState) => {
  if (locationState?.product) return locationState.product
  try {
    const raw = localStorage.getItem('selectedProduct')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    quantity: 1,
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

  if (!product) {
    navigate('/product')
    return null
  }

  const quantity = Number(form.quantity) || 1
  const unitPrice = product.priceValue || 0
  const basePrice = unitPrice * quantity
  const tax = Math.round(basePrice * 0.1)
  const total = basePrice + tax

  const buildAddressText = () => {
    const parts = [
      form.addressLine?.trim(),
      form.city?.trim(),
      form.state?.trim(),
      form.pin ? `PIN ${form.pin}` : '',
    ].filter(Boolean)
    return parts.join(', ')
  }

  const downloadInvoicePdf = () => {
    const doc = new jsPDF()

    const invoiceNo = `PKP-${Date.now()}`
    const invoiceDate = new Date().toLocaleString('en-IN')
    const addressText = buildAddressText()

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
    doc.text(`Name: ${form.fullName || '-'}`, left, y)
    y += 5
    doc.text(`Mobile: ${digitsOnly(form.mobile) || '-'}`, left, y)
    y += 5
    doc.text(`Email: ${form.email || '-'}`, left, y)
    y += 5
    doc.text(`Delivery address: ${addressText || '-'}`, left, y)

    y += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Order items', left, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    y += 7

    // simple table
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

    const itemName = product?.name || 'Product'
    const unit = unitPrice
    const qty = quantity
    const amount = basePrice

    doc.text(String(itemName), col1, y)
    doc.text(formatInr(unit), col2, y, { align: 'right' })
    doc.text(String(qty), col3, y, { align: 'right' })
    doc.text(formatInr(amount), col4, y, { align: 'right' })

    y += 10
    doc.line(left, y, 196, y)
    y += 7

    doc.text('Subtotal', col3, y, { align: 'right' })
    doc.text(formatInr(basePrice), col4, y, { align: 'right' })
    y += 6
    doc.text('Tax (10%)', col3, y, { align: 'right' })
    doc.text(formatInr(tax), col4, y, { align: 'right' })
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Total', col3, y, { align: 'right' })
    doc.text(formatInr(total), col4, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    y += 14
    doc.setFontSize(9)
    doc.text('Thank you for shopping with PIKAPLACE.', left, y)

    doc.save(`${invoiceNo}.pdf`)
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }

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
    if (!validateStep(activeStep)) return

    if (activeStep === steps.length - 1) {
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
      return
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0))
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
                    ₹{unitPrice.toLocaleString('en-IN')}{' '}
                    <span className="checkout-product-price-unit">/piece</span>
                  </p>
                  <p className="checkout-product-specs">
                    Quantity: {quantity} · Subtotal: ₹{basePrice.toLocaleString('en-IN')}
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
                            onClick={() => setQuantitySafe(quantity - 1)}
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => setQuantitySafe(e.target.value)}
                          />
                          <button
                            type="button"
                            className="checkout-qty-btn"
                            aria-label="Increase quantity"
                            onClick={() => setQuantitySafe(quantity + 1)}
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
                      <label className={`checkout-field ${errors.state ? 'checkout-field--error' : ''}`}>
                        <span>State</span>
                        <select
                          value={form.state}
                          onChange={(e) => {
                            const nextState = e.target.value
                            setForm((prev) => ({ ...prev, state: nextState, city: '' }))
                            setErrors((prev) => {
                              const copy = { ...prev }
                              delete copy.state
                              delete copy.city
                              return copy
                            })
                          }}
                        >
                          <option value="">Select state</option>
                          {INDIA_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {errors.state && <small className="checkout-error">{errors.state}</small>}
                      </label>
                      <label className={`checkout-field ${errors.city ? 'checkout-field--error' : ''}`}>
                        <span>City</span>
                        <select
                          value={form.city}
                          onChange={(e) => setField('city', e.target.value)}
                          disabled={!form.state}
                        >
                          <option value="">{form.state ? 'Select city' : 'Select state first'}</option>
                          {cityOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
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
                          onChange={(e) => setField('pin', digitsOnly(e.target.value).slice(0, 6))}
                        />
                        {errors.pin && <small className="checkout-error">{errors.pin}</small>}
                      </label>
                    </div>
                    <div className="checkout-field-row">
                      <label
                        className={`checkout-field ${errors.addressLine ? 'checkout-field--error' : ''}`}
                      >
                        <span>Address line</span>
                        <input
                          type="text"
                          placeholder="House no, street, area, landmark"
                          value={form.addressLine}
                          onChange={(e) => setField('addressLine', e.target.value)}
                        />
                        {errors.addressLine && (
                          <small className="checkout-error">{errors.addressLine}</small>
                        )}
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
                          onChange={(e) => setField('fullName', e.target.value)}
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
                          onChange={(e) => setField('mobile', e.target.value)}
                        />
                        {errors.mobile && <small className="checkout-error">{errors.mobile}</small>}
                      </label>
                      <label className={`checkout-field ${errors.email ? 'checkout-field--error' : ''}`}>
                        <span>Email</span>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setField('email', e.target.value)}
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
                          onChange={(e) => setField('cardNumber', e.target.value)}
                        />
                        {errors.cardNumber && (
                          <small className="checkout-error">{errors.cardNumber}</small>
                        )}
                      </label>
                    </div>
                    <div className="checkout-field-row">
                      <label className={`checkout-field ${errors.expiry ? 'checkout-field--error' : ''}`}>
                        <span>Expiry</span>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={form.expiry}
                          onChange={(e) => setField('expiry', e.target.value)}
                        />
                        {errors.expiry && <small className="checkout-error">{errors.expiry}</small>}
                      </label>
                      <label className={`checkout-field ${errors.cvv ? 'checkout-field--error' : ''}`}>
                        <span>CVV</span>
                        <input
                          type="password"
                          placeholder="***"
                          inputMode="numeric"
                          value={form.cvv}
                          onChange={(e) => setField('cvv', e.target.value)}
                        />
                        {errors.cvv && <small className="checkout-error">{errors.cvv}</small>}
                      </label>
                    </div>
                  </div>
                )}

                <div className="checkout-actions">
                  <button
                    type="button"
                    className="checkout-secondary-btn"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="checkout-primary-btn"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Confirm Order' : 'Continue'}
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
                  <span>₹{basePrice.toLocaleString('en-IN')}</span>
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

export default Checkout

