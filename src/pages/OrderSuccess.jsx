import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderWithItems } from "../services/ecommerceService";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await getOrderWithItems(orderId);
      setOrder(data);
    } catch (err) {
      setError("Order not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <div className="dashboard-loading-spinner" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-page">
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <h2>Order Not Found</h2>
          <p>{error || "The order you're looking for doesn't exist."}</p>
          <Link to="/my-orders" className="btn btn-primary">My Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="order-success-card">
          <div className="order-success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order has been placed and is being processed.</p>

          <div className="order-success-details">
            <div className="order-detail-row">
              <span>Order Number</span>
              <strong>{order.order_number}</strong>
            </div>
            <div className="order-detail-row">
              <span>Date</span>
              <strong>{new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
              })}</strong>
            </div>
            <div className="order-detail-row">
              <span>Payment Method</span>
              <strong>Cash on Delivery</strong>
            </div>
            <div className="order-detail-row">
              <span>Total</span>
              <strong>${parseFloat(order.total).toFixed(2)}</strong>
            </div>
          </div>

          <div className="order-success-items">
            <h3>Items Ordered</h3>
            {(order.items || []).map((item) => (
              <div key={item.id} className="order-success-item">
                {item.product_image && <img src={item.product_image} alt={item.product_name} />}
                <div>
                  <h4>{item.product_name}</h4>
                  <p>Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <strong>${parseFloat(item.total).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="order-success-shipping">
            <h3>Shipping Address</h3>
            <p>{order.customer_name}</p>
            <p>{order.shipping_address?.address}</p>
            <p>{order.shipping_address?.city}, {order.shipping_address?.country} {order.shipping_address?.postal_code}</p>
          </div>

          <div className="order-success-actions">
            <Link to="/my-orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/shop" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}