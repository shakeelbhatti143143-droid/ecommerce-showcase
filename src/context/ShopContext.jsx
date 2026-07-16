import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  authenticateShopper,
  createShopAccount,
  resetShopPassword,
} from "../services/shopAuth";
import { persistAdminSession } from "../services/adminAuth";

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

  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (user) return;

    const timer = setTimeout(() => {
      setLoginOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const requireLogin = (action) => {
    if (!user) {
      setLoginOpen(true);
      return false;
    }

    action?.();
    return true;
  };

  const addToCart = (product, selection) =>
    requireLogin(() => {
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
    });

  const updateQuantity = (key, quantity) => {
    setCart((items) =>
      quantity < 1
        ? items.filter((item) => item.key !== key)
        : items.map((item) =>
            item.key === key ? { ...item, quantity } : item
          )
    );
  };

  const placeOrder = (product, selection) =>
    requireLogin(() => {
      setOrder({ ...product, ...selection });
    });

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

    setLoginOpen(false);

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

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <ShopContext.Provider
      value={{
        cart,
        setCart,
        user,
        setUser,
        loginOpen,
        setLoginOpen,
        cartOpen,
        setCartOpen,
        order,
        setOrder,
        toast,
        setToast,
        total,
        requireLogin,
        addToCart,
        updateQuantity,
        placeOrder,
        login,
        forgotPassword,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);