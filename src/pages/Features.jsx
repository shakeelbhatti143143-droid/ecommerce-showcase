import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AnimatedBackground from '../components/AnimatedBackground'
import FeatureCard from '../components/FeatureCard'
import Newsletter from '../components/Newsletter'
import featureDetails from '../data/featureDetails'

const features = featureDetails.map((feature) => ({
  ...feature,
  functionalities: feature.coreFeatures.slice(0, 4).map(([name]) => name),
  to: `/features/${feature.slug}`,
}))

export default function Features() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' })
  }, [])

  return (
    <>
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
            Explore the connected tools that help you run, grow, and optimize your online business.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => <FeatureCard key={feature.slug} {...feature} delay={(index % 3) * 80} />)}
          </div>
        </div>
      </section>

      <section className="feature-detail-cta" data-aos="fade-up">
        <div className="container">
          <span>Built to grow with you</span>
          <h2>Ready to transform your business?</h2>
          <p>Join merchants building better ecommerce experiences with ShopSphere.</p>
          <a href="/contact" className="btn">Start Free Today</a>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
