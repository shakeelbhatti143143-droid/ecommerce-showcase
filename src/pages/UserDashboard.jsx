import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../assets/subabaseclient";
import { uploadAvatar, deleteAvatar, upsertProfile, getProfile } from "../services/shopAuth";
import { persistAdminSession } from "../services/adminAuth";
import { ADMIN_EMAIL } from "../services/auth";

const HELP_FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse our shop, add items to your cart, and proceed to checkout. You'll receive a confirmation email once your order is placed.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All transactions are securely processed.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order ships, you'll receive a tracking number via email. You can use it on our tracking page or the carrier's website.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return policy for unused items. Please contact our support team to initiate a return.",
  },
  {
    q: "How do I reset my password?",
    a: "Go to the login page and click 'Forgot Password'. We'll send you a reset link to your registered email address.",
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFilePath, setAvatarFilePath] = useState("");

  const loadUserData = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Redirect admin to admin dashboard
    if (user.email === ADMIN_EMAIL) {
      persistAdminSession({
        email: user.email,
        name: user.user_metadata?.full_name || "Admin",
      });
      localStorage.setItem("userRole", "admin");
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    setAuthUser(user);

    // Fetch or create profile
    const result = await getProfile(user.id);
    if (result.data) {
      setProfile(result.data);
      setFullName(result.data.full_name || "");
      setAvatarUrl(result.data.avatar_url || "");
      setAvatarFilePath(result.data.avatar_file_path || "");
    } else {
      // Create default profile
      const defaultName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0];

      const newProfile = {
        id: user.id,
        full_name: defaultName,
        updated_at: new Date().toISOString(),
      };

      const createResult = await upsertProfile(newProfile);
      if (createResult.data) {
        setProfile(createResult.data);
        setFullName(createResult.data.full_name || "");
      } else {
        // Fallback to user metadata
        setFullName(defaultName);
      }
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleSaveProfile = async () => {
    if (!authUser) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const updatedProfile = {
      id: authUser.id,
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
      avatar_file_path: avatarFilePath,
      updated_at: new Date().toISOString(),
    };

    const result = await upsertProfile(updatedProfile);

    if (result.error) {
      setError(result.error);
    } else {
      setProfile(result.data || updatedProfile);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }

    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    // Delete old avatar if exists
    if (avatarFilePath) {
      await deleteAvatar(avatarFilePath);
    }

    const result = await uploadAvatar(authUser.id, file);

    if (result.error) {
      setError(result.error);
    } else {
      setAvatarUrl(result.data.avatar_url);
      setAvatarFilePath(result.data.filePath);
      setSuccess("Profile picture uploaded!");

      // Auto-save the avatar_url to profile
      const updatedProfile = {
        id: authUser.id,
        full_name: fullName.trim(),
        avatar_url: result.data.avatar_url,
        avatar_file_path: result.data.filePath,
        updated_at: new Date().toISOString(),
      };

      await upsertProfile(updatedProfile);
      if (result.data) {
        setProfile(updatedProfile);
      }

      setTimeout(() => setSuccess(""), 3000);
    }

    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (!authUser || !avatarFilePath) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const result = await deleteAvatar(avatarFilePath);

    if (result.error) {
      setError(result.error);
    } else {
      setAvatarUrl("");
      setAvatarFilePath("");
      setSuccess("Profile picture removed.");

      // Update profile
      const updatedProfile = {
        id: authUser.id,
        full_name: fullName.trim(),
        avatar_url: null,
        avatar_file_path: null,
        updated_at: new Date().toISOString(),
      };

      await upsertProfile(updatedProfile);
      if (result.data) {
        setProfile(updatedProfile);
      }

      setTimeout(() => setSuccess(""), 3000);
    }

    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("shopsphere_shopper");
    localStorage.removeItem("loggedIn");
    navigate("/");
  };

  // Compute display values
  const displayName = profile?.full_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split("@")[0] || "User";
  const displayEmail = authUser?.email || "";
  const displayAvatar = avatarUrl || authUser?.user_metadata?.avatar_url || "";
  const createdDate = authUser?.created_at
    ? new Date(authUser.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header / Profile Card */}
        <div className="dashboard-card dashboard-profile-card">
          <div className="dashboard-profile-avatar-section">
            <div className="dashboard-avatar-wrapper">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="dashboard-avatar"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="dashboard-avatar-placeholder"
                style={{ display: displayAvatar ? "none" : "flex" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="dashboard-avatar-actions">
              <button
                className="btn btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : avatarUrl ? "Change Photo" : "Upload Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
              />
              {avatarUrl && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleDeleteAvatar}
                  disabled={uploading}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-profile-info">
            <h1 className="dashboard-greeting">
              Welcome, {displayName}
            </h1>
            <p className="dashboard-email">{displayEmail}</p>
            <p className="dashboard-joined">
              Member since {createdDate}
            </p>
          </div>

          <button
            className="btn btn-danger dashboard-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Profile Edit Section */}
        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Profile Settings</h2>

          <div className="dashboard-form-group">
            <label htmlFor="fullName">Display Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="dashboard-input"
            />
          </div>

          {error && <p className="dashboard-error">{error}</p>}
          {success && <p className="dashboard-success">{success}</p>}

          <button
            className="btn btn-primary"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Account Info */}
        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Account Information</h2>
          <div className="dashboard-info-grid">
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Email</span>
              <span className="dashboard-info-value">{displayEmail}</span>
            </div>
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Name</span>
              <span className="dashboard-info-value">{displayName}</span>
            </div>
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">Member Since</span>
              <span className="dashboard-info-value">{createdDate}</span>
            </div>
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">User ID</span>
              <span className="dashboard-info-value dashboard-user-id">
                {authUser?.id || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Help & Support</h2>

          <div className="dashboard-faq-section">
            <h3 className="dashboard-subsection-title">Frequently Asked Questions</h3>
            {HELP_FAQS.map((faq, index) => (
              <details key={index} className="dashboard-faq-item">
                <summary className="dashboard-faq-question">
                  {faq.q}
                </summary>
                <p className="dashboard-faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="dashboard-help-links">
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "mailto:support@shopsphere.com")}
            >
              Contact Support
            </button>
            <a
              href="/privacy"
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}