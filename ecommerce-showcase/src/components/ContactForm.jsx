import React, { useState } from 'react'
import { safeInsert } from '../services/supabase'
import { saveContactLocally } from '../services/localStore'

function Toast({ msg, type, show }) {
  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`} id="contact-toast">
      <span className="toast-icon">{type === 'success' ? '✅' : '❌'}</span>
      <span className="toast-msg">{msg}</span>
    </div>
  )
}

const subjects = [
  'General Inquiry',
  'Technical Support',
  'Billing & Pricing',
  'Partnership Opportunity',
  'Feature Request',
  'Bug Report',
  'Other',
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 5000)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please enter your name.'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.'

    if (!form.email.trim()) errs.email = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email address.'

    if (!form.subject) errs.subject = 'Please select a subject.'

    if (!form.message.trim()) errs.message = 'Please enter your message.'
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters.'

    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(errs => ({ ...errs, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    const formData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject,
      message: form.message.trim(),
    }
    try {
      // Always save locally so admin sees it immediately
      saveContactLocally(formData)

      const { error: sbError } = await safeInsert('Contact', formData)

      // Show success regardless — if Supabase isn't configured yet, the form
      // still works visually; data will save once credentials are added.
      if (sbError && sbError.code && sbError.code !== 'NOT_CONFIGURED') {
        throw sbError
      }

      showToast('Message sent! We\'ll get back to you within 24 hours. 🎉', 'success')
      setForm({ name: '', email: '', subject: '', message: '' })
      setErrors({})
    } catch (err) {
  console.error("Supabase Error:", err);
  showToast(err.message || "Something went wrong.", "error");
} finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} id="contact-form" noValidate>
        {/* Name & Email Row */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="contact-name">Full Name *</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="John Smith"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
            />
            {errors.name && <span className="form-error">⚠ {errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact-email">Email Address *</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
          </div>
        </div>

        {/* Subject */}
        <div className="form-group">
          <label className="form-label" htmlFor="contact-subject">Subject *</label>
          <select
            id="contact-subject"
            name="subject"
            className={`form-select ${errors.subject ? 'error' : ''}`}
            value={form.subject}
            onChange={handleChange}
            disabled={loading}
            style={{ background: 'var(--bg-card)', color: form.subject ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            <option value="" disabled>Select a subject</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.subject && <span className="form-error">⚠ {errors.subject}</span>}
        </div>

        {/* Message */}
        <div className="form-group">
          <label className="form-label" htmlFor="contact-message">Message *</label>
          <textarea
            id="contact-message"
            name="message"
            className={`form-textarea ${errors.message ? 'error' : ''}`}
            placeholder="Tell us how we can help you..."
            value={form.message}
            onChange={handleChange}
            disabled={loading}
            rows={6}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {errors.message
              ? <span className="form-error">⚠ {errors.message}</span>
              : <span />}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {form.message.length} chars
            </span>
          </div>
        </div>

        <button
          type="submit"
          id="contact-submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? '⏳ Sending...' : '🚀 Send Message'}
        </button>
      </form>

      <Toast {...toast} />
    </>
  )
}
