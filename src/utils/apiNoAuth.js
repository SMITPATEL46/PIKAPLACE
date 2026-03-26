const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

async function getIdToken() {
  // Lazy dynamic import to avoid circular deps during module init.
  const { auth } = await import('../firebase/firebaseClient')
  if (!auth?.currentUser) return null
  return await auth.currentUser.getIdToken()
}

export async function apiFetchNoAuth(path, { method = 'GET', body } = {}) {
  const token = await getIdToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const resp = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await resp.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }

  if (!resp.ok) {
    const msg = data?.error || `Request failed (${resp.status})`
    const err = new Error(msg)
    err.status = resp.status
    err.data = data
    throw err
  }

  return data
}

