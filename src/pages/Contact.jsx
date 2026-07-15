import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AnimatedBackground from '../components/AnimatedBackground'
import ContactForm from '../components/ContactForm'

const contactInfo = [
  { icon: '📍', title: 'Our Office', value: 'Islamabad, Chak Shazad, Frosted Tech' },
  { icon: '📧', title: 'Email Us', value: 'shakeelbhatti143143@gmail.com' },
  { icon: '📞', title: 'Call Us', value: '0319-9476936' },
  { icon: '🕒', title: 'Business Hours', value: 'Mon – Fri, 9:00 AM – 6:00 PM PKT' },
]

export default function Contact() {
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
          <span className="section-label" data-aos="fade-down">Get In Touch</span>
          <h1
            className="section-title"
            style={{ marginTop: '12px', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            We'd Love to <span className="gradient-text">Hear From You</span>
          </h1>
          <p className="section-desc" style={{ marginTop: '16px' }} data-aos="fade-up" data-aos-delay="200">
            Have a question, want a demo, or just want to say hello?
            Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="contact-grid">
            {/* Left — Info */}
            <div data-aos="fade-right">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '32px', color: 'var(--text-primary)' }}>
                Contact Information
              </h2>

              {contactInfo.map((info) => (
                <div key={info.title} className="contact-info-item">
                  <div className="contact-info-icon">{info.icon}</div>
                  <div>
                    <div className="contact-info-title">{info.title}</div>
                    <div className="contact-info-value">{info.value}</div>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Follow Us
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['🐦', '💼', '🐙', '📸'].map((icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="social-link"
                      style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <div style={{
                marginTop: '40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                color: 'var(--text-muted)',
              }}>
                <span style={{ fontSize: '2rem' }}>🗺️</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Karachi, Pakistan</span>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--accent-tertiary)', textDecoration: 'none' }}
                >
                  View on Google Maps →
                </a>
              </div>
            </div>

            {/* Right — Form */}
            <div
              data-aos="fade-left"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '40px',
              }}
            >
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Send Us a Message
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(99,102,241,0.05) 100%)',
        borderTop: '1px solid var(--border-color)',
        padding: '64px 0',
        textAlign: 'center',
      }}>
        <div className="container" data-aos="fade-up">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
            Join thousands of merchants already growing with ShopSphere.
          </p>
          <a href="/" className="btn btn-primary btn-lg">
            Start Free Today 🚀
          </a>
        </div>
      </section>
    </>
  )
}
