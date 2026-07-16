import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTheme } from '../App'
import { useShop } from '../context/ShopContext'

export default function Navbar() {
  const { isDark, setIsDark } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    cart,
    user,
    setUser,
    setLoginOpen,
    setCartOpen
  } = useShop()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const isAdmin = localStorage.getItem('isAdmin') === 'true'

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('admin-auth')
    localStorage.removeItem('user')

    if (setUser) {
      setUser(null)
    }

    alert('Logged out successfully!')
    window.location.reload()
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">

            <Link
              to="/"
              className="navbar-logo"
              onClick={() => setMenuOpen(false)}
            >
              <div className="navbar-logo-icon">🛒</div>
              Shop<span className="accent">Sphere</span>
            </Link>

            <ul className="navbar-links">
              {navLinks.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      isActive ? 'active' : ''
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}

              {isAdmin && (
                <li>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      isActive ? 'active' : ''
                    }
                  >
                    🔐 Dashboard
                  </NavLink>
                </li>
              )}
            </ul>

            <div className="navbar-actions">

              <button
                className="theme-toggle"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {user || isAdmin ? (
                <button
                  className="navbar-shop-login"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              ) : (
                <button
                  className="navbar-shop-login"
                  onClick={() => setLoginOpen(true)}
                >
                  Login
                </button>
              )}

              <button
                className="navbar-cart"
                onClick={() => setCartOpen(true)}
              >
                🛒 <span>Cart</span>
                <b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b>
              </button>

              <button
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span />
                <span />
                <span />
              </button>

            </div>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>

        <button
          className="theme-toggle"
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px'
          }}
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              padding: '12px 40px'
            }}
          >
            🔐 Dashboard
          </NavLink>
        )}

        <Link
          to="/contact"
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
          onClick={() => setMenuOpen(false)}
        >
          Get Started
        </Link>

      </div>
    </>
  )
}