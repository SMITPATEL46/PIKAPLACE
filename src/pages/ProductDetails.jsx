import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
<<<<<<< Updated upstream
import {
  addToCart,
  getCurrentUser,
  getProductReviews,
  getUserProductReview,
  upsertProductReview,
} from '../utils/session.js'
import './ProductDetails.css'

const loadProducts = () => {
  try {
    const raw = localStorage.getItem('products')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

=======
import { apiFetch } from '../api/apiClient.js'
import { getCurrentUser } from '../utils/session.js'
import './ProductDetails.css'

>>>>>>> Stashed changes
function ProductDetails() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const user = getCurrentUser()
<<<<<<< Updated upstream
  const email = user?.email
  const isAdmin = user?.role === 'admin'
  const [products, setProducts] = useState(loadProducts)
=======
  const phoneNumber = user?.phone_number
  const isAdmin = user?.role === 'admin'
  const [products, setProducts] = useState([])
>>>>>>> Stashed changes
  const [reviews, setReviews] = useState([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [didSubmit, setDidSubmit] = useState(false)
  const numericId = Number(productId)

  const product = useMemo(
    () => products.find((p) => Number(p?.id) === numericId) || null,
    [products, numericId],
  )

  const myReview = useMemo(() => {
<<<<<<< Updated upstream
    if (!numericId || !email) return null
    return getUserProductReview(numericId, email)
  }, [numericId, email, reviews.length])
=======
    if (!numericId || !phoneNumber) return null
    const match = reviews.find(
      (r) => String(r?.userEmail || '').toLowerCase() === String(phoneNumber).toLowerCase(),
    )
    return match || null
  }, [numericId, phoneNumber, reviews])
>>>>>>> Stashed changes

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    const total = reviews.reduce((sum, r) => sum + (Number(r?.rating) || 0), 0)
    return total / reviews.length
  }, [reviews])

  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => {
      const value = Number(r?.rating)
      if (value >= 1 && value <= 5) counts[value] += 1
    })
    const total = reviews.length || 1
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      percent: (counts[star] / total) * 100,
    }))
  }, [reviews])

  const galleryImages = useMemo(() => {
    if (!product) return []
    const imageList = []
    if (Array.isArray(product.images)) {
      imageList.push(...product.images)
    }
    if (typeof product.image === 'string') imageList.push(product.image)
    if (typeof product.image2 === 'string') imageList.push(product.image2)
    if (typeof product.image3 === 'string') imageList.push(product.image3)
    if (typeof product.image4 === 'string') imageList.push(product.image4)
    return Array.from(new Set(imageList.filter(Boolean)))
  }, [product])

  useEffect(() => {
<<<<<<< Updated upstream
    setProducts(loadProducts())
=======
    let cancelled = false
    const loadProductsFromBackend = async () => {
      try {
        const data = await apiFetch('/api/products')
        if (cancelled) return
        setProducts(data?.items || [])
      } catch {
        if (!cancelled) setProducts([])
      }
    }
    loadProductsFromBackend()
    return () => {
      cancelled = true
    }
>>>>>>> Stashed changes
  }, [])

  useEffect(() => {
    if (!numericId) return
<<<<<<< Updated upstream
    const reload = () => setReviews(getProductReviews(numericId))
    reload()
    window.addEventListener('storage', reload)
    window.addEventListener('pikaplace-reviews', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('pikaplace-reviews', reload)
=======
    let cancelled = false
    const reload = async () => {
      const data = await apiFetch(`/api/products/${numericId}/reviews`)
      if (cancelled) return
      setReviews(data?.items || [])
    }
    reload()
    return () => {
      cancelled = true
>>>>>>> Stashed changes
    }
  }, [numericId])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [numericId, galleryImages.length])

  useEffect(() => {
    if (!myReview) return
    setRating(Number(myReview?.rating) || 5)
    setComment(String(myReview?.comment || ''))
  }, [myReview?.id])

  const handleSubmitReview = (e) => {
    e.preventDefault()
    setSubmitError('')
    setDidSubmit(false)

<<<<<<< Updated upstream
    if (!email) {
=======
    if (!phoneNumber) {
>>>>>>> Stashed changes
      setSubmitError('Please login to add a rating and comment.')
      return
    }

    const safeRating = Math.max(1, Math.min(5, Math.floor(Number(rating) || 0)))
    const safeComment = String(comment || '').trim()
    if (!safeComment) {
      setSubmitError('Please write a comment.')
      return
    }

<<<<<<< Updated upstream
    upsertProductReview(numericId, {
      userEmail: email,
      userName: user?.name || user?.fullName || email,
      rating: safeRating,
      comment: safeComment,
    })
    setDidSubmit(true)
=======
    apiFetch(`/api/products/${numericId}/reviews`, {
      method: 'POST',
      body: { rating: safeRating, comment: safeComment },
    })
      .then(async () => {
        const data = await apiFetch(`/api/products/${numericId}/reviews`)
        setReviews(data?.items || [])
        setDidSubmit(true)
      })
      .catch((err) => {
        setSubmitError(err?.message || 'Failed to submit review.')
      })
>>>>>>> Stashed changes
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="product-details-page">
          <section className="product-details-card">
            <h2>Product not found</h2>
            <button type="button" onClick={() => navigate('/product')}>
              Back to products
            </button>
          </section>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="product-details-page">
        <section className="product-details-card">
          <div className="product-details-grid">
            <div className="product-details-media">
              <img
                src={galleryImages[activeImageIndex] || product.image}
                alt={`${product.name} preview ${activeImageIndex + 1}`}
              />
              {galleryImages.length > 1 && (
                <div className="product-slider-controls">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? galleryImages.length - 1 : prev - 1,
                      )
                    }
                  >
                    Prev
                  </button>
                  <span>
                    {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === galleryImages.length - 1 ? 0 : prev + 1,
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
              {galleryImages.length > 1 && (
                <div className="product-slider-thumbs">
                  {galleryImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}_${index}`}
                      type="button"
                      className={index === activeImageIndex ? 'active' : ''}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <img src={imageUrl} alt={`${product.name} thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="product-details-info">
              <p className="product-details-category">{product.category}</p>
              <h1>{product.name}</h1>
              <p>{product.specs}</p>
              <p className="product-details-price">₹{Number(product.priceValue || 0).toLocaleString('en-IN')}</p>
              <p className="product-rating-overview">
                Rating: {averageRating ? averageRating.toFixed(1) : '0.0'} / 5 ({reviews.length} review
                {reviews.length === 1 ? '' : 's'})
              </p>

              {!isAdmin && (
                <div className="product-details-actions">
                  <button
                    type="button"
                    onClick={() => {
                      const current = getCurrentUser()
                      if (!current || current.role !== 'customer') {
                        navigate('/auth', {
                          state: {
                            redirectTo: `/product/${numericId}`,
                            redirectState: { action: 'buy', product },
                          },
                        })
                        return
                      }
                      try {
                        localStorage.setItem('selectedProduct', JSON.stringify(product))
                      } catch {
                        // ignore
                      }
                      navigate('/checkout', { state: { product } })
                    }}
                  >
                    Buy Now →
                  </button>
                  <button
                    type="button"
                    className="product-details-secondary-btn"
                    onClick={() => {
                      const current = getCurrentUser()
                      if (!current || current.role !== 'customer') {
                        navigate('/auth', {
                          state: {
                            redirectTo: `/product/${numericId}`,
                            redirectState: { action: 'addToCart', product },
                          },
                        })
                        return
                      }
<<<<<<< Updated upstream
                      addToCart(current.email, product, 1)
                      navigate('/cart')
=======
                      apiFetch('/api/cart/items', {
                        method: 'POST',
                        body: { productId: product.id, quantity: 1 },
                      })
                        .then(() => {
                          window.dispatchEvent(new Event('pikaplace-cart'))
                          navigate('/cart')
                        })
                        .catch((e) => {
                          // eslint-disable-next-line no-alert
                          alert(e?.message || 'Failed to add to cart.')
                        })
>>>>>>> Stashed changes
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="product-review-card">
          <h2>Ratings & Comments</h2>
          <div className="rating-graph">
            {ratingDistribution.map((item) => (
              <div key={item.star} className="rating-row">
                <span className="rating-label">{item.star}★</span>
                <div className="rating-track">
                  <div className="rating-fill" style={{ width: `${item.percent}%` }} />
                </div>
                <span className="rating-count">{item.count}</span>
              </div>
            ))}
          </div>

          <form className="review-form" onSubmit={handleSubmitReview}>
            <div className="review-form-head">
              <h3>{myReview ? 'Update your review' : 'Add your review'}</h3>
<<<<<<< Updated upstream
              {email ? <span className="review-muted">Signed in as {email}</span> : null}
=======
              {phoneNumber ? <span className="review-muted">Signed in as {phoneNumber}</span> : null}
>>>>>>> Stashed changes
            </div>

            <div className="review-form-grid">
              <label className="review-field">
                <span>Rating</span>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Bad</option>
                </select>
              </label>

              <label className="review-field">
                <span>Comment</span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience…"
                />
              </label>
            </div>

            {submitError ? <p className="review-error">{submitError}</p> : null}
            {didSubmit ? (
              <p className="review-success">
                {myReview ? 'Review updated.' : 'Review submitted.'} You can only have one review per product.
              </p>
            ) : null}

            <button type="submit">{myReview ? 'Update review' : 'Submit review'}</button>
          </form>

          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="review-empty">No comments yet. Be the first to review this product.</p>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="review-item">
                  <div className="review-head">
                    <strong>{r.userName || 'Customer'}</strong>
                    <span>
                      {'★'.repeat(Number(r.rating) || 0)}
                      {'☆'.repeat(Math.max(5 - (Number(r.rating) || 0), 0))}
                    </span>
                  </div>
                  <p>{r.comment}</p>
                  <small>
                    {new Date(r.updatedAt || r.createdAt).toLocaleString('en-IN')}
                    {r.updatedAt ? ' (edited)' : ''}
                  </small>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export default ProductDetails
