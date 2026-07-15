import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const ADMIN_EMAIL = 'shakeelbhatti1431432@gmail.com'
    const ADMIN_PASSWORD = '1234qwerty'
    const ADMIN_NAME = 'Shakeel'

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.')
            return
        }

        setLoading(true)

        // Simulate auth delay
        setTimeout(() => {
            if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                localStorage.setItem('admin-auth', JSON.stringify({
                    name: ADMIN_NAME,
                    email: ADMIN_EMAIL,
                    loggedIn: true,
                    timestamp: Date.now()
                }))
                navigate('/admin/dashboard')
            } else {
                setError('Invalid email or password. Access denied.')
                setLoading(false)
            }
        }, 800)
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-header">
                    <div className="admin-login-icon">🛡️</div>
                    <h1>Admin Portal</h1>
                    <p>Enter your credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
                    {error && (
                        <div className="admin-login-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="admin-email">Email Address</label>
                        <input
                            id="admin-email"
                            type="email"
                            className="form-input"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError('') }}
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="admin-password">Password</label>
                        <input
                            id="admin-password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError('') }}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? '⏳ Verifying...' : '🔐 Access Dashboard'}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <a href="/" className="admin-back-link">← Back to Home</a>
                </div>
            </div>
        </div>
    )
}