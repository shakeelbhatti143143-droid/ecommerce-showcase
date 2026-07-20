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
    id: user.id,
  };
}

// ==========================
// CREATE ACCOUNT
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
        full_name: name.trim(),
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
// GOOGLE LOGIN
// ==========================
// ==========================
// GOOGLE LOGIN
// ==========================
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}
// ==========================
// RESET PASSWORD
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

// ==========================
// PROFILE: GET PROFILE
// ==========================
export async function getProfile(userId) {
  if (!configured) return { error: "Supabase is not configured." };

  // Try to fetch existing profile
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { error: message(error) };
  }

  return { data };
}

// ==========================
// PROFILE: CREATE OR UPDATE
// ==========================
export async function upsertProfile(profile) {
  if (!configured) return { error: "Supabase is not configured." };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .maybeSingle();

  if (error) {
    return { error: message(error) };
  }

  return { data };
}

// ==========================
// PROFILE: UPLOAD AVATAR
// ==========================
export async function uploadAvatar(userId, file) {
  if (!configured) return { error: "Supabase is not configured." };

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  // Upload the file to the avatars bucket
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { error: message(uploadError) };
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return { data: { avatar_url: urlData.publicUrl, filePath } };
}

// ==========================
// PROFILE: DELETE AVATAR
// ==========================
export async function deleteAvatar(filePath) {
  if (!configured) return { error: "Supabase is not configured." };

  if (!filePath) return { error: "No avatar file path provided." };

  const { error } = await supabase.storage
    .from("avatars")
    .remove([filePath]);

  if (error) {
    return { error: message(error) };
  }

  return { data: true };
}