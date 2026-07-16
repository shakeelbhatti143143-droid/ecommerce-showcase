import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    const auth = localStorage.getItem('admin-auth')

    if (!isAdmin) {
        return <Navigate to="/admin" replace />
    }

    if (!auth) {
        return <Navigate to="/admin" replace />
    }

    try {
        const parsed = JSON.parse(auth)
        if (!parsed.loggedIn) {
            return <Navigate to="/admin" replace />
        }
    } catch {
        return <Navigate to="/admin" replace />
    }

    return children
}