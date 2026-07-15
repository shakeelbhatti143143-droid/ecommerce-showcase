import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTheme } from '../App'
import { useShop } from '../context/ShopContext'

export default function Navbar() {
  const { isDark, setIsDark } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { cart, user, setLoginOpen, setCartOpen } = useShop()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const isLoggedIn = () => {
    const auth = localStorage.getItem('admin-auth')
    if (!auth) return false
    try {
      const parsed = JSON.parse(auth)
      return parsed.loggedIn === true
    } catch {
      return false
    }
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
              <div className="navbar-logo-icon">🛒</div>
              Shop<span className="accent">Sphere</span>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="navbar-links">
              {navLinks.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) => isActive ? 'active' : ''}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  🔐 {isLoggedIn() ? 'Dashboard' : 'Admin'}
                </NavLink>
              </li>
            </ul>

            {/* Actions */}
            <div className="navbar-actions">
              <button
                id="theme-toggle"
                className="theme-toggle"
                onClick={() => setIsDark(!isDark)}
                aria-label="Toggle theme"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button className="navbar-shop-login" onClick={() => setLoginOpen(true)}>{user ? `Hi, ${user.account_name}` : 'Login'}</button>
              <button className="navbar-cart" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${cart.length} items`}>🛒 <span>Cart</span><b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b></button>
              <button
                id="hamburger-btn"
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle mobile menu"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <button
          className="theme-toggle"
          style={{ position: 'absolute', top: '24px', right: '24px' }}
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
        <NavLink
          to="/admin"
          onClick={() => setMenuOpen(false)}
          style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', padding: '12px 40px' }}
        >
          🔐 {isLoggedIn() ? 'Dashboard' : 'Admin'}
        </NavLink>
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
