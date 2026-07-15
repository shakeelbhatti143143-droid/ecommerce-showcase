import React from 'react'

export default function TestimonialCard({ name, role, company, review, rating = 5, initials, delay = 0 }) {
  return (
    <div className="testimonial-card card-3d grid-item-3d" data-aos="fade-up" data-aos-delay={delay}>
      <div className="stars">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
      <p className="testimonial-text">"{review}"</p>
      <div className="testimonial-author">
        <div className="author-avatar-placeholder card-3d-inner">{initials || name[0]}</div>
        <div>
          <div className="author-name">{name}</div>
          <div className="author-role">{role}{company ? `, ${company}` : ''}</div>
        </div>
      </div>
    </div>
  )
}