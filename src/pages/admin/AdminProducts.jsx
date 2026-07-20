import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../assets/subabaseclient";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../../services/ecommerceService";

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_price: "",
  category: "",
  category_id: "",
  image: "",
  stock: 0,
  rating: 0,
  badge: "",
  featured: false,
  active: true,
};

async function uploadProductImage(file) {
  const fileExt = file.name.split(".").pop();
  const filePath = `products/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${fileExt}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProducts({}), getCategories()]);
      setProducts(p || []);
      setCategories(c || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load products.");
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
    setImageFile(null);
    setImagePreview("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price ?? "",
      compare_price: product.compare_price ?? "",
      category: product.category || "",
      category_id: product.category_id || "",
      image: product.image || "",
      stock: product.stock ?? 0,
      rating: product.rating ?? 0,
      badge: product.badge || "",
      featured: product.featured ?? false,
      active: product.active ?? true,
    });
    setImageFile(null);
    setImagePreview(product.image || "");
    setError("");
    setShowModal(true);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let imageUrl = form.image;
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadProductImage(imageFile);
        setUploading(false);
      }

      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        description: form.description,
        price: parseFloat(form.price) || 0,
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        category: form.category,
        category_id: form.category_id || null,
        image: imageUrl,
        stock: parseInt(form.stock, 10) || 0,
        rating: parseFloat(form.rating) || 0,
        badge: form.badge,
        featured: form.featured,
        active: form.active,
      };

      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      console.error(e);
      setError("Failed to delete product.");
    }
  };

  return (
    <div className="admin-messages-section">
      <div className="admin-section-header">
        <h3>Products ({products.length})</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          ➕ Add Product
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="admin-empty">
                  Loading products…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-empty">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="admin-order-thumb" />
                    ) : (
                      <span className="admin-meta-label">No img</span>
                    )}
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.featured && <span className="admin-subject-tag">Featured</span>}
                  </td>
                  <td>{p.category}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span
                      className={
                        p.stock === 0
                          ? "admin-stock-out"
                          : p.stock <= 5
                          ? "admin-stock-low"
                          : "admin-stock-ok"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${p.active ? "read" : "unread"}`}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-group">
                      <button
                        className="admin-btn-approve"
                        onClick={() => openEdit(p)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="admin-btn-delete"
                        onClick={() => handleDelete(p.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px" }}
          >
            <div className="admin-modal-header">
              <h3>{editing ? "✏️ Edit Product" : "➕ Add Product"}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {error && <p className="form-error">{error}</p>}

                <div className="admin-modal-field">
                  <label>Product Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-modal-field">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="admin-product-grid">
                  <div className="admin-modal-field">
                    <label>Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-modal-field">
                    <label>Compare Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={form.compare_price}
                      onChange={(e) =>
                        setForm({ ...form, compare_price: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-modal-field">
                    <label>Stock *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-modal-field">
                    <label>Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={form.rating}
                      onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-product-grid">
                  <div className="admin-modal-field">
                    <label>Category</label>
                    <input
                      className="form-input"
                      list="admin-category-list"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Jackets"
                    />
                    <datalist id="admin-category-list">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="admin-modal-field">
                    <label>Badge</label>
                    <input
                      className="form-input"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      placeholder="e.g. New, Sale"
                    />
                  </div>
                </div>

                <div className="admin-modal-field">
                  <label>Product Image</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="form-input"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="admin-product-preview" />
                  )}
                </div>

                <div className="admin-product-toggles">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    />
                    Featured
                  </label>
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    Active (visible in shop)
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || uploading}
                >
                  {uploading
                    ? "Uploading…"
                    : saving
                    ? "Saving…"
                    : editing
                    ? "Save Changes"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
