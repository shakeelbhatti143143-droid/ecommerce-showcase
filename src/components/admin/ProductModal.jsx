import React, { useState, useEffect } from 'react'

export default function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    category: '',
    image: '',
    stock: '0',
    rating: '0',
    badge: '',
    featured: false,
    active: true,
  })

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        compare_price: product.compare_price || '',
        category: product.category || '',
        image: product.image || '',
        stock: product.stock || '0',
        rating: product.rating || '0',
        badge: product.badge || '',
        featured: product.featured || false,
        active: product.active !== false,
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock, 10),
      rating: parseFloat(form.rating),
    }
    await onSave(data)
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{product?.id ? 'Edit Product' : 'Add Product'}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-modal-field">
              <label>Product Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" required />
            </div>
            <div className="admin-modal-field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-textarea" rows="3" />
            </div>
            <div className="admin-modal-row">
              <div className="admin-modal-field">
                <label>Price *</label>
                <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} className="form-input" required />
              </div>
              <div className="admin-modal-field">
                <label>Compare Price</label>
                <input type="number" step="0.01" name="compare_price" value={form.compare_price} onChange={handleChange} className="form-input" />
              </div>
            </div>
            <div className="admin-modal-row">
              <div className="admin-modal-field">
                <label>Category</label>
                <input type="text" name="category" value={form.category} onChange={handleChange} className="form-input" />
              </div>
              <div className="admin-modal-field">
                <label>Stock</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} className="form-input" />
              </div>
            </div>
            <div className="admin-modal-field">
              <label>Image URL</label>
              <input type="text" name="image" value={form.image} onChange={handleChange} className="form-input" />
            </div>
            <div className="admin-modal-row">
              <div className="admin-modal-field">
                <label>Rating</label>
                <input type="number" step="0.1" name="rating" value={form.rating} onChange={handleChange} className="form-input" />
              </div>
              <div className="admin-modal-field">
                <label>Badge</label>
                <input type="text" name="badge" value={form.badge} onChange={handleChange} className="form-input" />
              </div>
            </div>
            <div className="admin-modal-field">
              <label>
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                Featured
              </label>
            </div>
            <div className="admin-modal-field">
              <label>
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                Active
              </label>
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