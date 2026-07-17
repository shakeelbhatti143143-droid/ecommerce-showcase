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

  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState("");

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
      // Keep existing shop user if they're not a Supabase user (admin etc.)
      if (!user?.id?.startsWith("admin")) {
        // Only clear if it's not an admin-style user
      }
    }
  }, [authUser, profile]);

  const fetchOrCreateProfile = useCallback(async (userId, supaUser) => {
    const result = await getProfile(userId);
    if (result.data) {
      setProfile(result.data);
    } else {
      // No profile exists, create one automatically
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

  // ==========================
  // LOGOUT - clears all auth state
  // ==========================
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("loggedIn");
  }, []);

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
        authUser,
        authLoading,
        profile,
        setProfile,
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
        logout,
        fetchOrCreateProfile,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);