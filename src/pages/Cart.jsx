import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
<<<<<<< Updated upstream
import { getCart, getCurrentUser, setCart } from '../utils/session.js'
=======
import { apiFetch } from '../api/apiClient.js'
import { getCurrentUser } from '../utils/session.js'
>>>>>>> Stashed changes
import './Cart.css'

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

export default function Cart() {
  const navigate = useNavigate()
  const user = getCurrentUser()
<<<<<<< Updated upstream
  const email = user?.email

  const [items, setItems] = useState(() => (email ? getCart(email) : []))

  useEffect(() => {
    if (!email) return

    const reload = () => setItems(getCart(email))
    reload()

    window.addEventListener('storage', reload)
    window.addEventListener('pikaplace-cart', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('pikaplace-cart', reload)
    }
  }, [email])
=======
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    const reload = async () => {
      try {
        const data = await apiFetch('/api/cart')
        if (cancelled) return
        setItems(data?.items || [])
      } catch {
        if (!cancelled) setItems([])
      }
    }
    reload()
    window.addEventListener('storage', reload)
    window.addEventListener('pikaplace-cart', reload)
    return () => {
      cancelled = true
      window.removeEventListener('storage', reload)
      window.removeEventListener('pikaplace-cart', reload)
    }
  }, [user?.id])
>>>>>>> Stashed changes

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => {
      const unit = Number(i?.product?.priceValue) || 0
      const qty = Number(i?.quantity) || 1
      return sum + unit * qty
    }, 0)
    const tax = Math.round(subtotal * 0.1)
    return { subtotal, tax, total: subtotal + tax }
  }, [items])

<<<<<<< Updated upstream
  const updateQty = (cartItemId, nextQty) => {
    const safeQty = Number.isFinite(Number(nextQty)) ? Math.max(1, Math.floor(Number(nextQty))) : 1
    const next = items.map((i) => (i.id === cartItemId ? { ...i, quantity: safeQty } : i))
    setItems(next)
    if (email) setCart(email, next)
  }

  const removeItem = (cartItemId) => {
    const next = items.filter((i) => i.id !== cartItemId)
    setItems(next)
    if (email) setCart(email, next)
  }

  const clearCart = () => {
    setItems([])
    if (email) setCart(email, [])
=======
  const updateQty = async (cartItemId, nextQty) => {
    const safeQty = Number.isFinite(Number(nextQty)) ? Math.max(1, Math.floor(Number(nextQty))) : 1
    const item = items.find((i) => i.id === cartItemId)
    const productId = item?.product?.id
    if (!productId) return
    await apiFetch(`/api/cart/items/${productId}`, { method: 'PATCH', body: { quantity: safeQty } })
    window.dispatchEvent(new Event('pikaplace-cart'))
  }

  const removeItem = async (cartItemId) => {
    const item = items.find((i) => i.id === cartItemId)
    const productId = item?.product?.id
    if (!productId) return
    await apiFetch(`/api/cart/items/${productId}`, { method: 'DELETE' })
    window.dispatchEvent(new Event('pikaplace-cart'))
  }

  const clearCart = async () => {
    await Promise.all(
      items.map((i) => {
        const productId = i?.product?.id
        if (!productId) return Promise.resolve()
        return apiFetch(`/api/cart/items/${productId}`, { method: 'DELETE' }).catch(() => {})
      }),
    )
    window.dispatchEvent(new Event('pikaplace-cart'))
>>>>>>> Stashed changes
  }

  const handleCheckoutItem = (item) => {
    const product = item?.product
    if (!product) return
    try {
      localStorage.setItem('selectedProduct', JSON.stringify(product))
    } catch {
      // ignore
    }
<<<<<<< Updated upstream
    navigate('/checkout', { state: { product, initialQuantity: item?.quantity || 1, fromCartItemId: item?.id } })
=======
    navigate('/checkout', {
      state: { product, initialQuantity: item?.quantity || 1, fromCartProductId: product.id },
    })
>>>>>>> Stashed changes
  }

  return (
    <>
      <Navbar />
      <main className="cart-page">
        <section className="cart-inner">
          <div className="cart-head">
            <h2>Your Cart</h2>
            <div className="cart-head-actions">
              <button type="button" className="cart-link" onClick={() => navigate('/product')}>
                Continue shopping
              </button>
              {items.length > 0 && (
                <button type="button" className="cart-danger" onClick={clearCart}>
                  Clear cart
                </button>
              )}
            </div>
          </div>

          <div className="cart-layout">
            <section className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <p>Your cart is empty.</p>
                  <button type="button" className="cart-primary" onClick={() => navigate('/product')}>
                    Browse products
                  </button>
                </div>
              ) : (
                items.map((i) => (
                  <article key={i.id} className="cart-item">
                    <div className="cart-item-media">
                      <img src={i?.product?.image} alt={i?.product?.name || 'Product'} loading="lazy" />
                    </div>
                    <div className="cart-item-body">
                      <div className="cart-item-title">
                        <div>
                          <h3>{i?.product?.name || 'Product'}</h3>
                          <p className="cart-muted">{i?.product?.category || ''}</p>
                        </div>
                        <button type="button" className="cart-link" onClick={() => removeItem(i.id)}>
                          Remove
                        </button>
                      </div>

                      <div className="cart-item-row">
                        <div className="cart-qty">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQty(i.id, (Number(i.quantity) || 1) - 1)}
                            disabled={(Number(i.quantity) || 1) <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={Number(i.quantity) || 1}
                            onChange={(e) => updateQty(i.id, e.target.value)}
                          />
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQty(i.id, (Number(i.quantity) || 1) + 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item-price">
                          <span className="cart-muted">Unit</span>
                          <strong>{formatInr(i?.product?.priceValue)}</strong>
                        </div>

                        <div className="cart-item-price">
                          <span className="cart-muted">Amount</span>
                          <strong>
                            {formatInr((Number(i?.product?.priceValue) || 0) * (Number(i?.quantity) || 1))}
                          </strong>
                        </div>

                        <button type="button" className="cart-primary" onClick={() => handleCheckoutItem(i)}>
                          Checkout
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </section>

            <aside className="cart-summary">
              <h3>Summary</h3>
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatInr(totals.subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Tax (10%)</span>
                <span>{formatInr(totals.tax)}</span>
              </div>
              <div className="cart-summary-row cart-summary-row--total">
                <span>Total</span>
                <span>{formatInr(totals.total)}</span>
              </div>
              <p className="cart-muted cart-note">
                Note: Checkout currently completes one item at a time (open any item’s Checkout).
              </p>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}

