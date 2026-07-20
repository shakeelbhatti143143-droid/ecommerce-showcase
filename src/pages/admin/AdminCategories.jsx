import React, { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/ecommerceService";

const EMPTY = { name: "", slug: "", description: "", image: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      slug: c.slug || "",
      description: c.description || "",
      image: c.image || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        description: form.description,
        image: form.image,
      };
      if (editing) {
        await updateCategory(editing.id, payload);
      } else {
        await createCategory(payload);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save category.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      await load();
    } catch (e) {
      console.error(e);
      setError("Failed to delete category.");
    }
  };

  return (
    <div className="admin-messages-section">
      <div className="admin-section-header">
        <h3>Categories ({categories.length})</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          ➕ Add Category
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-cms-grid">
        {loading ? (
          <p>Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="admin-empty">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="admin-cms-card">
              <div className="admin-cms-card-header">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="admin-cat-thumb" />
                ) : (
                  <span className="admin-cms-icon">🏷️</span>
                )}
                <h3>{c.name}</h3>
              </div>
              <div className="admin-cms-card-body">
                <p>{c.description || "No description."}</p>
                <small className="admin-meta-label">/{c.slug}</small>
              </div>
              <div className="admin-action-group">
                <button className="admin-btn-approve" onClick={() => openEdit(c)} title="Edit">
                  ✏️
                </button>
                <button className="admin-btn-delete" onClick={() => handleDelete(c.id)} title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editing ? "✏️ Edit Category" : "➕ Add Category"}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {error && <p className="form-error">{error}</p>}
                <div className="admin-modal-field">
                  <label>Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-modal-field">
                  <label>Slug</label>
                  <input
                    className="form-input"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto from name"
                  />
                </div>
                <div className="admin-modal-field">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="admin-modal-field">
                  <label>Image URL</label>
                  <input
                    className="form-input"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
