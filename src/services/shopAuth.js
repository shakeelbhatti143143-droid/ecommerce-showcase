import { supabase } from "../assets/subabaseclient";
import { verifyAdminCredentials } from "./adminAuth";

const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const message = (error) =>
  error?.message || "Unable to connect to Supabase. Please try again.";

function normalizeShopper(user) {
  return {
    account_name: user.user_metadata?.name || user.email?.split("@")[0],
    account_email: user.email,
    name: user.user_metadata?.name || user.email?.split("@")[0],
    email: user.email,
  };
}

// ==========================
// CREATE NEW ACCOUNT
// ==========================
export async function createShopAccount({ name, email, password }) {
  if (!configured) {
    return {
      error: "Supabase is not configured.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password.trim(),
    options: {
      data: {
        name: name.trim(),
      },
    },
  });

  if (error) {
    return {
      error: message(error),
    };
  }

  return {
    data: normalizeShopper(data.user),
  };
}

// ==========================
// LOGIN
// ==========================
export async function authenticateShopper({ email, password }) {
  if (!configured) {
    return {
      error: "Supabase is not configured.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password.trim(),
  });

  if (!error && data.user) {
    return {
      data: normalizeShopper(data.user),
    };
  }

  // Check Admin Login
  const adminResult = await verifyAdminCredentials({ email, password });

  if (adminResult.data) {
    return {
      data: {
        account_name: adminResult.data.name || "Admin",
        account_email: adminResult.data.email,
        name: adminResult.data.name,
        email: adminResult.data.email,
        isAdmin: true,
      },
    };
  }

  return {
    error: error?.message || "Invalid email or password.",
  };
}

// ==========================
// FORGOT PASSWORD
// ==========================
export async function resetShopPassword(email) {
  if (!configured) {
    return {
      error: "Supabase is not configured.",
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  );

  if (error) {
    return {
      error: message(error),
    };
  }

  return {
    data: "Password reset email sent successfully.",
  };
}

// ==========================
// UPDATE PASSWORD
// ==========================
export async function updateShopPassword(newPassword) {
  if (!configured) {
    return {
      error: "Supabase is not configured.",
    };
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword.trim(),
  });

  if (error) {
    return {
      error: message(error),
    };
  }

  return {
    data,
  };
}

// ==========================
// LOGOUT
// ==========================
export async function logoutShopper() {
  await supabase.auth.signOut();
}