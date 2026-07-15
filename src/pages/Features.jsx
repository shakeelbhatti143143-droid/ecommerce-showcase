import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AnimatedBackground from '../components/AnimatedBackground'
import FeatureCard from '../components/FeatureCard'
import Newsletter from '../components/Newsletter'

const features = [
  {
    icon: '📦',
    title: 'Smart Inventory Management',
    description: 'Track stock levels in real-time, set automated reorder points, receive low-stock alerts, and sync inventory across all your sales channels effortlessly.',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics Dashboard',
    description: 'Visualize sales trends, customer lifetime value, top-selling products, and revenue forecasts with our beautiful, intuitive dashboard.',
  },
  {
    icon: '🔒',
    title: 'Secure Payment Processing',
    description: 'Accept 50+ payment methods with PCI-DSS Level 1 compliance. Built-in fraud detection protects your store and your customers.',
  },
  {
    icon: '🚚',
    title: 'Real-Time Order Tracking',
    description: 'Keep customers in the loop with automated tracking updates. Integrate with 200+ shipping carriers for seamless fulfillment.',
  },
  {
    icon: '👥',
    title: 'Customer Relationship Management',
    description: 'Build detailed customer profiles, segment your audience, track purchase history, and craft personalized email campaigns.',
  },
  {
    icon: '🏪',
    title: 'Multi-Vendor Marketplace',
    description: 'Turn your store into a marketplace. Invite vendors, manage commissions, automate payouts, and monitor performance from one dashboard.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Recommendations',
    description: 'Boost revenue with AI product recommendations, dynamic pricing suggestions, and automated cross-sell and upsell opportunities.',
  },
  {
    icon: '🌍',
    title: 'Multi-Currency & Multi-Language',
    description: 'Sell globally with automatic currency conversion, localized storefronts, and built-in support for 40+ languages.',
  },
  {
    icon: '📱',
    title: 'Mobile-First Storefront',
    description: 'Every ShopSphere store is optimized for mobile with lightning-fast page loads, PWA support, and native app capabilities.',
  },
  {
    icon: '🔗',
    title: 'API & Integrations',
    description: 'Connect with 500+ apps including Shopify, WooCommerce, Mailchimp, Zapier, Google Analytics, and every major social platform.',
  },
  {
    icon: '🎨',
    title: 'Customizable Themes',
    description: 'Choose from 100+ professionally designed themes or build your own with our no-code drag-and-drop page builder.',
  },
  {
    icon: '📧',
    title: 'Email Marketing',
    description: 'Design, send, and track email campaigns right from your dashboard. Automated flows for cart abandonment, welcome series, and more.',
  },
]

export default function Features() {
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
          <span className="section-label" data-aos="fade-down">Platform Features</span>
          <h1 className="section-title" style={{ marginTop: '12px', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} data-aos="fade-up" data-aos-delay="100">
            Powerful Tools for <span className="gradient-text">Modern Commerce</span>
          </h1>
          <p className="section-desc" style={{ marginTop: '16px' }} data-aos="fade-up" data-aos-delay="200">
            ShopSphere packs every feature you need to run a successful online business
            into one beautifully designed, easy-to-use platform.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={(i % 3) * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        padding: '80px 0',
        textAlign: 'center',
      }} data-aos="fade-up">
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#fff', marginBottom: '16px', fontWeight: 800 }}>
            Ready to Transform Your Business?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px', fontSize: '1.05rem' }}>
            Join 10,000+ merchants who trust ShopSphere to power their online stores.
          </p>
          <a href="/contact" className="btn" style={{
            background: '#fff',
            color: 'var(--accent-primary)',
            fontWeight: 700,
            fontSize: '1rem',
            padding: '14px 36px',
          }}>
            Start Free Today →
          </a>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
