import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { addToCart, getCurrentUser } from '../utils/session.js'
import './Product.css'

const defaultProducts = [
  {
    id: 1,
    category: 'Luxury Classic',
    name: 'Aurelius Classic Gold',
    specs: 'Automatic · Sapphire Glass · 5 ATM',
    priceValue: 5999,
    image:
      'https://images.unsplash.com/photo-1548171916-30c7c511c1e9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    category: 'Everyday Casual',
    name: 'Noir Heritage Leather',
    specs: 'Quartz · Italian Leather · 3 ATM',
    priceValue: 4499,
    image:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    category: 'Formal Dress',
    name: 'Ivory Dial Heritage',
    specs: 'Slim Case · Date Window · 3 ATM',
    priceValue: 3999,
    image:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    category: 'Sport Chrono',
    name: 'Midnight Steel Chrono',
    specs: 'Chronograph · Tachymeter · 10 ATM',
    priceValue: 5499,
    image:
      'https://images.unsplash.com/photo-1524592714635-79fdaec1c1c1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    category: 'Luxury Classic',
    name: 'Regal Silver Date',
    specs: 'Automatic · Steel Bracelet · 5 ATM',
    priceValue: 5499,
    image:
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    category: 'Everyday Casual',
    name: 'Navy Minimal Date',
    specs: 'Quartz · Canvas Strap · 3 ATM',
    priceValue: 3499,
    image:
      'https://images.unsplash.com/photo-1524594154908-edd35596e0df?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7,
    category: 'Formal Dress',
    name: 'Black Tie Slimline',
    specs: 'Ultra Thin · Leather Strap · 3 ATM',
    priceValue: 4199,
    image:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 8,
    category: 'Sport Chrono',
    name: 'Rally Sport Timer',
    specs: 'Chronograph · Rubber Strap · 10 ATM',
    priceValue: 5299,
    image:
      'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 9,
    category: 'Everyday Casual',
    name: 'Vintage Brown Classic',
    specs: 'Quartz · Vintage Dial · 3 ATM',
    priceValue: 3899,
    image:
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80',
  },
]

const loadProducts = () => {
  try {
    const raw = localStorage.getItem('products')
    if (!raw) return defaultProducts
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultProducts
    return parsed
  } catch {
    return defaultProducts
  }
}

function Product() {
  const [products, setProducts] = useState(loadProducts)
  const [activeFilter, setActiveFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('None')
  const navigate = useNavigate()
  const user = getCurrentUser()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'products') {
        setProducts(loadProducts())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
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
    let list = activeFilter === 'All' ? products : products.filter((p) => p.category === activeFilter)

    switch (priceFilter) {
      case 'Under ₹4,000':
        list = list.filter((p) => p.priceValue <= 4000)
        break
      case '₹4,000 – ₹5,000':
        list = list.filter((p) => p.priceValue > 4000 && p.priceValue <= 5000)
        break
      case '₹5,000 – ₹6,000':
        list = list.filter((p) => p.priceValue > 5000 && p.priceValue <= 6000)
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
  }, [activeFilter, priceFilter, sortOrder])

  return (
    <>
      <Navbar />
      <main className="product-page">
        <section className="product-page-inner">
         

          <div className="product-filters-selects">
            <div className="product-select-wrapper">
              <label className="product-select-label" htmlFor="categoryFilter">
                Category
              </label>
              <select
                id="categoryFilter"
                className="product-select"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-select-wrapper">
              <label className="product-select-label" htmlFor="priceFilter">
                Price
              </label>
              <select
                id="priceFilter"
                className="product-select"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                {priceFilters.map((pf) => (
                  <option key={pf} value={pf}>
                    {pf}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-select-wrapper">
              <label className="product-select-label" htmlFor="sortOrder">
                Sort
              </label>
              <select
                id="sortOrder"
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
          </div>
        </section>
      </main>
    </>
  )
}

export default Product

