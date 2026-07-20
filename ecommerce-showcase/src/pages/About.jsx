import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import AnimatedBackground from '../components/AnimatedBackground'
import Newsletter from '../components/Newsletter'

const aboutContact = [
  { icon: '📍', title: 'Location', value: 'Islamabad, Chak Shazad, Frosted Tech' },
  { icon: '📧', title: 'Email', value: 'shakeelbhatti143143@gmail.com' },
  { icon: '📞', title: 'Call Us', value: '0319-9476936' },
]

const team = [
  { initials: 'ZA', name: 'Zara Alvi', role: 'CEO & Co-Founder', bio: 'Ex-Shopify engineer with 12 years in e-commerce. Passionate about democratizing online retail for everyone.' },
  { initials: 'KM', name: 'Kamran Mirza', role: 'CTO & Co-Founder', bio: 'Full-stack architect who built scalable systems at Amazon and Stripe before co-founding ShopSphere.' },
  { initials: 'FS', name: 'Fatima Siddiqui', role: 'Head of Design', bio: 'Award-winning UX designer with a belief that great software should be invisible — powerful yet effortless.' },
  { initials: 'AK', name: 'Amir Khan', role: 'Head of Growth', bio: 'Growth hacker who scaled three startups from zero to 100K users. Obsessed with data, storytelling, and coffee.' },
]

const values = [
  { icon: '🚀', title: 'Move Fast', text: 'We ship fast, iterate often, and believe that done is better than perfect. Speed is our competitive advantage.' },
  { icon: '💡', title: 'Customer Obsessed', text: 'Every decision starts with the customer. We build what our merchants need, not what we think they need.' },
  { icon: '🔓', title: 'Radical Transparency', text: 'We share our wins and our losses openly. Trust is built through honesty, and we\'re committed to it.' },
  { icon: '🌱', title: 'Grow Together', text: 'When our merchants grow, we grow. We\'re invested in the success of every store on our platform.' },
]

const milestones = [
  { year: '2020', event: 'ShopSphere founded in a Karachi garage by two engineers frustrated with existing platforms' },
  { year: '2021', event: 'First 100 paying customers. Raised $1.2M seed round from regional angels and tech funds' },
  { year: '2022', event: 'Launched Multi-Vendor marketplace feature. Reached 1,000 active stores' },
  { year: '2023', event: 'Series A: $8M raised. Expanded team to 45 people across 3 countries' },
  { year: '2024', event: 'Launched AI-powered analytics. Crossed 10,000 merchants and $50M GMV processed' },
  { year: '2025', event: 'Named "Best E-Commerce Platform" by TechReview Asia. Expanding to 15 new markets' },
]

export default function About() {
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
          <span className="section-label" data-aos="fade-down">Our Story</span>
          <h1 className="section-title" style={{ marginTop: '12px', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} data-aos="fade-up" data-aos-delay="100">
            We're on a Mission to <span className="gradient-text">Democratize Commerce</span>
          </h1>
          <p className="section-desc" style={{ marginTop: '16px' }} data-aos="fade-up" data-aos-delay="200">
            ShopSphere started with a simple idea: every entrepreneur deserves
            world-class tools to compete online, regardless of their size or budget.
          </p>
        </div>
      </section>

      {/* Mission & Vision + Contact Info */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card" data-aos="fade-right">
              <div className="mission-icon">🎯</div>
              <h2 className="mission-title">Our Mission</h2>
              <p className="mission-text">
                To empower every entrepreneur — from solo sellers to global brands — with
                the technology, insights, and tools they need to build thriving online businesses.
                We believe commerce should be accessible, fair, and exciting for everyone.
              </p>
            </div>
            <div className="mission-card" data-aos="fade-left">
              <div className="mission-icon">🔭</div>
              <h2 className="mission-title">Our Vision</h2>
              <p className="mission-text">
                A world where anyone with a great product idea can reach global customers
                within minutes. We're building toward a future where the playing field is
                level — where a maker in Lahore can compete with a brand from New York.
              </p>
            </div>
          </div>

          {/* Contact Info Section */}
          <div style={{ marginTop: '48px' }} data-aos="fade-up">
            <div className="section-header" style={{ marginBottom: '32px' }}>
              <span className="section-label">Our Office</span>
              <h2 className="section-title">Get in <span className="gradient-text">Touch</span></h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              {aboutContact.map((item) => (
                <div key={item.title} className="admin-stat-card" style={{ cursor: 'default' }}>
                  <div className="admin-stat-icon" style={{
                    background: 'rgba(124,58,237,0.12)',
                    color: 'var(--accent-primary)',
                    fontSize: '1.8rem'
                  }}>
                    {item.icon}
                  </div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-label">{item.title}</span>
                    <span className="admin-stat-value" style={{ fontSize: '1rem', fontWeight: 600 }}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Timeline</span>
            <h2 className="section-title">Our <span className="gradient-text">Journey</span></h2>
          </div>

          <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
            {/* Timeline Line */}
            <div style={{
              position: 'absolute',
              left: '60px',
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'linear-gradient(to bottom, var(--accent-primary), transparent)',
            }} />

            {milestones.map((m, i) => (
              <div
                key={m.year}
                style={{ display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'flex-start' }}
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <div style={{
                  minWidth: '60px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: 'var(--accent-tertiary)',
                  paddingTop: '4px',
                  textAlign: 'right',
                }}>{m.year}</div>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--gradient-hero)',
                  flexShrink: 0,
                  marginTop: '6px',
                  boxShadow: '0 0 0 4px rgba(124,58,237,0.2)',
                }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, paddingTop: '2px' }}>
                  {m.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">Values</span>
            <h2 className="section-title">What We <span className="gradient-text">Stand For</span></h2>
          </div>

          <div className="features-grid">
            {values.map((v, i) => (
              <div key={v.title} className="feature-card" data-aos="fade-up" data-aos-delay={i * 80}>
                <div className="feature-icon" style={{ fontSize: '1.8rem' }}>{v.icon}</div>
                <h3 className="feature-title">{v.title}</h3>
                <p className="feature-desc">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <span className="section-label">The Team</span>
            <h2 className="section-title">Meet the <span className="gradient-text">Builders</span></h2>
            <p className="section-desc">
              A passionate team of engineers, designers, and commerce experts
              united by one goal: making online selling simpler.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, i) => (
              <div key={member.name} className="team-card" data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="team-avatar">{member.initials}</div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
