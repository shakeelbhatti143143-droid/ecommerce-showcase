import React, { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../App'
import { useShop } from '../context/ShopContext'
import { supabase } from '../assets/subabaseclient'

export default function Navbar() {
  const { isDark, setIsDark } = useTheme()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const {
    cart,
    user,
    setUser,
    setCartOpen,
  } = useShop()

  const [supaUser, setSupaUser] = useState(null)

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

  // Check Supabase auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSupaUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupaUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
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

  const isLoggedIn = !!(supaUser || user)

  // Get display name and avatar from user object
  const displayName = user?.name || user?.account_name || supaUser?.user_metadata?.full_name || supaUser?.email?.split('@')[0] || 'User'
  const avatarUrl = user?.avatar_url || supaUser?.user_metadata?.avatar_url || ''
  const avatarInitial = (displayName || 'U').charAt(0).toUpperCase()

  return (
    <>
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only">Skip to main content</a>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="navbar-inner">

            <Link
              to="/"
              className="navbar-logo"
              onClick={() => setMenuOpen(false)}
              aria-label="ShopSphere Home"
            >
              <div className="navbar-logo-icon">🛒</div>
              Shop<span className="accent">Sphere</span>
            </Link>

            <ul className="navbar-links" aria-label="Primary">
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
                aria-label="Toggle theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {isLoggedIn ? (
                <div className="navbar-user-menu">
                  <button
                    className="navbar-user-btn"
                    onClick={() => navigate('/user-dashboard')}
                  >
                    <div className="navbar-user-avatar">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} />
                      ) : (
                        <span className="navbar-user-initial">{avatarInitial}</span>
                      )}
                    </div>
                    <span className="navbar-user-name">{displayName}</span>
                  </button>
                  <div className="navbar-user-dropdown">
                    <button onClick={() => { navigate('/user-dashboard'); setMenuOpen(false) }}>Dashboard</button>
                    <button onClick={() => { navigate('/my-orders'); setMenuOpen(false) }}>My Orders</button>
                  </div>
                </div>
              ) : (
                <button
                  className="navbar-shop-login"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              )}

              {isLoggedIn && (
                <button
                  className="navbar-cart"
                  onClick={() => setCartOpen(true)}
                >
                  🛒 <span>Cart</span>
                  <b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b>
                </button>
              )}

              <button
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <span />
                <span />
                <span />
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={`mobile-nav ${menuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <button
          className="theme-toggle"
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px'
          }}
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle theme"
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

        {isLoggedIn ? (
          <>
            <div className="mobile-user-info">
              <div className="navbar-user-avatar large">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} />
                ) : (
                  <span className="navbar-user-initial">{avatarInitial}</span>
                )}
              </div>
              <span className="mobile-user-name">{displayName}</span>
            </div>
            <NavLink
              to="/user-dashboard"
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '12px 40px'
              }}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/my-orders"
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '12px 40px'
              }}
            >
              My Orders
            </NavLink>
          </>
        ) : (
          <Link
            to="/login"
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        )}
      </div>
    </>
  )
}