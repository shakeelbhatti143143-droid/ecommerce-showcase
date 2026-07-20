import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AnimatedBackground from '../components/AnimatedBackground'
import PricingCard from '../components/PricingCard'
import FAQ from '../components/FAQ'

const plans = [
  {
    plan: 'Starter',
    price: '0',
    features: [
      { label: 'Up to 5 Products', included: true },
      { label: 'Basic Analytics', included: true },
      { label: 'Email Support', included: true },
      { label: '2% Transaction Fee', included: true },
      { label: 'Custom Domain', included: false },
      { label: 'Advanced Reports', included: false },
      { label: 'Multi-Vendor', included: false },
      { label: 'Priority Support', included: false },
    ],
    highlighted: false,
    delay: 0,
  },
  {
    plan: 'Professional',
    price: '29',
    badge: 'Most Popular',
    features: [
      { label: 'Unlimited Products', included: true },
      { label: 'Advanced Analytics', included: true },
      { label: 'Priority Support', included: true },
      { label: '0.5% Transaction Fee', included: true },
      { label: 'Custom Domain', included: true },
      { label: 'Advanced Reports', included: true },
      { label: 'Multi-Vendor (up to 5)', included: true },
      { label: 'Dedicated Account Manager', included: false },
    ],
    highlighted: true,
    delay: 100,
  },
  {
    plan: 'Enterprise',
    price: 'Custom',
    features: [
      { label: 'Unlimited Everything', included: true },
      { label: 'Custom Analytics', included: true },
      { label: '24/7 Phone Support', included: true },
      { label: '0% Transaction Fee', included: true },
      { label: 'Custom Domain', included: true },
      { label: 'Custom Reports & API', included: true },
      { label: 'Unlimited Vendors', included: true },
      { label: 'Dedicated Account Manager', included: true },
    ],
    highlighted: false,
    delay: 200,
  },
]

const comparison = [
  { feature: 'Products', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Transaction Fee', starter: '2%', pro: '0.5%', enterprise: '0%' },
  { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
  { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: '24/7 Phone' },
  { feature: 'Custom Domain', starter: '✕', pro: '✓', enterprise: '✓' },
  { feature: 'Multi-Vendor', starter: '✕', pro: '5 vendors', enterprise: 'Unlimited' },
  { feature: 'API Access', starter: '✕', pro: '✓', enterprise: '✓' },
]

export default function Pricing() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' })
  }, [])

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <AnimatedBackground />
        <div className="morphing-blob blob-1" />
        <div className="morphing-blob blob-2" />
        <div className="container">
          <span className="section-label" data-aos="fade-down">Pricing</span>
          <h1 className="section-title" style={{ marginTop: '12px', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} data-aos="fade-up" data-aos-delay="100">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h1>
          <p className="section-desc" style={{ marginTop: '16px' }} data-aos="fade-up" data-aos-delay="200">
            No hidden fees. No surprise charges. Start free, upgrade when you're ready.
            All plans include a 30-day money-back guarantee.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="pricing-grid">
            {plans.map((plan) => (
              <PricingCard key={plan.plan} {...plan} />
            ))}
          </div>

          {/* Trust Signals */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginTop: '48px',
            flexWrap: 'wrap',
          }} data-aos="fade-up">
            {['💳 No credit card required', '🔄 30-day money back', '🔒 SSL secure checkout', '🚫 Cancel anytime'].map(s => (
              <span key={s} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section" style={{ background: 'var(--bg-secondary)', paddingTop: '64px' }}>
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Compare Plans</span>
            <h2 className="section-title">Feature Comparison</h2>
          </div>

          <div data-aos="fade-up" data-aos-delay="100" style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
            }}>
              <thead>
                <tr>
                  <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', background: 'rgba(124,58,237,0.05)' }}>Feature</th>
                  {['Starter', 'Professional', 'Enterprise'].map(p => (
                    <th key={p} style={{ padding: '20px 24px', textAlign: 'center', color: p === 'Professional' ? 'var(--accent-tertiary)' : 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', background: 'rgba(124,58,237,0.05)' }}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature}>
                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: i < comparison.length - 1 ? '1px solid var(--border-color)' : 'none', fontWeight: 500 }}>{row.feature}</td>
                    {[row.starter, row.pro, row.enterprise].map((val, j) => (
                      <td key={j} style={{
                        padding: '16px 24px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: val === '✕' ? 'var(--text-muted)' : val === '✓' ? '#10b981' : 'var(--text-primary)',
                        borderBottom: i < comparison.length - 1 ? '1px solid var(--border-color)' : 'none',
                        background: j === 1 ? 'rgba(124,58,237,0.04)' : 'transparent',
                      }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </>
  )
}
