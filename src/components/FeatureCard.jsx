import React, { useRef, useState } from 'react'

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  const cardRef = useRef(null)
  const [style, setStyle] = useState({})

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8

    // Calculate light position for glare effect
    const percentX = (x / rect.width) * 100
    const percentY = (y / rect.height) * 100

    setStyle({
      transform: `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.03)`,
      background: `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(139, 92, 246, 0.18) 0%, rgba(19, 19, 31, 0.95) 55%)`,
      borderColor: 'rgba(212, 205, 229, 0.6)',
      boxShadow: `0 25px 50px rgba(90, 77, 113, 0.3), ${rotateY * 0.8}px ${rotateX * 0.8}px 30px rgba(124, 58, 237, 0.2)`,
    })
  }

  const handleMouseLeave = () => {
    setStyle({})
  }

  return (
    <div
      ref={cardRef}
      className="feature-card card-3d grid-item-3d"
      data-aos="fade-up"
      data-aos-delay={delay}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), background 0.4s ease, border-color 0.4s ease, box-shadow 0.5s ease',
      }}
    >
      <div className="feature-icon card-3d-inner">
        <span className="feature-icon-glow">{icon}</span>
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
      <div className="feature-shine" />
    </div>
  )
}