import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AnimatedBackground from '../components/AnimatedBackground'
import FeatureCard from '../components/FeatureCard'
import TestimonialCard from '../components/TestimonialCard'
import Stats from '../components/Stats'
import FAQ from '../components/FAQ'
import Newsletter from '../components/Newsletter'
import { getSiteContent } from '../services/localStore'

const features = [
  {
    icon: '📦',
    title: 'Inventory Management',
    description: 'Track stock levels, set reorder alerts, and manage your product catalog with ease. Real-time sync across all sales channels.',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Gain deep insights into your store performance with beautiful charts, revenue reports, and customer behavior analytics.',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    description: 'PCI-DSS compliant payment processing. Accept 50+ payment methods including cards, PayPal, Apple Pay, and crypto.',
  },
  {
    icon: '🚚',
    title: 'Order Tracking',
    description: 'Real-time order tracking from checkout to doorstep. Automated email notifications keep customers informed every step.',
  },
  {
    icon: '👥',
    title: 'Customer Management',
    description: 'Build lasting relationships with a full CRM. Segment customers, track purchase history, and run targeted campaigns.',
  },
  {
    icon: '🏪',
    title: 'Multi-Vendor Support',
    description: 'Launch a marketplace with multiple sellers. Manage commissions, payouts, and vendor performance from one dashboard.',
  },
]

const testimonials = [
  {
    name: 'HASEEB',
    role: 'CEO',
    company: 'FROSTED TECH',
    initials: 'AH',
    review: 'ShopSphere completely transformed our business. We went from struggling with outdated tools to having a modern, efficient platform that our team loves. Revenue up 340% in 6 months.',
    rating: 5,
  },
  {
    name: 'WAHAJ QURESHI',
    role: 'Co-Founder',
    company: 'FROSTED TECH',
    initials: 'SA',
    review: 'The analytics dashboard alone is worth the subscription price. We finally understand our customers and can make data-driven decisions. Incredible product!',
    rating: 5,
  },
  {
    name: 'MAHEEN',
    role: 'MANAGER',
    company: 'FROSTED TECH',
    initials: 'OK',
    review: 'Setup was effortless and the support team is world-class. The inventory tracking has saved us thousands of dollars in overstock and stockouts. Highly recommended!',
    rating: 5,
  },
]

export default function Home() {
  const [content, setContent] = useState({ hero_title: 'Build Your <span class="gradient-text">Online Store</span> Faster Than Ever', hero_subtitle: 'ShopSphere is the all-in-one e-commerce platform that gives you everything you need to sell online, grow your brand, and delight your customers.', cta_text: '🚀 Get Started Free' })

  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' })

    const load = () => {
      const home = getSiteContent().home
      if (home) setContent(home)
    }
    load()
    const handler = (e) => { if (e.detail && e.detail.section === 'home') load() }
    window.addEventListener('shopsphere-content-update', handler)
    return () => window.removeEventListener('shopsphere-content-update', handler)
  }, [])

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" id="hero">
        {/* 3D Animated Background */}
        <AnimatedBackground />
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="morphing-blob blob-1" />
        <div className="morphing-blob blob-2" />
        <div className="morphing-blob blob-3" />
        <div className="floating-icons"></div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <div>
            <div className="hero-badge" data-aos="fade-down">
              <div className="hero-badge-dot" />
              Now with AI-Powered Insights
            </div>

            <h1 className="hero-title" data-aos="fade-up" data-aos-delay="100">
              {content.hero_title ? content.hero_title.split('<span')[0] : 'Build Your'}
              {content.hero_title && content.hero_title.includes('gradient-text') ? (
                <span className="gradient-text" dangerouslySetInnerHTML={{ __html: content.hero_title.match(/<span[^>]*>(.*?)<\/span>/)?.[1] || 'Online Store' }} />
              ) : (
                <span className="gradient-text">Online Store</span>
              )}
              {content.hero_title ? content.hero_title.split('</span>')[1] || ' Faster Than Ever' : ' Faster Than Ever'}
            </h1>

            <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
              {content.hero_subtitle || 'ShopSphere is the all-in-one e-commerce platform that gives you everything you need to sell online, grow your brand, and delight your customers.'}
            </p>

            <div className="hero-actions" data-aos="fade-up" data-aos-delay="300">
              <Link to="/contact" className="btn btn-primary btn-lg" id="hero-cta-start">
                {content.cta_text || '🚀 Get Started Free'}
              </Link>
              <Link to="/features" className="btn btn-secondary btn-lg" id="hero-cta-learn">
                Learn More →
              </Link>
            </div>

            <div className="hero-stats" data-aos="fade-up" data-aos-delay="400">
              <div className="hero-stat">
                <span className="hero-stat-num">10K+</span>
                <span className="hero-stat-label">Users</span>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }} />
              <div className="hero-stat">
                <span className="hero-stat-num">500+</span>
                <span className="hero-stat-label">Stores</span>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }} />
              <div className="hero-stat">
                <span className="hero-stat-num">98%</span>
                <span className="hero-stat-label">Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Right — Mockup */}
          <div className="hero-visual" data-aos="fade-left" data-aos-delay="200">
            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <div className="mockup-dot" style={{ background: '#ef4444' }} />
                  <div className="mockup-dot" style={{ background: '#f59e0b' }} />
                  <div className="mockup-dot" style={{ background: '#10b981' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  ShopSphere Dashboard
                </span>
              </div>

              {/* Chart */}
              <div className="mockup-chart">
                {[35, 60, 45, 80, 55, 90, 70, 95, 65, 100].map((h, i) => (
                  <div
                    key={i}
                    className="mockup-bar"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>

              {/* Stats */}
              <div className="mockup-stats">
                <div className="mockup-stat-box">
                  <div className="mockup-stat-label">Revenue</div>
                  <div className="mockup-stat-value">$48.2K</div>
                </div>
                <div className="mockup-stat-box">
                  <div className="mockup-stat-label">Orders</div>
                  <div className="mockup-stat-value">1,284</div>
                </div>
                <div className="mockup-stat-box">
                  <div className="mockup-stat-label">Customers</div>
                  <div className="mockup-stat-value">892</div>
                </div>
                <div className="mockup-stat-box">
                  <div className="mockup-stat-label">Conversion</div>
                  <div className="mockup-stat-value">3.8%</div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="hero-float-badge hero-float-badge-1">
              ✅ New order — $249.00
            </div>
            <div className="hero-float-badge hero-float-badge-2">
              📈 Sales up 34% this week
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <Stats />

      {/* ── Features Preview ── */}
      <section className="section dot-pattern-bg" id="features-preview" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="section-floating-orb orb-a" />
        <div className="section-floating-orb orb-b" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Features</span>
            <h2 className="section-title">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="section-desc">
              From your first sale to your millionth, ShopSphere grows with you.
              Powerful tools, simple interface.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }} data-aos="fade-up">
            <Link to="/features" className="btn btn-ghost">
              View All Features →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section" id="testimonials" style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        <div className="section-corner-decor top-left" />
        <div className="section-corner-decor bottom-right" />
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Testimonials</span>
            <h2 className="section-title">
              Loved by <span className="gradient-text">10,000+ Merchants</span>
            </h2>
            <p className="section-desc">
              Don't just take our word for it. See what real business owners say about ShopSphere.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Newsletter ── */}
      <Newsletter />
    </>
  )
}
