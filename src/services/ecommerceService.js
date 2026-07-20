import { supabase } from "../assets/subabaseclient";

// ===============================
// PRODUCTS
// ===============================
export async function getProducts(filters = {}) {
  let query = supabase.from("products").select("*");

  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }
  if (filters.active !== undefined) {
    query = query.eq("active", filters.active);
  }
  if (filters.featured) {
    query = query.eq("featured", true);
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from("products")
    .insert([{ ...product, slug: product.slug || product.name.toLowerCase().replace(/\s+/g, "-") }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ===============================
// CATEGORIES
// ===============================
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function createCategory(category) {
  const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, "-");
  const { data, error } = await supabase
    .from("categories")
    .insert([{ ...category, slug }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, updates) {
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ===============================
// CART (Supabase sync for logged-in users)
// ===============================
export async function getCartItems(userId) {
  const { data, error } = await supabase
    .from("cart")
    .select("*, products(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function addToCartDb(userId, item) {
  const { data, error } = await supabase
    .from("cart")
    .upsert(
      {
        user_id: userId,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      },
      { onConflict: "user_id,product_id,size,color" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCartItemQuantity(id, quantity) {
  if (quantity < 1) {
    const { error } = await supabase.from("cart").delete().eq("id", id);
    if (error) throw error;
    return null;
  }
  const { data, error } = await supabase
    .from("cart")
    .update({ quantity })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeCartItem(id) {
  const { error } = await supabase.from("cart").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function clearCartDb(userId) {
  const { error } = await supabase.from("cart").delete().eq("user_id", userId);
  if (error) throw error;
  return true;
}

export async function syncCartToDb(userId, items) {
  // Delete all existing cart items for user
  await supabase.from("cart").delete().eq("user_id", userId);
  // Insert new items
  if (items.length > 0) {
    const cartItems = items.map((item) => ({
      user_id: userId,
      product_id: item.product_id || item.id,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
    }));
    const { error } = await supabase.from("cart").insert(cartItems);
    if (error) throw error;
  }
}

// ===============================
// ORDERS
// ===============================
export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createOrderItems(items) {
  const { data, error } = await supabase
    .from("order_items")
    .insert(items)
    .select();
  if (error) throw error;
  return data;
}

export async function getUserOrders(userId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data;
}

export async function getOrderItems(orderId) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (error) throw error;
  return data;
}

export async function getOrderWithItems(orderId) {
  const order = await getOrderById(orderId);
  const items = await getOrderItems(orderId);
  return { ...order, items };
}

export async function getAllOrders(filters = {}) {
  let query = supabase.from("orders").select("*, profiles(full_name, email)", { count: "exact" });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
    );
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(orderId, paymentStatus) {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
  if (error) throw error;
  return data;
}

export async function getPaymentsForOrder(orderId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ===============================
// USERS (admin)
// ===============================
export async function getUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getUserOrderCount(userId) {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count || 0;
}

// ===============================
// INVENTORY
// ===============================
export async function updateStock(productId, quantityChange, reason, referenceType = null, referenceId = null) {
  // Get current stock
  const product = await getProductById(productId);
  const newStock = product.stock + quantityChange;
  if (newStock < 0) throw new Error("Insufficient stock");

  // Update product stock
  await updateProduct(productId, { stock: newStock });

  // Log inventory change
  const { error } = await supabase.from("inventory_log").insert([
    {
      product_id: productId,
      quantity_change: quantityChange,
      reason,
      reference_type: referenceType,
      reference_id: referenceId,
    },
  ]);
  if (error) throw error;

  return newStock;
}

export async function getInventoryLog(productId) {
  const { data, error } = await supabase
    .from("inventory_log")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ===============================
// COUPONS
// ===============================
export async function validateCoupon(code, subtotal) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();

  if (error) return { valid: false, error: "Invalid coupon code." };
  if (!data) return { valid: false, error: "Invalid coupon code." };

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }

  // Check max uses
  if (data.max_uses > 0 && data.used_count >= data.max_uses) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  // Check minimum purchase
  if (subtotal < data.min_purchase) {
    return {
      valid: false,
      error: `Minimum purchase of $${data.min_purchase} required for this coupon.`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (data.type === "percentage") {
    discount = (subtotal * data.value) / 100;
  } else {
    discount = data.value;
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    coupon: data,
    discount,
    type: data.type,
    value: data.value,
  };
}

export async function incrementCouponUsage(code) {
  const { error } = await supabase.rpc("increment_coupon_usage", {
    coupon_code: code,
  });
  if (error) {
    // Fallback: direct update
    await supabase
      .from("coupons")
      .update({ used_count: supabase.rpc("increment", { x: 1 }) })
      .eq("code", code.toUpperCase());
  }
}

export async function getCoupons() {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createCoupon(coupon) {
  const { data, error } = await supabase
    .from("coupons")
    .insert([{ ...coupon, code: coupon.code.toUpperCase() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCoupon(id) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ===============================
// SHIPPING
// ===============================
export function calculateShipping(country, city, subtotal) {
  // Free shipping over $100
  if (subtotal >= 100) {
    return { cost: 0, method: "free", label: "Free Shipping" };
  }

  // Flat rate by country
  const shippingRates = {
    US: { cost: 9.99, label: "Standard Shipping (US)" },
    CA: { cost: 12.99, label: "Standard Shipping (Canada)" },
    UK: { cost: 14.99, label: "Standard Shipping (UK)" },
    default: { cost: 19.99, label: "International Shipping" },
  };

  const rate = shippingRates[country] || shippingRates.default;
  return { cost: rate.cost, method: "flat", label: rate.label };
}

// ===============================
// DASHBOARD STATS (Admin)
// ===============================
export async function getDashboardStats() {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*");

  console.log("Orders:", orders);
  console.log("Orders Error:", ordersError);

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: profileCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const allOrders = orders || [];

  const totalRevenue = allOrders.reduce(
    (sum, o) => sum + (o.status !== "cancelled" ? Number(o.total) : 0),
    0
  );

  return {
    totalOrders: allOrders.length,
    totalRevenue,
    totalCustomers: profileCount || 0,
    totalProducts: productCount || 0,
    pendingOrders: allOrders.filter((o) => o.status === "pending").length,
    recentOrders: allOrders.slice(0, 5),
  };
}

// ===============================
// USER ADDRESSES
// ===============================
export async function getUserAddresses(userId) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveAddress(address) {
  const { data, error } = await supabase
    .from("addresses")
    .insert([address])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ===============================
// ORDER NUMBER GENERATION (client fallback)
// ===============================
export function generateOrderNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${code}-${date}`;
}

// ===============================
// PAYMENTS
// ===============================
export async function createPayment(paymentData) {
  const { data, error } = await supabase
    .from("payments")
    .insert([paymentData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOrderPayments(orderId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ===============================
// EMAIL NOTIFICATIONS (Resend / EmailJS compatible)
// ===============================
export async function sendOrderNotificationEmail({ to, customerName, orderNumber, items, total, shippingAddress }) {
  const emailPayload = {
    to,
    customerName,
    orderNumber,
    items,
    total,
    shippingAddress,
  };

  // Log email payload for EmailJS/Resend integration
  console.log("📧 ORDER EMAIL PAYLOAD", emailPayload);

  // If your project uses EmailJS in admin dashboard, you can reuse that pattern.
  // For production, wire this to Resend / EmailJS using your environment variables.
  return emailPayload;
}

export function getAdminStats() {
  // placeholder if needed later
  return Promise.resolve({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0, pendingOrders: 0 })
}
