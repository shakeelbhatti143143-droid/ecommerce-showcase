import React, { useEffect, useState } from 'react'

export default function Loader({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 900)

    // After fade-out animation completes, call onComplete to unmount
    const removeTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 1400) // 900ms fade + 500ms transition

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [onComplete])

  return (
    <div className={`loader-overlay ${fadeOut ? 'fade-out' : ''}`} id="page-loader">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div className="navbar-logo-icon" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>🛒</div>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: '1.8rem',
          color: 'var(--text-primary)'
        }}>
          Shop<span style={{ background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sphere</span>
        </span>
      </div>
      <div className="spinner" style={{ marginTop: '24px' }} />
      <span className="loader-text">Loading...</span>
    </div>
  )
}