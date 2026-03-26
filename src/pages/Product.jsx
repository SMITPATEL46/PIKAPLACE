import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
<<<<<<< Updated upstream
import { addToCart, getCurrentUser } from '../utils/session.js'
=======
import { apiFetch } from '../api/apiClient.js'
import { getCurrentUser } from '../utils/session.js'
>>>>>>> Stashed changes
import './Product.css'

function Product() {
  const [products, setProducts] = useState([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('None')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const user = getCurrentUser()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    let cancelled = false

    const loadFromBackend = async () => {
      try {
        const data = await apiFetch('/api/products')

        if (cancelled) return

        if (Array.isArray(data?.items)) {
          setProducts(data.items)
        } else {
          setProducts([])
          setError('Invalid product data from server')
        }
      } catch (err) {
        console.error('Product fetch error:', err)
        if (!cancelled) {
          setError('Failed to load products')
          setProducts([]) // ❗ no fake fallback
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFromBackend()

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  )

  const priceFilters = [
    'All',
    'Under ₹4,000',
    '₹4,000 – ₹5,000',
    '₹5,000 – ₹6,000',
  ]

  const visibleProducts = useMemo(() => {
    let list =
      activeFilter === 'All'
        ? products
        : products.filter((p) => p.category === activeFilter)

    switch (priceFilter) {
      case 'Under ₹4,000':
        list = list.filter((p) => p.priceValue <= 4000)
        break
      case '₹4,000 – ₹5,000':
        list = list.filter(
          (p) => p.priceValue > 4000 && p.priceValue <= 5000,
        )
        break
      case '₹5,000 – ₹6,000':
        list = list.filter(
          (p) => p.priceValue > 5000 && p.priceValue <= 6000,
        )
        break
      default:
        break
    }

    if (sortOrder === 'Low to High') {
      list = [...list].sort((a, b) => a.priceValue - b.priceValue)
    } else if (sortOrder === 'High to Low') {
      list = [...list].sort((a, b) => b.priceValue - a.priceValue)
    }

    return list
  }, [products, activeFilter, priceFilter, sortOrder])

  // ✅ Loading UI
  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 20 }}>Loading products...</p>
      </>
    )
  }

  // ✅ Error UI
  if (error) {
    return (
      <>
        <Navbar />
        <p style={{ color: 'red', padding: 20 }}>{error}</p>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="product-page">
        <section className="product-page-inner">

          <div className="product-filters-selects">
            <div className="product-select-wrapper">
              <label className="product-select-label">Category</label>
              <select
                className="product-select"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="product-select-wrapper">
              <label className="product-select-label">Price</label>
              <select
                className="product-select"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                {priceFilters.map((pf) => (
                  <option key={pf}>{pf}</option>
                ))}
              </select>
            </div>

            <div className="product-select-wrapper">
              <label className="product-select-label">Sort</label>
              <select
                className="product-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="None">Default</option>
                <option value="Low to High">Price: Low to High</option>
                <option value="High to Low">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
<<<<<<< Updated upstream
            {visibleProducts.map((watch) => (
              <article key={watch.id} className="product-card">
                <button
                  type="button"
                  className="product-card-open"
                  onClick={() => navigate(`/product/${watch.id}`)}
                  aria-label={`Open ${watch.name} details`}
                >
                <div className="product-card-media">
                  <img src={watch.image} alt={watch.name} loading="lazy" />
                </div>
                <div className="product-card-body">
                  <p className="product-category">{watch.category}</p>
                  <h2 className="product-name">{watch.name}</h2>
                  <p className="product-specs">{watch.specs}</p>
                </div>
                </button>
                <div className="product-card-footer">
                  <div className="product-price-block">
                    <span className="product-price-label">Starting from</span>
                    <span className="product-price">
                      {watch.priceValue
                        ? `₹${watch.priceValue.toLocaleString('en-IN')}`
                        : '—'}
                    </span>
                  </div>
                  {!isAdmin && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="product-cta"
                        onClick={() => {
                          const current = getCurrentUser()
                          if (!current || current.role !== 'customer') {
                            navigate('/auth', {
                              state: { redirectTo: '/product', redirectState: { action: 'buy', product: watch } },
                            })
                            return
                          }
                          try {
                            localStorage.setItem('selectedProduct', JSON.stringify(watch))
                          } catch {
                            // ignore storage issues
                          }
                          navigate('/checkout', { state: { product: watch } })
                        }}
                      >
                        Buy Now →
                      </button>
                      <button
                        type="button"
                        className="product-cta"
                        style={{ background: 'white', color: '#111827', border: '1px solid rgba(0,0,0,0.12)' }}
                        onClick={() => {
                          const current = getCurrentUser()
                          if (!current || current.role !== 'customer') {
                            navigate('/auth', {
                              state: {
                                redirectTo: '/product',
                                redirectState: { action: 'addToCart', product: watch },
                              },
                            })
                            return
                          }
                          addToCart(current.email, watch, 1)
                          navigate('/cart')
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
=======
            {!visibleProducts.length ? (
              <p>No products available</p>
            ) : (
              visibleProducts.map((watch) => (
                <article key={watch.id} className="product-card">
                  <button
                    type="button"
                    className="product-card-open"
                    onClick={() => navigate(`/product/${watch.id}`)}
                  >
                    <div className="product-card-media">
                      <img src={watch.image} alt={watch.name} />
                    </div>

                    <div className="product-card-body">
                      <p className="product-category">{watch.category}</p>
                      <h2 className="product-name">{watch.name}</h2>
                      <p className="product-specs">{watch.specs}</p>
                    </div>
                  </button>

                  <div className="product-card-footer">
                    <span className="product-price">
                      ₹{watch.priceValue?.toLocaleString('en-IN')}
                    </span>

                    {!isAdmin && (
                      <button
                        className="product-cta"
                        onClick={() => navigate('/checkout', { state: { product: watch } })}
                      >
                        Buy Now →
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
>>>>>>> Stashed changes
          </div>

        </section>
      </main>
    </>
  )
}

export default Product