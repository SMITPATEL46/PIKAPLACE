import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import './AdminDashboard.css'

const defaultProducts = [
  {
    id: 1,
    category: 'Luxury Classic',
    name: 'Aurelius Classic Gold',
    specs: 'Automatic · Sapphire Glass · 5 ATM',
    priceValue: 5999,
    image:
      'https://images.unsplash.com/photo-1548171916-30c7c511c1e9?auto=format&fit=crop&w=1200&q=80',
    available: 42,
    reorderAt: 10,
  },
  {
    id: 2,
    category: 'Everyday Casual',
    name: 'Noir Heritage Leather',
    specs: 'Quartz · Italian Leather · 3 ATM',
    priceValue: 4499,
    image:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    available: 28,
    reorderAt: 8,
  },
  {
    id: 3,
    category: 'Formal Dress',
    name: 'Black Tie Slimline',
    specs: 'Ultra Thin · Leather Strap · 3 ATM',
    priceValue: 4199,
    image:
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
    available: 15,
    reorderAt: 5,
  },
  {
    id: 4,
    category: 'Sport Chrono',
    name: 'Midnight Steel Chrono',
    specs: 'Chronograph · Tachymeter · 10 ATM',
    priceValue: 5499,
    image:
      'https://images.unsplash.com/photo-1524592714635-79fdaec1c1c1?auto=format&fit=crop&w=1200&q=80',
    available: 9,
    reorderAt: 6,
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

const normalizeImageList = (item) => {
  const list = []
  if (Array.isArray(item?.images)) list.push(...item.images)
  if (item?.image) list.push(item.image)
  const cleaned = Array.from(new Set(list.map((x) => String(x || '').trim()).filter(Boolean)))
  return cleaned.length ? cleaned : ['']
}

function AdminStock() {
  const [stock, setStock] = useState(loadProducts)
  const [autoRemoved, setAutoRemoved] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    category: 'Formal Dress',
    name: '',
    specs: '',
    priceValue: '',
    image: '',
    images: [''],
    available: '',
    reorderAt: '',
  })

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      category: item.category,
      name: item.name,
      specs: item.specs,
      priceValue: String(item.priceValue),
      image: item.image,
      images: normalizeImageList(item),
      available: String(item.available),
      reorderAt: String(item.reorderAt),
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({
      category: 'Formal Dress',
      name: '',
      specs: '',
      priceValue: '',
      image: '',
      images: [''],
      available: '',
      reorderAt: '',
    })
  }

  const handleSubmitStock = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const images = (Array.isArray(form.images) ? form.images : [])
      .map((x) => String(x || '').trim())
      .filter(Boolean)
    const primaryImage = images[0] || form.image.trim()

    const next = {
      id: editingId ?? Date.now(),
      category: form.category,
      name: form.name.trim(),
      specs: form.specs.trim(),
      priceValue: Number(form.priceValue) || 0,
      image: primaryImage,
      images,
      available: Number(form.available) || 0,
      reorderAt: Number(form.reorderAt) || 0,
    }

    setStock((prev) => {
      let updated = prev
      if (editingId) {
        updated = prev.map((item) => (item.id === editingId ? next : item))
      } else {
        updated = [...prev, next]
      }
      const kept = []
      const removedNow = []
      updated.forEach((item) => {
        if ((Number(item.available) || 0) <= 0) {
          removedNow.push(item)
        } else {
          kept.push(item)
        }
      })
      if (removedNow.length) {
        setAutoRemoved((prevRemoved) => [...removedNow, ...prevRemoved])
      }
      return kept
    })

    resetForm()
  }

  useEffect(() => {
    try {
      localStorage.setItem('products', JSON.stringify(stock))
    } catch {
      // ignore storage errors
    }
  }, [stock])

  const handleDelete = (id) => {
    setStock((prev) => prev.filter((item) => item.id !== id))
  }

  const updateImageField = (index, value) => {
    setForm((prev) => {
      const nextImages = [...prev.images]
      nextImages[index] = value
      return { ...prev, images: nextImages }
    })
  }

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImageField = (index) => {
    setForm((prev) => {
      if (prev.images.length <= 1) return prev
      return { ...prev, images: prev.images.filter((_, i) => i !== index) }
    })
  }

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <section className="admin-inner">
          <header className="admin-header">
            <div>
              <h1 className="admin-title">Stock management</h1>
              <p className="admin-subtitle">View and update current inventory levels.</p>
            </div>
          </header>

          <section className="admin-section">
            <div className="admin-stock-layout">
              <div className="admin-card admin-card--table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Category</th>
                      <th>Product</th>
                      <th>Specs</th>
                      <th>Price</th>
                      <th>Available</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((item) => {
                      const low = item.available <= item.reorderAt
                      return (
                        <tr key={item.id}>
                          <td>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="admin-stock-thumb"
                              />
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>{item.category}</td>
                          <td>{item.name}</td>
                          <td>{item.specs}</td>
                          <td>
                            {item.priceValue
                              ? `₹${item.priceValue.toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                          <td>{item.available}</td>
                          <td>
                            <span className={`stock-pill ${low ? 'stock-pill--low' : 'stock-pill--ok'}`}>
                              {low ? 'Low' : 'OK'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-link-button"
                              onClick={() => startEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="admin-link-button admin-link-button--danger"
                              onClick={() => handleDelete(item.id)}
                              style={{ marginLeft: 8 }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {autoRemoved.length > 0 && (
                <div className="admin-card admin-card--info">
                  <h3 className="admin-card-title">Auto removed (stock 0)</h3>
                  <p className="admin-subtitle">
                    These items were automatically removed because their available quantity became 0.
                  </p>
                  <ul className="admin-auto-removed-list">
                    {autoRemoved.map((item) => (
                      <li key={item.id}>
                        <strong>{item.name}</strong> — {item.category} (was {item.available} pcs)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="admin-card admin-card--form">
                <h3 className="admin-card-title">
                  {editingId ? 'Edit product' : 'Add new product'}
                </h3>
                <form className="admin-form" onSubmit={handleSubmitStock}>
                  <label className="admin-field">
                    <span>Category</span>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      <option value="Luxury Classic">Luxury Classic</option>
                      <option value="Everyday Casual">Everyday Casual</option>
                      <option value="Formal Dress">Formal Dress</option>
                      <option value="Sport Chrono">Sport Chrono</option>
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Product name</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Specs</span>
                    <input
                      type="text"
                      value={form.specs}
                      onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Price (₹)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="4199"
                      value={form.priceValue}
                      onChange={(e) => setForm((f) => ({ ...f, priceValue: e.target.value }))}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Image URL</span>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    />
                  </label>
                  <div className="admin-field">
                    <span>More image URLs</span>
                    <div className="admin-image-list">
                      {form.images.map((imageUrl, index) => (
                        <div key={`img_${index}`} className="admin-image-row">
                          <input
                            type="text"
                            placeholder={`https://image-${index + 1}...`}
                            value={imageUrl}
                            onChange={(e) => updateImageField(index, e.target.value)}
                          />
                          {form.images.length > 1 && (
                            <button
                              type="button"
                              className="admin-link-button admin-link-button--danger"
                              onClick={() => removeImageField(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" className="admin-secondary-btn" onClick={addImageField}>
                      Add more image
                    </button>
                  </div>
                  <div className="admin-field-row">
                    <label className="admin-field">
                      <span>Available stock</span>
                      <input
                        type="number"
                        min="0"
                        value={form.available}
                        onChange={(e) => setForm((f) => ({ ...f, available: e.target.value }))}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Reorder at</span>
                      <input
                        type="number"
                        min="0"
                        value={form.reorderAt}
                        onChange={(e) => setForm((f) => ({ ...f, reorderAt: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    {editingId && (
                      <button type="button" className="admin-secondary-btn" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="admin-primary-btn">
                      {editingId ? 'Save changes' : 'Add product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  )
}

export default AdminStock

