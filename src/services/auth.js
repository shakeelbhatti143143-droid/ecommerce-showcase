import { supabase } from "../assets/subabaseclient";

// ===============================
// CONSTANTS
// ===============================
export const ADMIN_EMAIL = "shakeelbhatti143143@gmail.com";

// ===============================
// HELPERS
// ===============================
export function isAdminEmail(email) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

export function getUserRole(user) {
  if (!user) return null;
  return isAdminEmail(user.email) ? "admin" : "user";
}

// ===============================
// SIGN IN (email + password)
// ===============================
export async function signIn({ email, password }) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  if (error) {
    return { error: error.message };
  }

  const role = getUserRole(data.user);
  setStoredRole(role);

  return { data, role };
}

// ===============================
// SIGN UP
// ===============================
export async function signUp({ name, email, password }) {
  const trimmedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: password.trim(),
    options: {
      data: {
        name: name.trim(),
        full_name: name.trim(),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is disabled, user is immediately signed in
  if (data?.user?.identities?.length === 0) {
    return { error: "An account with this email already exists." };
  }

  // Check if session exists (auto-confirm enabled)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const role = getUserRole(data.user);
    setStoredRole(role);
    return { data, role };
  }

  // Email confirmation required
  return { data, role: null, pending: true };
}

// ===============================
// GOOGLE SIGN IN
// ===============================
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

// ===============================
// SESSION PERSISTENCE
// ===============================
export function setStoredRole(role) {
  if (role === "admin") {
    localStorage.setItem("userRole", "admin");
  } else if (role === "user") {
    localStorage.setItem("userRole", "user");
  } else {
    localStorage.removeItem("userRole");
  }
}

export function clearSession() {
  localStorage.removeItem("userRole");
  localStorage.removeItem("shopsphere_shopper");
  localStorage.removeItem("user");
}

export function getStoredRole() {
  return localStorage.getItem("userRole");
}

// ===============================
// SIGN OUT
// ===============================
export async function signOut() {
  await supabase.auth.signOut();
  clearSession();
}

// ===============================
// GET CURRENT USER / SESSION
// ===============================
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// ===============================
// AUTH STATE LISTENER
// Returns { subscription, unsubscribe }
// ===============================
export function onAuthStateChange(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ?? null;
    const role = user ? getUserRole(user) : null;
    callback(event, session, user, role);
  });

  return subscription;
}