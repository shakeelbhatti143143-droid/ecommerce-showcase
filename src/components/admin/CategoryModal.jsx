import React, { useState, useEffect } from 'react'

export default function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  })

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
      })
    }
  }, [category])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{category?.id ? 'Edit Category' : 'Add Category'}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-modal-field">
              <label>Category Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" required />
            </div>
            <div className="admin-modal-field">
              <label>Slug</label>
              <input type="text" name="slug" value={form.slug} onChange={handleChange} className="form-input" />
            </div>
            <div className="admin-modal-field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-textarea" rows="3" />
            </div>
            <div className="admin-modal-field">
              <label>Image URL</label>
              <input type="text" name="image" value={form.image} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}