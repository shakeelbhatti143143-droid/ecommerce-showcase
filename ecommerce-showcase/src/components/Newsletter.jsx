import React, { useState } from 'react'
import { safeInsert } from '../services/supabase'
import { saveNewsletterLocally } from '../services/localStore'

function Toast({ msg, type, show }) {
  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`} id="newsletter-toast">
      <span className="toast-icon">{type === 'success' ? '✅' : '❌'}</span>
      <span className="toast-msg">{msg}</span>
    </div>
  )
}

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 4000)
  }

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const emailLower = email.trim().toLowerCase()
    try {
      // Always save locally so admin sees it immediately
      const localResult = saveNewsletterLocally({ email: emailLower })

      const { error: sbError } = await safeInsert('newsletter', { email: emailLower })

      if (sbError) {
        if (sbError.code === '23505' || localResult?.duplicate) {
          showToast('You are already subscribed! 🎉', 'success')
        } else {
          throw sbError
        }
      } else {
        showToast('Successfully subscribed! Welcome to ShopSphere. 🚀', 'success')
        setEmail('')
      }
    } catch (err) {
      console.error('Newsletter error:', err)
      showToast(err.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="newsletter-section" id="newsletter">
        <div className="container">
          <div className="newsletter-inner" data-aos="fade-up">
            <span className="section-label">Newsletter</span>
            <h2 className="section-title" style={{ marginTop: '12px' }}>
              Stay Ahead of the Curve
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.7 }}>
              Get the latest e-commerce tips, platform updates, and exclusive offers
              delivered straight to your inbox. Join 5,000+ store owners.
            </p>

            <form className="newsletter-form" onSubmit={handleSubmit} id="newsletter-form" noValidate>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="Enter your email address"
                  disabled={loading}
                  className={error ? 'error' : ''}
                  aria-label="Email address for newsletter"
                />
                {error && <span style={{ fontSize: '0.78rem', color: '#f87171', textAlign: 'left' }}>⚠ {error}</span>}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                id="newsletter-submit"
                style={{ whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Subscribing...' : 'Subscribe →'}
              </button>
            </form>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              🔒 No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <Toast {...toast} />
    </>
  )
}
