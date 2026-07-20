import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { getUserOrders } from "../services/ecommerceService";

const STATUS_BADGES = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  processing: "badge-processing",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

export default function MyOrders() {
  const { user } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await getUserOrders(user.id);
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="my-orders-page">
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <h2>Please log in to view your orders</h2>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {loading ? (
          <div className="dashboard-loading" style={{ padding: "60px 0" }}>
            <div className="dashboard-loading-spinner" />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="my-orders-empty">
            <p>You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="my-orders-list">
            {orders.map((order) => (
              <Link to={`/order-success/${order.id}`} key={order.id} className="my-order-card">
                <div className="my-order-header">
                  <div>
                    <strong className="my-order-number">{order.order_number}</strong>
                    <span className="my-order-date">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="my-order-status">
                    <span className={`order-badge ${STATUS_BADGES[order.status] || ""}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={`order-badge ${order.payment_status === "paid" ? "badge-paid" : "badge-pending"}`}>
                      {order.payment_status === "paid" ? "Paid" : "COD"}
                    </span>
                  </div>
                </div>
                <div className="my-order-total">
                  <span>Total:</span>
                  <strong>${parseFloat(order.total).toFixed(2)}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}