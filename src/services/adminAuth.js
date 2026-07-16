import { supabase } from "../assets/subabaseclient";

// ===============================
// LOGIN ADMIN
// ===============================
export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

// ===============================
// COMPATIBILITY FUNCTION
// ===============================
export async function verifyAdminCredentials({ email, password }) {
  const result = await loginAdmin(email, password);

  if (result.error) {
    return {
      data: null,
      error: result.error,
    };
  }

  return {
    data: result.data.user,
    error: null,
  };
}

// ===============================
// SAVE SESSION
// ===============================
export function persistAdminSession(user) {
  localStorage.setItem("isAdmin", "true");

  localStorage.setItem(
    "admin-auth",
    JSON.stringify({
      email: user.email,
      loggedIn: true,
      timestamp: Date.now(),
    })
  );
}

// ===============================
// LOGOUT
// ===============================
export async function logoutAdmin() {
  await supabase.auth.signOut();

  localStorage.removeItem("isAdmin");
  localStorage.removeItem("admin-auth");
}

// ===============================
// CHECK SESSION
// ===============================
export async function isAdminLoggedIn() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return !!session;
}