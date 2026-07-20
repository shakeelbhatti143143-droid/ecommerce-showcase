import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Features', to: '/features' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Contact', to: '/contact' },
  ]

  const productLinks = [
    { label: 'Inventory Management', to: '/features' },
    { label: 'Analytics Dashboard', to: '/features' },
    { label: 'Order Tracking', to: '/features' },
    { label: 'Multi-Vendor Support', to: '/features' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Cookie Policy', to: '#' },
    { label: 'GDPR', to: '#' },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '0' }}>
              <div className="navbar-logo-icon">🛒</div>
              Shop<span className="accent">Sphere</span>
            </Link>
            <p>
              The smart e-commerce platform that helps you build, manage, and grow
              your online store with confidence. Trusted by 10,000+ businesses worldwide.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Twitter">🐦</a>
              <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
              <a href="#" className="social-link" aria-label="GitHub">🐙</a>
              <a href="#" className="social-link" aria-label="Instagram">📸</a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              {companyLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              {productLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              {legalLinks.map(link => (
                <li key={link.label}>
                  <a href={link.to}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {year} ShopSphere Inc. All rights reserved.
          </p>
          <p className="footer-copy">
            Built with ❤️ for modern commerce
          </p>
        </div>
      </div>
    </footer>
  )
}
