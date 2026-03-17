import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [open, setOpen] = useState(false)
  const navRef = useRef(null)
  const [user, setUser] = useState(null)

  const toggleMenu = () => {
    setOpen((prev) => !prev)
  }

  const handleToggleHover = () => {
    if (window.innerWidth <= 1024) {
      setOpen(true)
    }
  }

  const handleNavMouseLeave = () => {
    if (window.innerWidth <= 1024) {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem('user')
        setUser(raw ? JSON.parse(raw) : null)
      } catch {
        setUser(null)
      }
    }

    loadUser()

    const onStorage = () => loadUser()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    try {
      window.dispatchEvent(new Event('pikaplace-logout'))
    } catch {
      // ignore
    }
    setUser(null)
    setOpen(false)
    // Hard redirect to fully reset all forms and state
    window.location.href = '/auth'
  }

  const displayName = user?.name?.trim() || user?.email?.split?.('@')?.[0] || ''
  const avatarLetter = (displayName || user?.email || 'U').trim().charAt(0).toUpperCase()

  return (
    <header className="nav" ref={navRef} onMouseLeave={handleNavMouseLeave}>
      <div className="nav__logo">
        <Link to="/" className="nav__logo-link">
          PIKAPLACE
        </Link>
      </div>

      <button
        className="nav__toggle"
        aria-label="Toggle navigation"
        onClick={toggleMenu}
        onMouseEnter={handleToggleHover}
      >
        <span className="nav__toggle-bar" />
        <span className="nav__toggle-bar" />
        <span className="nav__toggle-bar" />
      </button>

      <nav className={`nav__links ${open ? 'nav__links--open' : ''}`}>
        <Link to="/" className="nav__link" onClick={() => setOpen(false)}>
          Home
        </Link>
        <Link to="/about" className="nav__link" onClick={() => setOpen(false)}>
          About Us
        </Link>
        <Link to="/product" className="nav__link" onClick={() => setOpen(false)}>
          Product
        </Link>
        {user && user.role === 'admin' && (
          <>
            <Link to="/admin/stock" className="nav__link" onClick={() => setOpen(false)}>
              Stock
            </Link>
            <Link to="/admin/product-report" className="nav__link" onClick={() => setOpen(false)}>
              Product Report
            </Link>
            <Link to="/admin/user-report" className="nav__link" onClick={() => setOpen(false)}>
              User Report
            </Link>
          </>
        )}
        {!user && (
          <Link to="/auth" className="nav__link" onClick={() => setOpen(false)}>
            Login/Registration
          </Link>
        )}
        {user && (user.role === 'admin' || user.role === 'customer') && (
          <div className="nav__admin">
            <div className="nav__admin-avatar">{avatarLetter}</div>
            <div className="nav__admin-info">
              <span className="nav__admin-name">
                {user.role === 'admin' ? 'Admin' : displayName || 'Customer'}
              </span>
              <span className="nav__admin-email">{user.email}</span>
            </div>
            <button
              type="button"
              className="nav__admin-logout"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="16"
                aria-hidden="true"
                style={{ marginRight: '4px' }}
              >
                <rect x="3" y="3" width="9" height="18" rx="2.2" fill="currentColor" />
                <path
                  d="M11 12H20M17 9L20 12L17 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Logout</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar

