import React from 'react'
import adminProfileImage from '../../assets/admin-profile.jpg'

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
                    <img className="admin-avatar-sm" src={adminProfileImage} alt={`${adminName}'s profile`} />
                    <span className="admin-navbar-username">{adminName}</span>
                </div>
                <button className="admin-navbar-logout" onClick={onLogout} title="Logout">
                    🚪
                </button>
            </div>
        </header>
    )
}
