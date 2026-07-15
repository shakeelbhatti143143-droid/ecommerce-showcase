import React from 'react'

export default function AdminNavbar({ adminName, onLogout }) {
    return (
        <header className="admin-navbar">
            <div className="admin-navbar-left">
                <div className="admin-navbar-logo">🛡️</div>
                <div className="admin-navbar-brand">
                    <h1>Admin Panel</h1>
                </div>
            </div>

            <nav className="admin-navbar-center">
                <a href="/admin/dashboard" className="admin-nav-link">Dashboard</a>
                <a href="/admin/settings" className="admin-nav-link">Settings</a>
                <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link">View Site</a>
            </nav>

            <div className="admin-navbar-right">
                <div className="admin-navbar-user">
                    <div className="admin-avatar-sm">{adminName.charAt(0).toUpperCase()}</div>
                    <span className="admin-navbar-username">{adminName}</span>
                </div>
                <button className="admin-navbar-logout" onClick={onLogout} title="Logout">
                    🚪
                </button>
            </div>
        </header>
    )
}