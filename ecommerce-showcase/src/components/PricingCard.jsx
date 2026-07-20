import React from 'react'
import { Link } from 'react-router-dom'

export default function PricingCard({ plan, price, period, features, highlighted, badge, delay = 0 }) {
  return (
    <div
      className={`pricing-card ${highlighted ? 'featured' : ''} card-3d grid-item-3d`}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      {badge && <div className="pricing-badge shimmer-effect">{badge}</div>}

      <div className="pricing-plan">{plan}</div>

      <div className="pricing-price">
        {price === 'Custom' ? (
          <span style={{ fontSize: '2rem' }}>Custom</span>
        ) : (
          <>
            <sup>$</sup>{price}
          </>
        )}
      </div>
      <div className="pricing-period">
        {price === 'Custom' ? 'Contact us for pricing' : `per ${period || 'month'}`}
      </div>

      <div className="pricing-divider" />

      <ul className="pricing-features">
        {features.map((feature, i) => (
          <li key={i}>
            <span className={feature.included ? 'check' : 'cross'}>
              {feature.included ? '✓' : '✕'}
            </span>
            <span style={{ color: feature.included ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to="/contact"
        className={`btn ${highlighted ? 'btn-primary' : 'btn-secondary'}`}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
      </Link>
    </div>
  )
}
