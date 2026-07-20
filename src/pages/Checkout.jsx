import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, total, subtotal, user, authLoading, cartLoaded, placeFullOrder, applyCoupon, removeCoupon, appliedCoupon, calculateShipping } = useShop();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    country: "US",
    city: "",
    address: "",
    postalCode: "",
  });

  const [couponInput, setCouponInput] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading || !cartLoaded) return;
    if (!user) {
      navigate("/login", { replace: true });
    } else if (cart.length === 0) {
      navigate("/shop", { replace: true });
    } else {
      setReady(true);
    }
  }, [authLoading, cartLoaded, user, cart.length, navigate]);

  if (authLoading || !ready) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <div className="dashboard-loading-spinner" />
          <p>Preparing checkout...</p>
        </div>
      </div>
    );
  }

  const shipping = calculateShipping(form.country, form.city, parseFloat(subtotal));
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount) : 0;
  const orderTotal = parseFloat(subtotal) + shipping.cost - discount;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email address";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[\d\s+\-()]{7,20}$/.test(form.phone)) newErrors.phone = "Invalid phone number";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.postalCode.trim()) newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCouponApply = async () => {
    if (!couponInput.trim()) return;
    setServerError("");
    const result = await applyCoupon(couponInput.trim());
    if (!result.valid) {
      setServerError(result.error || "Invalid coupon");
    }
    setCouponInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setSubmitting(true);

    const result = await placeFullOrder(form);

    setSubmitting(false);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    if (result.data) {
      navigate(`/order-success/${result.data.id}`);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Left: Shipping Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit} noValidate>
              <h2>Shipping Information</h2>

              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={errors.fullName ? "input-error" : ""}
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>
                <div className="checkout-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={errors.email ? "input-error" : ""}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? "input-error" : ""}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
                <div className="checkout-form-group">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={errors.country ? "input-error" : ""}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="PK">Pakistan</option>
                    <option value="AE">UAE</option>
                    <option value="SA">Saudi Arabia</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.country && <span className="field-error">{errors.country}</span>}
                </div>
              </div>

              <div className="checkout-form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className={errors.city ? "input-error" : ""}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>

              <div className="checkout-form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St, Apt 4B"
                  className={errors.address ? "input-error" : ""}
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="checkout-form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className={errors.postalCode ? "input-error" : ""}
                />
                {errors.postalCode && <span className="field-error">{errors.postalCode}</span>}
              </div>

              {serverError && (
                <div className="checkout-error-banner">
                  <p>{serverError}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary checkout-btn"
                disabled={submitting}
              >
                {submitting ? "⏳ Placing Order..." : "💰 Place Order"}
              </button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary-section">
            <h2>Order Summary</h2>

            <div className="checkout-cart-items">
              {cart.map((item) => (
                <div key={item.key} className="checkout-cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-item-details">
                    <h4>{item.name}</h4>
                    <p>
                      {item.size}{item.color ? ` / ${item.color}` : ""} × {item.quantity}
                    </p>
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="checkout-coupon">
              <h4>Have a coupon?</h4>
              {appliedCoupon ? (
                <div className="checkout-coupon-applied">
                  <span>
                    ✅ {appliedCoupon.coupon.code} (-${appliedCoupon.discount.toFixed(2)})
                  </span>
                  <button onClick={removeCoupon}>Remove</button>
                </div>
              ) : (
                <div className="checkout-coupon-input">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                  />
                  <button onClick={handleCouponApply}>Apply</button>
                </div>
              )}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>${parseFloat(subtotal).toFixed(2)}</span>
              </div>
              <div className="checkout-total-row">
                <span>Shipping ({shipping.label})</span>
                <span>{shipping.cost === 0 ? "FREE" : `$${shipping.cost.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="checkout-total-row checkout-discount">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="checkout-total-row checkout-grand-total">
                <span>Total</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-payment-info">
              <h4>Payment Method</h4>
              <p>Cash on Delivery (COD)</p>
              <p className="checkout-payment-note">
                Pay when you receive your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}