import React, { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AnimatedBackground from '../components/AnimatedBackground'
import { getFeatureBySlug } from '../data/featureDetails'

function DashboardPreview({ feature }) {
  return (
    <div className="feature-dashboard" aria-label={`${feature.title} dashboard preview`}>
      <div className="feature-dashboard-topbar">
        <div className="feature-window-dots"><span /><span /><span /></div>
        <span>ShopSphere / {feature.title}</span>
        <span className="feature-live-dot">Live</span>
      </div>
      <div className="feature-dashboard-body">
        <aside>
          <div className="dashboard-brand">S</div>
          {[1, 2, 3, 4].map((item) => <i key={item} />)}
        </aside>
        <div className="feature-dashboard-content">
          <div className="dashboard-content-heading">
            <div><small>Overview</small><strong>{feature.title}</strong></div>
            <button type="button">Export</button>
          </div>
          <div className="dashboard-stat-row">
            {feature.stats.slice(0, 3).map(([value, label]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}
          </div>
          <div className="dashboard-chart"><div className="chart-line" />{[38, 62, 48, 78, 58, 86, 70, 96].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
          <div className="dashboard-list">
            {feature.dashboard.map((item, index) => <div key={item}><span className={`dashboard-list-icon icon-${index}`} />{item}<b>{index % 2 === 0 ? 'Active' : 'Updated'}</b></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FeatureDetail() {
  const { slug } = useParams()
  const feature = getFeatureBySlug(slug)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => { AOS.init({ duration: 650, once: true, easing: 'ease-out-cubic' }) }, [])
  if (!feature) return <Navigate to="/features" replace />
  const faqs = [...feature.faqs, ...sharedFallbackFaqs(feature)]

  return (
    <>
      <section className="feature-detail-hero">
        <AnimatedBackground />
        <div className="feature-detail-orb orb-one" /><div className="feature-detail-orb orb-two" />
        <div className="container feature-detail-hero-grid">
          <div data-aos="fade-up">
            <Link to="/features" className="feature-breadcrumb">← All features</Link>
            <span className="section-label">{feature.eyebrow}</span>
            <div className="feature-detail-icon">{feature.icon}</div>
            <h1>{feature.title}</h1>
            <h2>{feature.tagline}</h2>
            <p>{feature.description}</p>
            <div className="feature-detail-actions"><Link className="btn btn-primary btn-lg" to="/contact">Get Started Free</Link><a className="btn btn-secondary btn-lg" href="#dashboard-preview">Explore dashboard</a></div>
          </div>
          <div data-aos="fade-left" data-aos-delay="100"><DashboardPreview feature={feature} /></div>
        </div>
      </section>

      <section className="section feature-overview-section">
        <div className="container feature-overview-grid">
          <div data-aos="fade-up"><span className="section-label">Overview</span><h2 className="section-title">Built for clearer, <span className="gradient-text">faster work</span></h2></div>
          <p data-aos="fade-up" data-aos-delay="80">{feature.overview}</p>
        </div>
      </section>

      <section className="section feature-core-section">
        <div className="container"><div className="section-header" data-aos="fade-up"><span className="section-label">Core capabilities</span><h2 className="section-title">Everything you need, <span className="gradient-text">in one place</span></h2></div><div className="feature-core-grid">{feature.coreFeatures.map(([name, text], index) => <article className="feature-core-card" key={name} data-aos="fade-up" data-aos-delay={(index % 3) * 70}><span>0{index + 1}</span><h3>{name}</h3><p>{text}</p></article>)}</div></div>
      </section>

      <section className="section feature-workflow-section">
        <div className="container feature-workflow-grid"><div><span className="section-label">How it works</span><h2 className="section-title">Simple by design. <span className="gradient-text">Powerful in practice.</span></h2><p className="section-desc">A streamlined workflow gives your team clarity at every step.</p></div><ol className="feature-steps">{feature.steps.map((step, index) => <li key={step} data-aos="fade-left" data-aos-delay={index * 60}><span>{index + 1}</span><p>{step}</p></li>)}</ol></div>
      </section>

      <section className="section" id="dashboard-preview"><div className="container"><div className="section-header" data-aos="fade-up"><span className="section-label">Dashboard preview</span><h2 className="section-title">See the full picture <span className="gradient-text">at a glance</span></h2><p className="section-desc">A focused workspace puts the metrics and actions that matter within reach.</p></div><div data-aos="zoom-in"><DashboardPreview feature={feature} /></div></div></section>

      <section className="feature-stat-section"><div className="container feature-stat-grid">{feature.stats.map(([value, label], index) => <div key={label} data-aos="fade-up" data-aos-delay={index * 60}><strong>{value}</strong><span>{label}</span></div>)}</div></section>

      <section className="section"><div className="container feature-benefits-grid"><div><span className="section-label">Business benefits</span><h2 className="section-title">A better way to <span className="gradient-text">grow</span></h2><p className="section-desc">Designed to remove friction for your team and create a better experience for every customer.</p></div><ul>{feature.benefits.map((benefit) => <li key={benefit}>✓ <span>{benefit}</span></li>)}</ul></div></section>

      <section className="section feature-faq-section"><div className="container feature-faq-layout"><div><span className="section-label">Frequently asked questions</span><h2 className="section-title">Questions, <span className="gradient-text">answered</span></h2></div><div className="faq-list">{faqs.map((faq, index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={faq.question}><button className="faq-question" type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{faq.question}</span><i className="faq-icon">+</i></button><div className="faq-answer"><p>{faq.answer}</p></div></div>)}</div></div></section>

      <section className="feature-detail-cta"><div className="container"><span>{feature.eyebrow}</span><h2>Ready to make {feature.title.toLowerCase()} simpler?</h2><p>Build a more connected, confident ecommerce operation with ShopSphere.</p><Link className="btn" to="/contact">Get Started</Link></div></section>
    </>
  )
}

function sharedFallbackFaqs(feature) {
  return [{ question: `Who can use ${feature.title}?`, answer: `It is designed for growing ecommerce teams that want a simpler, more connected way to run ${feature.title.toLowerCase()}.` }]
}
