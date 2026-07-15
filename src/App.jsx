import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Loader from './components/Loader'
import Home from './pages/Home'
import Features from './pages/Features'
import FeatureDetail from './pages/FeatureDetail'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSettings from './pages/admin/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

// Dark Mode Context
export const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/features/:slug" element={<FeatureDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <BackToTop />}
    </>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('shopsphere-theme')
    return saved ? saved === 'dark' : true
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDark)
    localStorage.setItem('shopsphere-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    // Simulate loading time - minimum 1.2 seconds for better UX
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <BrowserRouter>
        {loading && <Loader />}
        <AppContent />
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
