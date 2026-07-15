import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error handler to help debug blank page issues
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', message, 'at', source + ':' + lineno + ':' + colno, error)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
