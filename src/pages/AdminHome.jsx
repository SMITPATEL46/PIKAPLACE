import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import './AdminDashboard.css'

const STORAGE_KEY = 'home_hero'
const ABOUT_STORAGE_KEY = 'about_content'
const HOME_COLLECTIONS_KEY = 'home_collections'
const ABOUT_BLOGS_KEY = 'about_blogs'

const defaultHero = {
  tag: 'New arrivals · 2026 collection',
  titleMain: 'Timeless Watches for',
  titleHighlight: 'Timeless Style',
  subtitle:
    'Premium analog watches crafted for elegance and precision. Discover hand-finished pieces that celebrate classic horology with a contemporary edge.',
  watchName: 'Midnight Steel Chrono',
  watchSub: 'Limited edition · 250 pieces',
  priceText: '₹5,999',
  imageUrl:
    'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/height:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/1-rKSrImqDhRJv01tqjmn.png@jpg',
}

const defaultAbout = {
  heroPill: 'About PIKAPLACE',
  heroTitleMain: 'Timeless watches, crafted',
  heroTitleHighlight: ' for every moment.',
  heroSubtitle:
    "At PIKAPLACE, we blend classic watchmaking heritage with modern design. Every piece is curated to feel special on your wrist – whether it's your first interview, a weekend escape, or a once-in-a-lifetime celebration.",
  stat1Number: '50+',
  stat1Label: 'Curated designs',
  stat2Number: '4.8★',
  stat2Label: 'Average rating',
  stat3Number: '24/7',
  stat3Label: 'Support',
  heroMainImage:
    'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/height:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/1-rKSrImqDhRJv01tqjmn.png@jpg',
  heroCard1Image:
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  heroCard2Image:
    'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  heroCard1Tag: 'Signature Collection',
  heroCard1Text:
    'Minimal dials, rich textures, and premium finishes built to outlast trends.',
  heroCard2Tag: 'Crafted for India',
  heroCard2Text:
    'Comfort-focused straps, durable cases, and water resistance for everyday life.',
  storyImage:
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
  storyTitle: 'Our story',
  storyBody1:
    "PIKAPLACE started with a simple idea: great watches shouldn't feel out of reach. We were tired of choosing between unreliable budget pieces and overpriced luxury. So we set out to build a curated collection that delivers both character and quality.",
  storyBody2:
    'Today, we partner with trusted manufacturers and designers to bring you watches that balance precision engineering with timeless aesthetics.',
  craftImage:
    'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  craftTitle: 'Craft & quality',
  craftList:
    'Stainless steel or premium alloy cases for lasting durability.\nComfort-first straps: leather, steel, and sport-ready bands.\nThoughtful details like sapphire / mineral glass and date windows.\nCurated collections for classic, casual, dress, and sport styles.',
  promiseTitle: 'Our promise',
  promiseText:
    "We keep our experience simple: transparent pricing, clear information, and responsive support. If something doesn't feel right with your order, our team is ready to help you make it right.",
  helpTitle: 'Need help?',
  helpIntro:
    'Have a question about sizing, straps, or picking the right watch for a special occasion? Reach out to us:',
  helpEmail: 'support@pikaplace.in',
  helpPhone: '+91-98765-43210',
  helpHours: 'Mon – Sat, 10am to 7pm IST',
}

const defaultHomeCollections = [
  {
    id: 'luxury',
    title: 'Luxury Watches',
    story: 'Hand-finished pieces with precious metals and sapphire glass.',
    image:
      'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/ydLC5vD0zu2exNPmIFHdn.png',
  },
  {
    id: 'sports',
    title: 'Sports Watches',
    story: 'Rugged chronographs built for performance and precision.',
    image:
      'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/aeqO41N8Ug7-_T3N1FM2A.png',
  },
  {
    id: 'casual',
    title: 'Casual Watches',
    story: 'Minimal everyday designs that pair with anything.',
    image: 'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  },
  {
    id: 'formal',
    title: 'Formal Watches',
    story: 'Slim, elegant dress watches for black-tie occasions.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
  },
]

const defaultAboutBlogs = [
  {
    id: 'story',
    title: 'Our story',
    story:
      "PIKAPLACE started with a simple idea: great watches shouldn't feel out of reach. We were tired of choosing between unreliable budget pieces and overpriced luxury. So we set out to build a curated collection that delivers both character and quality. Today, we partner with trusted manufacturers and designers to bring you watches that balance precision engineering with timeless aesthetics.",
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'craft',
    title: 'Craft & quality',
    story:
      'Stainless steel or premium alloy cases for lasting durability. Comfort-first straps: leather, steel, and sport-ready bands. Thoughtful details like sapphire/mineral glass and date windows. Curated collections for classic, casual, dress, and sport styles.',
    image: 'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  },
  {
    id: 'promise',
    title: 'Our promise',
    story:
      "We keep our experience simple: transparent pricing, clear information, and responsive support. If something doesn't feel right with your order, our team is ready to help you make it right.",
    image: '',
  },
  {
    id: 'help',
    title: 'Need help?',
    story: 'Email: support@pikaplace.in | Phone/WhatsApp: +91-98765-43210 | Hours: Mon-Sat, 10am-7pm IST',
    image: '',
  },
]

const loadHero = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultHero
    const parsed = JSON.parse(raw)
    return { ...defaultHero, ...parsed }
  } catch {
    return defaultHero
  }
}

const loadAbout = () => {
  try {
    const raw = localStorage.getItem(ABOUT_STORAGE_KEY)
    if (!raw) return defaultAbout
    const parsed = JSON.parse(raw)
    return { ...defaultAbout, ...parsed }
  } catch {
    return defaultAbout
  }
}

function AdminHome() {
  const [form, setForm] = useState(loadHero)
  const [aboutForm, setAboutForm] = useState(loadAbout)
  const [collections, setCollections] = useState(() => {
    try {
      const raw = localStorage.getItem(HOME_COLLECTIONS_KEY)
      if (!raw) return defaultHomeCollections
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return defaultHomeCollections
      return parsed
    } catch {
      return defaultHomeCollections
    }
  })
  const [aboutBlogs, setAboutBlogs] = useState(() => {
    try {
      const raw = localStorage.getItem(ABOUT_BLOGS_KEY)
      if (!raw) return defaultAboutBlogs
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return defaultAboutBlogs
      return parsed
    } catch {
      return defaultAboutBlogs
    }
  })
  const [popup, setPopup] = useState({ open: false, target: 'collection' })
  const [popupForm, setPopupForm] = useState({ image: '', title: '', story: '' })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      // ignore
    }
  }, [form])

  useEffect(() => {
    try {
      localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(aboutForm))
    } catch {
      // ignore
    }
  }, [aboutForm])

  useEffect(() => {
    try {
      localStorage.setItem(HOME_COLLECTIONS_KEY, JSON.stringify(collections))
    } catch {
      // ignore
    }
  }, [collections])

  useEffect(() => {
    try {
      localStorage.setItem(ABOUT_BLOGS_KEY, JSON.stringify(aboutBlogs))
    } catch {
      // ignore
    }
  }, [aboutBlogs])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleReset = () => {
    setForm(defaultHero)
  }

  const handleAboutChange = (field) => (e) => {
    setAboutForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleAboutReset = () => {
    setAboutForm(defaultAbout)
  }

  const openPopup = (target) => {
    setPopup({ open: true, target })
    setPopupForm({ image: '', title: '', story: '' })
  }

  const closePopup = () => {
    setPopup({ open: false, target: 'collection' })
    setPopupForm({ image: '', title: '', story: '' })
  }

  const handlePopupChange = (field) => (e) => {
    setPopupForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handlePopupSave = (e) => {
    e.preventDefault()
    if (!popupForm.title.trim() || !popupForm.story.trim()) return
    const item = {
      id: `${popup.target}_${Date.now()}`,
      title: popupForm.title.trim(),
      story: popupForm.story.trim(),
      image: popupForm.image.trim(),
    }
    if (popup.target === 'collection') setCollections((prev) => [...prev, item])
    else setAboutBlogs((prev) => [...prev, item])
    closePopup()
  }

  const deleteCollection = (id) => setCollections((prev) => prev.filter((x) => x.id !== id))
  const deleteAboutBlog = (id) => setAboutBlogs((prev) => prev.filter((x) => x.id !== id))

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <section className="admin-inner">
          <header className="admin-header">
            <div>
              <h1 className="admin-title">Edits</h1>
              <p className="admin-subtitle">
                Update content and visuals for the Home and About pages.
              </p>
            </div>
          </header>

          <section className="admin-section">
            <div className="admin-edits-stack">
              <div className="admin-edits-row admin-edits-row--three">
                <div className="admin-card admin-card--form">
                  <h3 className="admin-card-title">Home page – hero text</h3>
                  <p className="admin-subtitle" style={{ marginBottom: '0.75rem' }}>
                    Controls the big heading and short paragraph at the top of the Home page.
                  </p>
                  <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                    <label className="admin-field">
                      <span>Tag line</span>
                      <input
                        type="text"
                        value={form.tag}
                        onChange={handleChange('tag')}
                        placeholder="New arrivals · 2026 collection"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Title (main)</span>
                      <input
                        type="text"
                        value={form.titleMain}
                        onChange={handleChange('titleMain')}
                        placeholder="Timeless Watches for"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Title (highlight)</span>
                      <input
                        type="text"
                        value={form.titleHighlight}
                        onChange={handleChange('titleHighlight')}
                        placeholder="Timeless Style"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Subtitle</span>
                      <input type="text" value={form.subtitle} onChange={handleChange('subtitle')} />
                    </label>
                    <div className="admin-form-actions">
                      <button type="button" className="admin-secondary-btn" onClick={handleReset}>
                        Reset to default
                      </button>
                    </div>
                  </form>
                </div>

                <div className="admin-card admin-card--form">
                  <h3 className="admin-card-title">Home page – hero watch card</h3>
                  <p className="admin-subtitle" style={{ marginBottom: '0.75rem' }}>
                    Controls the small watch card (name, text, price, image) below the hero image.
                  </p>
                  <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                    <label className="admin-field">
                      <span>Watch name</span>
                      <input type="text" value={form.watchName} onChange={handleChange('watchName')} />
                    </label>
                    <label className="admin-field">
                      <span>Watch sub text</span>
                      <input
                        type="text"
                        value={form.watchSub}
                        onChange={handleChange('watchSub')}
                        placeholder="Limited edition · 250 pieces"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Price text</span>
                      <input
                        type="text"
                        value={form.priceText}
                        onChange={handleChange('priceText')}
                        placeholder="₹5,999"
                      />
                    </label>
                    <label className="admin-field">
                      <span>Image URL</span>
                      <input
                        type="text"
                        value={form.imageUrl}
                        onChange={handleChange('imageUrl')}
                        placeholder="https://..."
                      />
                    </label>
                    <div className="admin-form-actions">
                      <button type="button" className="admin-secondary-btn" onClick={handleReset}>
                        Reset to default
                      </button>
                    </div>
                    <p className="admin-subtitle" style={{ marginTop: '0.25rem' }}>
                      Changes are saved automatically and update the home page instantly.
                    </p>
                  </form>
                </div>

                <div className="admin-card admin-card--form">
                  <h3 className="admin-card-title">Home collections add/remove</h3>
                  <p className="admin-subtitle" style={{ marginBottom: '0.75rem' }}>
                    Add new collection card or delete any existing collection card.
                  </p>
                  <div className="admin-toggle-list">
                    {collections.map((c) => (
                      <div key={c.id} className="admin-toggle-item">
                        <div>
                          <div className="admin-toggle-title">{c.title}</div>
                          <div className="admin-subtitle admin-toggle-sub">{c.story}</div>
                        </div>
                        <button
                          type="button"
                          className="admin-link-button admin-toggle-btn--danger"
                          onClick={() => deleteCollection(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <div className="admin-form-actions admin-form-actions--space-between">
                      <button
                        type="button"
                        className="admin-secondary-btn"
                        onClick={() => openPopup('collection')}
                      >
                        Add collection
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-edits-row admin-edits-row--two">
                <div className="admin-card admin-card--form">
                  <h3 className="admin-card-title">About page – hero & stats</h3>
                  <p className="admin-subtitle" style={{ marginBottom: '0.75rem' }}>
                    Controls the top title, subtitle, stats, and main image on the About page.
                  </p>
                  <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                    <label className="admin-field">
                      <span>Hero label</span>
                      <input
                        type="text"
                        value={aboutForm.heroPill}
                        onChange={handleAboutChange('heroPill')}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Hero title (main)</span>
                      <input
                        type="text"
                        value={aboutForm.heroTitleMain}
                        onChange={handleAboutChange('heroTitleMain')}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Hero title (highlight)</span>
                      <input
                        type="text"
                        value={aboutForm.heroTitleHighlight}
                        onChange={handleAboutChange('heroTitleHighlight')}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Hero subtitle</span>
                      <input
                        type="text"
                        value={aboutForm.heroSubtitle}
                        onChange={handleAboutChange('heroSubtitle')}
                      />
                    </label>
                    <label className="admin-field">
                      <span>Main hero image URL</span>
                      <input
                        type="text"
                        value={aboutForm.heroMainImage}
                        onChange={handleAboutChange('heroMainImage')}
                      />
                    </label>
                    <div className="admin-field-row">
                      <label className="admin-field">
                        <span>Stat 1 number</span>
                        <input
                          type="text"
                          value={aboutForm.stat1Number}
                          onChange={handleAboutChange('stat1Number')}
                        />
                      </label>
                      <label className="admin-field">
                        <span>Stat 1 label</span>
                        <input
                          type="text"
                          value={aboutForm.stat1Label}
                          onChange={handleAboutChange('stat1Label')}
                        />
                      </label>
                    </div>
                    <div className="admin-field-row">
                      <label className="admin-field">
                        <span>Stat 2 number</span>
                        <input
                          type="text"
                          value={aboutForm.stat2Number}
                          onChange={handleAboutChange('stat2Number')}
                        />
                      </label>
                      <label className="admin-field">
                        <span>Stat 2 label</span>
                        <input
                          type="text"
                          value={aboutForm.stat2Label}
                          onChange={handleAboutChange('stat2Label')}
                        />
                      </label>
                    </div>
                    <div className="admin-field-row">
                      <label className="admin-field">
                        <span>Stat 3 number</span>
                        <input
                          type="text"
                          value={aboutForm.stat3Number}
                          onChange={handleAboutChange('stat3Number')}
                        />
                      </label>
                      <label className="admin-field">
                        <span>Stat 3 label</span>
                        <input
                          type="text"
                          value={aboutForm.stat3Label}
                          onChange={handleAboutChange('stat3Label')}
                        />
                      </label>
                    </div>
                    <div className="admin-form-actions">
                      <button type="button" className="admin-secondary-btn" onClick={handleAboutReset}>
                        Reset About page
                      </button>
                    </div>
                  </form>
                </div>

                <div className="admin-card admin-card--form">
                  <h3 className="admin-card-title">About blogs add/remove</h3>
                  <p className="admin-subtitle" style={{ marginBottom: '0.75rem' }}>
                    Add new blog card or delete any existing blog card.
                  </p>
                  <div className="admin-toggle-list">
                    {aboutBlogs.map((c) => (
                      <div key={c.id} className="admin-toggle-item">
                        <div>
                          <div className="admin-toggle-title">{c.title}</div>
                          <div className="admin-subtitle admin-toggle-sub">{c.story}</div>
                        </div>
                        <button
                          type="button"
                          className="admin-link-button admin-toggle-btn--danger"
                          onClick={() => deleteAboutBlog(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <div className="admin-form-actions admin-form-actions--space-between">
                      <button type="button" className="admin-secondary-btn" onClick={() => openPopup('blog')}>
                        Add blog
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      {popup.open ? (
        <div className="admin-modal-backdrop" onClick={closePopup}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-card-title" style={{ marginBottom: 10 }}>
              Add {popup.target === 'collection' ? 'Collection' : 'Blog'}
            </h3>
            <form className="admin-form" onSubmit={handlePopupSave}>
              <label className="admin-field">
                <span>Image URL</span>
                <input type="text" value={popupForm.image} onChange={handlePopupChange('image')} />
              </label>
              <label className="admin-field">
                <span>Title</span>
                <input type="text" value={popupForm.title} onChange={handlePopupChange('title')} required />
              </label>
              <label className="admin-field">
                <span>Story</span>
                <input type="text" value={popupForm.story} onChange={handlePopupChange('story')} required />
              </label>
              <div className="admin-form-actions">
                <button type="button" className="admin-secondary-btn" onClick={closePopup}>
                  Cancel
                </button>
                <button type="submit" className="admin-primary-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default AdminHome

