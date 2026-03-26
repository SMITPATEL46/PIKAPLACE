import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
<<<<<<< Updated upstream
import { getCurrentUser, getOrders } from '../utils/session.js'
=======
import { apiFetch } from '../api/apiClient.js'
import { getCurrentUser } from '../utils/session.js'
>>>>>>> Stashed changes
import './Orders.css'

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

export default function Orders() {
  const user = getCurrentUser()
<<<<<<< Updated upstream
  const email = user?.email

  const [orders, setOrders] = useState(() => (email ? getOrders(email) : []))

  useEffect(() => {
    if (!email) return

    const reload = () => setOrders(getOrders(email))
    reload()

    window.addEventListener('storage', reload)
    window.addEventListener('pikaplace-orders', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('pikaplace-orders', reload)
    }
  }, [email])
=======
  const phoneNumber = user?.phone_number
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let cancelled = false
    const reload = async () => {
      try {
        const data = await apiFetch('/api/orders')
        if (cancelled) return
        setOrders(data?.items || [])
      } catch {
        if (!cancelled) setOrders([])
      }
    }
    reload()
    window.addEventListener('storage', reload)
    window.addEventListener('pikaplace-orders', reload)
    return () => {
      cancelled = true
      window.removeEventListener('storage', reload)
      window.removeEventListener('pikaplace-orders', reload)
    }
  }, [user?.id])
>>>>>>> Stashed changes

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
  }, [orders])

  return (
    <>
      <Navbar />
      <main className="orders-page">
        <section className="orders-inner">
          <div className="orders-head">
            <h2>Your Orders</h2>
<<<<<<< Updated upstream
            <p className="orders-muted">Past order history for {email}</p>
=======
              <p className="orders-muted">Past order history for {phoneNumber}</p>
>>>>>>> Stashed changes
          </div>

          {sorted.length === 0 ? (
            <div className="orders-empty">
              <p>No orders yet.</p>
              <p className="orders-muted">Place an order from Product or Cart and it will show here.</p>
            </div>
          ) : (
            <div className="orders-list">
              {sorted.map((o) => (
                <article key={o.id} className="order-card">
                  <div className="order-top">
                    <div>
                      <div className="order-id">Order {o.id}</div>
                      <div className="orders-muted">
                        {o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : ''}
                      </div>
                    </div>
                    <div className="order-total">{formatInr(o.total)}</div>
                  </div>

                  <div className="order-items">
                    {(o.items || []).map((it, idx) => (
                      <div key={`${o.id}_${idx}`} className="order-item">
                        <div className="order-item-media">
                          <img
                            src={it?.product?.image}
                            alt={it?.product?.name || 'Product'}
                            loading="lazy"
                          />
                        </div>
                        <div className="order-item-body">
                          <div className="order-item-name">{it?.product?.name || 'Product'}</div>
                          <div className="orders-muted">{it?.product?.category || ''}</div>
                        </div>
                        <div className="order-item-meta">
                          <div>
                            <span className="orders-muted">Qty</span>
                            <div className="order-strong">{it?.quantity || 1}</div>
                          </div>
                          <div>
                            <span className="orders-muted">Amount</span>
                            <div className="order-strong">{formatInr(it?.amount)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {o.addressText ? (
                    <div className="order-foot">
                      <div className="orders-muted">Delivery</div>
                      <div className="order-address">{o.addressText}</div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

