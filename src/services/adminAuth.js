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
export async function persistAdminSession(user) {
  localStorage.setItem("isAdmin", "true");

  localStorage.setItem(
    "admin-auth",
    JSON.stringify({
      email: user.email,
      loggedIn: true,
      timestamp: Date.now(),
    })
  );

  // Ensure the admin profile has is_admin = true in the database
  // This is required for RLS policies to grant admin access to orders and products
  try {
    if (user.id) {
      const { supabase } = await import("../assets/subabaseclient");
      await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0],
            is_admin: true,
          },
          { onConflict: "id" }
        );
    }
  } catch (err) {
    console.error("Failed to update admin profile:", err);
  }
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