export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getCurrentUser() {
  const user = readJson('user', null)
  if (!user || typeof user !== 'object') return null
  if (!user.email) return null
  return user
}

export function getAllUsers() {
  return readJson('users', [])
}

export function setAllUsers(users) {
  writeJson('users', Array.isArray(users) ? users : [])
}

export function updateUserPassword(email, nextPassword) {
  const normalizedEmail = String(email || '').toLowerCase()
  if (!normalizedEmail || !nextPassword) return { ok: false, reason: 'invalid_input' }

  const users = getAllUsers()
  const index = users.findIndex((u) => String(u?.email || '').toLowerCase() === normalizedEmail)
  if (index < 0) return { ok: false, reason: 'user_not_found' }

  const nextUsers = [...users]
  nextUsers[index] = { ...nextUsers[index], password: nextPassword }
  setAllUsers(nextUsers)
  return { ok: true }
}

export function cartKeyFor(email) {
  return `pikaplace:cart:${String(email || '').toLowerCase()}`
}

export function ordersKeyFor(email) {
  return `pikaplace:orders:${String(email || '').toLowerCase()}`
}

export function getCart(email) {
  return readJson(cartKeyFor(email), [])
}

export function setCart(email, cartItems) {
  writeJson(cartKeyFor(email), Array.isArray(cartItems) ? cartItems : [])
  try {
    window.dispatchEvent(new Event('pikaplace-cart'))
  } catch {
    // ignore
  }
}

export function getOrders(email) {
  return readJson(ordersKeyFor(email), [])
}

export function setOrders(email, orders) {
  writeJson(ordersKeyFor(email), Array.isArray(orders) ? orders : [])
  try {
    window.dispatchEvent(new Event('pikaplace-orders'))
  } catch {
    // ignore
  }
}

export function addToCart(email, product, quantity = 1) {
  const safeQty = Number.isFinite(Number(quantity)) ? Math.max(1, Math.floor(Number(quantity))) : 1
  const cart = getCart(email)
  const productId = product?.id
  const idx = cart.findIndex((i) => i?.product?.id === productId)
  if (idx >= 0) {
    const next = [...cart]
    next[idx] = { ...next[idx], quantity: (Number(next[idx]?.quantity) || 1) + safeQty }
    setCart(email, next)
    return
  }
  setCart(email, [
    ...cart,
    {
      id: `cart_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      addedAt: new Date().toISOString(),
      quantity: safeQty,
      product,
    },
  ])
}

function productReviewsKey(productId) {
  return `pikaplace:reviews:${String(productId || '')}`
}

export function getProductReviews(productId) {
  return readJson(productReviewsKey(productId), [])
}

export function getUserProductReview(productId, email) {
  const normalizedEmail = String(email || '').toLowerCase()
  if (!normalizedEmail) return null
  const reviews = getProductReviews(productId)
  return (
    reviews.find((r) => String(r?.userEmail || '').toLowerCase() === normalizedEmail) || null
  )
}

export function upsertProductReview(productId, review) {
  const reviews = getProductReviews(productId)
  const normalizedEmail = String(review?.userEmail || '').toLowerCase()

  const idx =
    normalizedEmail && Array.isArray(reviews)
      ? reviews.findIndex((r) => String(r?.userEmail || '').toLowerCase() === normalizedEmail)
      : -1

  if (idx >= 0) {
    const existing = reviews[idx]
    const nextReview = {
      ...existing,
      ...review,
      userEmail: normalizedEmail || existing?.userEmail,
      id: existing?.id || `review_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const nextReviews = [...reviews]
    nextReviews[idx] = nextReview
    writeJson(productReviewsKey(productId), nextReviews)
    try {
      window.dispatchEvent(new Event('pikaplace-reviews'))
    } catch {
      // ignore
    }
    return nextReview
  }

  const nextReview = {
    id: `review_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    ...review,
    userEmail: normalizedEmail || review?.userEmail,
  }
  writeJson(productReviewsKey(productId), [nextReview, ...reviews])
  try {
    window.dispatchEvent(new Event('pikaplace-reviews'))
  } catch {
    // ignore
  }
  return nextReview
}

const LOGIN_EVENTS_KEY = 'pikaplace:loginEvents'

export function getLoginEvents() {
  return readJson(LOGIN_EVENTS_KEY, [])
}

export function recordUserLogin(email, role = 'customer') {
  const normalizedEmail = String(email || '').toLowerCase()
  if (!normalizedEmail) return
  const events = getLoginEvents()
  const next = [
    {
      id: `login_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      email: normalizedEmail,
      role,
      at: new Date().toISOString(),
    },
    ...events,
  ].slice(0, 2000)
  writeJson(LOGIN_EVENTS_KEY, next)
}

