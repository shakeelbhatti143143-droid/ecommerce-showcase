import React, { useState } from 'react'

const faqs = [
  {
    q: 'What is ShopSphere?',
    a: 'ShopSphere is a modern, all-in-one e-commerce platform designed to help businesses build, manage, and scale their online stores. From inventory management to analytics, we provide all the tools you need to succeed in digital commerce.'
  },
  {
    q: 'How secure is ShopSphere?',
    a: 'Security is our top priority. ShopSphere uses bank-level 256-bit SSL encryption, PCI-DSS compliant payment processing, two-factor authentication, and regular security audits to keep your store and customer data safe.'
  },
  {
    q: 'Do you offer customer support?',
    a: 'Absolutely! All plans include email support. Professional and Enterprise plans get priority support with faster response times. Enterprise clients also receive a dedicated account manager and 24/7 phone support.'
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel at any time with no cancellation fees. Your store will remain active until the end of your current billing period. We also offer a 30-day money-back guarantee on all paid plans.'
  },
  {
    q: 'Does ShopSphere support multiple vendors?',
    a: 'Yes! Our Professional and Enterprise plans include multi-vendor marketplace support, allowing you to manage multiple sellers, commission structures, and payouts from a single dashboard.'
  },
  {
    q: 'Can I migrate my existing store to ShopSphere?',
    a: 'Absolutely! We offer free store migration assistance for Professional and Enterprise customers. Our team will help you migrate products, customer data, and order history from platforms like Shopify, WooCommerce, or Magento.'
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">
            Everything you need to know about ShopSphere. Can't find what you're looking for?{' '}
            <a href="/contact" style={{ color: 'var(--accent-tertiary)' }}>Contact our team.</a>
          </p>
        </div>

        <div className="faq-list" data-aos="fade-up" data-aos-delay="100">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
              id={`faq-${i}`}
            >
              <div className="faq-question" onClick={() => toggle(i)}>
                <span>{faq.q}</span>
                <div className="faq-icon">+</div>
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
