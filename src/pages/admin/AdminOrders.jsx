import React, { useState, useEffect, useCallback } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderWithItems,
} from "../../services/ecommerceService";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const STATUS_CLASS = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  processing: "badge-processing",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getOrderWithItems(order.id);
        if (mounted) setItems(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [order.id]);

  if (!order) return null;

  const handleUpdate = async () => {
    setSaving(true);
    try {
      if (status !== order.status) {
        await updateOrderStatus(order.id, status);
        onStatusChange(order.id, status, paymentStatus);
      }
      if (paymentStatus !== order.payment_status) {
        await updatePaymentStatus(order.id, paymentStatus);
        onStatusChange(order.id, status, paymentStatus);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px" }}
      >
        <div className="admin-modal-header">
          <h3>📦 Order {order.order_number}</h3>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-order-meta">
            <div>
              <span className="admin-meta-label">Customer</span>
              <strong>{order.customer_name}</strong>
              <p>{order.customer_email}</p>
              <p>{order.customer_phone}</p>
            </div>
            <div>
              <span className="admin-meta-label">Date</span>
              <strong>{formatDate(order.created_at)}</strong>
            </div>
            <div>
              <span className="admin-meta-label">Total</span>
              <strong>${Number(order.total).toFixed(2)}</strong>
            </div>
          </div>

          <div className="admin-order-address">
            <span className="admin-meta-label">Shipping Address</span>
            <p>
              {order.shipping_address?.address}, {order.shipping_address?.city},{" "}
              {order.shipping_address?.country}{" "}
              {order.shipping_address?.postal_code}
            </p>
          </div>

          {loading ? (
            <p>Loading items…</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {i.product_image && (
                        <img
                          src={i.product_image}
                          alt={i.product_name}
                          className="admin-order-thumb"
                        />
                      )}
                      {i.product_name}
                      {i.size ? ` (${i.size}${i.color ? "/" + i.color : ""})` : ""}
                    </td>
                    <td>{i.quantity}</td>
                    <td>${Number(i.price).toFixed(2)}</td>
                    <td>${Number(i.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="admin-order-summary">
            <div>
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div>
              <span>Shipping</span>
              <span>
                {Number(order.shipping_cost) === 0
                  ? "FREE"
                  : "$" + Number(order.shipping_cost).toFixed(2)}
              </span>
            </div>
            {Number(order.discount) > 0 && (
              <div>
                <span>Discount</span>
                <span>-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="admin-order-grand">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="admin-order-status-controls">
            <div className="admin-modal-field">
              <label>Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-modal-field">
              <label>Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="form-input"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn-cancel" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? "Saving…" : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
      });
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = (id, status, paymentStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, payment_status: paymentStatus } : o
      )
    );
    setSelected((prev) =>
      prev ? { ...prev, status, payment_status: paymentStatus } : prev
    );
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        o.order_number?.toLowerCase().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_email?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="admin-messages-section">
      <div className="admin-section-header">
        <h3>Orders ({filtered.length})</h3>
        <div className="admin-filter-bar">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search order #, name, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="admin-empty">
                  Loading orders…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-empty">
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.order_number}</strong>
                  </td>
                  <td>
                    <div>{o.customer_name}</div>
                    <small className="admin-meta-label">{o.customer_email}</small>
                  </td>
                  <td className="admin-date-cell">{formatDate(o.created_at)}</td>
                  <td>
                    <strong>${Number(o.total).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        o.payment_status === "paid"
                          ? "read"
                          : o.payment_status === "failed"
                          ? "unread"
                          : "approved"
                      }`}
                    >
                      {o.payment_status === "paid"
                        ? "Paid"
                        : o.payment_status === "pending"
                        ? "COD"
                        : o.payment_status.charAt(0).toUpperCase() +
                          o.payment_status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${STATUS_CLASS[o.status] || ""}`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="admin-btn-approve"
                      onClick={() => setSelected(o)}
                      title="View details"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
