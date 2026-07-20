import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  authenticateShopper,
  createShopAccount,
  resetShopPassword,
  getProfile,
  upsertProfile,
} from "../services/shopAuth";
import { persistAdminSession } from "../services/adminAuth";
import { supabase } from "../assets/subabaseclient";
import { syncCartToDb, getCartItems, calculateShipping, validateCoupon, createOrder, createOrderItems, updateStock, incrementCouponUsage, createPayment, getProductById } from "../services/ecommerceService";
import { sendOrderConfirmation, sendAdminOrderNotification } from "../services/emailService";

const ShopContext = createContext(null);

const CART_KEY = "shopsphere_cart";
const USER_KEY = "shopsphere_shopper";

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  // Real Supabase auth user (from session)
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  // Profile data from the profiles table
  const [profile, setProfile] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState("");
  const [cartLoaded, setCartLoaded] = useState(false);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Listen for Supabase auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const supaUser = session?.user ?? null;
      setAuthUser(supaUser);
      setAuthLoading(false);

      // If there's a logged-in Supabase user, fetch/create profile
      if (supaUser) {
        fetchOrCreateProfile(supaUser.id, supaUser);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const supaUser = session?.user ?? null;
      setAuthUser(supaUser);

      if (supaUser) {
        fetchOrCreateProfile(supaUser.id, supaUser);
      } else {
        setProfile(null);
        setUser(null);
        localStorage.removeItem(USER_KEY);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sync cart with Supabase when auth state changes
  useEffect(() => {
    if (authUser) {
      // Load cart from Supabase
      loadCartFromDb(authUser.id);
    } else {
      // Guest: local cart is already loaded from localStorage, mark as ready
      setCartLoaded(true);
    }
  }, [authUser?.id]);

  const loadCartFromDb = async (userId) => {
    try {
      const items = await getCartItems(userId);
      if (items && items.length > 0) {
        const mapped = items.map((item) => {
          const product = item.products || {};
          return {
            id: product.id,
            product_id: product.id,
            name: product.name || "Product",
            price: product.price || 0,
            image: product.image || "",
            category: product.category || "",
            size: item.size || "",
            color: item.color || "",
            quantity: item.quantity,
            cart_id: item.id,
            key: `${product.id}-${item.size || ""}-${item.color || ""}`,
          };
        });
        setCart(mapped);
      } else {
        // Guest cart exists, sync it to DB
        const localCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        if (localCart.length > 0) {
          await syncCartToDb(userId, localCart);
        }
      }
    } catch (err) {
      console.error("Error loading cart from DB:", err);
    } finally {
      setCartLoaded(true);
    }
  };

  // Keep the local `user` state in sync with authUser + profile
  useEffect(() => {
    if (authUser) {
      const mergedUser = {
        id: authUser.id,
        email: authUser.email,
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
        account_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
        account_email: authUser.email,
        avatar_url: profile?.avatar_url || null,
        created_at: authUser.created_at,
      };
      setUser(mergedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(mergedUser));
    } else {
      if (!user?.id?.startsWith("admin")) {
      }
    }
  }, [authUser, profile]);

  const fetchOrCreateProfile = useCallback(async (userId, supaUser) => {
    const result = await getProfile(userId);
    if (result.data) {
      setProfile(result.data);
    } else {
      const fullName =
        supaUser.user_metadata?.full_name ||
        supaUser.user_metadata?.name ||
        supaUser.email?.split("@")[0];

      const newProfile = {
        id: userId,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };

      const createResult = await upsertProfile(newProfile);
      if (createResult.data) {
        setProfile(createResult.data);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Sync to Supabase if logged in
    if (authUser) {
      syncCartToDb(authUser.id, cart).catch(() => { });
    }
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = (product, selection) => {
    const key = `${product.id}-${selection.size}-${selection.color || ""}`;

    setCart((items) => {
      const exists = items.find((item) => item.key === key);

      if (exists) {
        return items.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + selection.quantity }
            : item
        );
      }

      return [...items, { ...product, ...selection, key }];
    });

    setToast(`${product.name} added to cart`);
  };

  const updateQuantity = (key, quantity) => {
    setCart((items) =>
      quantity < 1
        ? items.filter((item) => item.key !== key)
        : items.map((item) =>
          item.key === key ? { ...item, quantity } : item
        )
    );
  };

  const removeFromCart = (key) => {
    setCart((items) => items.filter((item) => item.key !== key));
  };

  const placeOrder = (product, selection) => {
    setOrder({ ...product, ...selection });
  };

  const login = async ({ email, password, name, createAccount }) => {
    const result = createAccount
      ? await createShopAccount({ name, email, password })
      : await authenticateShopper({ email, password });

    if (result.error) {
      return { error: result.error };
    }

    const shopper = result.data;

    setUser(shopper);

    localStorage.setItem("loggedIn", "true");

    if (shopper.isAdmin) {
      persistAdminSession({
        name: shopper.account_name || shopper.name,
        email: shopper.account_email || shopper.email,
      });
    }

    setToast(`Welcome, ${shopper.account_name || shopper.name}!`);

    return { data: shopper };
  };

  // ==========================
  // FORGOT PASSWORD
  // ==========================
  const forgotPassword = async (email) => {
    if (!email) {
      setToast("Please enter your email address.");
      return;
    }

    const result = await resetShopPassword(email);

    if (result.error) {
      setToast(result.error);
    } else {
      setToast("Password reset email sent. Please check your inbox.");
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setUser(null);
    setProfile(null);
    setAppliedCoupon(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("loggedIn");
  }, []);

  // ==========================
  // COUPON
  // ==========================
  const applyCoupon = async (code) => {
    const subtotal = parseFloat(total);
    const result = await validateCoupon(code, subtotal);
    if (result.valid) {
      setAppliedCoupon(result);
      setToast(`Coupon applied! You saved $${result.discount.toFixed(2)}`);
    } else {
      setAppliedCoupon(null);
      setToast(result.error || "Invalid coupon");
    }
    return result;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setToast("Coupon removed");
  };

  // ==========================
  // STOCK CHECK
  // ==========================
  const checkStockAvailability = async () => {
    const stockIssues = [];
    for (const item of cart) {
      try {
        const product = await getProductById(item.id || item.product_id);
        if (product.stock < item.quantity) {
          stockIssues.push({
            name: item.name,
            available: product.stock,
            requested: item.quantity,
          });
        }
      } catch (err) {
        console.error(`Stock check failed for ${item.name}:`, err);
      }
    }
    return stockIssues;
  };

  // ==========================
  // CHECKOUT / PLACE ORDER
  // ==========================
  const placeFullOrder = async (customerInfo) => {
    if (!user || !authUser) {
      return { error: "You must be logged in to place an order." };
    }

    if (cart.length === 0) {
      return { error: "Your cart is empty." };
    }

    const stockIssues = await checkStockAvailability();
    if (stockIssues.length > 0) {
      const issue = stockIssues[0];
      return {
        error: `Insufficient stock for ${issue.name}. Only ${issue.available} available (you requested ${issue.requested}).`,
      };
    }

    const subtotal = parseFloat(total);
    const shipping = calculateShipping(customerInfo.country, customerInfo.city, subtotal);
    const discount = appliedCoupon ? parseFloat(appliedCoupon.discount) : 0;
    const orderTotal = subtotal + shipping.cost - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;

    try {
      // Create order
      const orderData = {
        order_number: orderNumber,
        user_id: authUser.id,
        customer_name: customerInfo.fullName,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shipping_address: {
          country: customerInfo.country,
          city: customerInfo.city,
          address: customerInfo.address,
          postal_code: customerInfo.postalCode,
        },
        subtotal,
        shipping_cost: shipping.cost,
        discount,
        coupon_code: appliedCoupon?.coupon?.code || null,
        total: orderTotal,
        status: "pending",
        payment_status: "pending",
        payment_method: "cod",
      };

      const newOrder = await createOrder(orderData);

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: newOrder.id,
        product_id: item.id || item.product_id,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
        price: item.price,
        total: item.price * item.quantity,
      }));

      await createOrderItems(orderItems);

      // Create payment record (COD - pending)
      try {
        await createPayment({
          order_id: newOrder.id,
          user_id: authUser.id,
          amount: orderTotal,
          method: "cod",
          status: "pending",
        });
      } catch (paymentErr) {
        console.error("Payment record creation failed:", paymentErr);
      }

      // Update inventory
      for (const item of cart) {
        try {
          await updateStock(
            item.id || item.product_id,
            -item.quantity,
            "Order placed",
            "order",
            newOrder.id
          );
        } catch (err) {
          console.error(`Stock update failed for ${item.name}:`, err);
        }
      }

      // Increment coupon usage
      if (appliedCoupon?.coupon?.code) {
        await incrementCouponUsage(appliedCoupon.coupon.code);
      }

      // Send email notifications (Resend/EmailJS ready)
      const fullOrderForEmail = {
        ...newOrder,
        customer_name: customerInfo.fullName,
        shipping_address: {
          address: customerInfo.address,
          city: customerInfo.city,
          country: customerInfo.country,
          postal_code: customerInfo.postalCode,
        },
      };
      try {
        await sendOrderConfirmation(fullOrderForEmail, orderItems);
        await sendAdminOrderNotification(fullOrderForEmail, orderItems);
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }

      // Clear cart
      setCart([]);
      setAppliedCoupon(null);

      return { data: newOrder };
    } catch (err) {
      console.error("Order placement error:", err);
      return { error: err.message || "Failed to place order. Please try again." };
    }
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    return subtotal;
  }, [subtotal]);

  return (
    <ShopContext.Provider
      value={{
        cart,
        setCart,
        user,
        setUser,
        authUser,
        authLoading,
        cartLoaded,
        profile,
        setProfile,
        cartOpen,
        setCartOpen,
        order,
        setOrder,
        toast,
        setToast,
        total,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        placeOrder,
        login,
        forgotPassword,
        logout,
        fetchOrCreateProfile,
        applyCoupon,
        removeCoupon,
        appliedCoupon,
        placeFullOrder,
        calculateShipping,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);