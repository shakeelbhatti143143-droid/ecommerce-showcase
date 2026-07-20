import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../assets/subabaseclient";
import { useShop } from "../../context/ShopContext";
import { signInWithGoogle as googleSignIn } from "../../services/shopAuth";
import { ADMIN_EMAIL, isAdminEmail, setStoredRole } from "../../services/auth";
import { persistAdminSession } from "../../services/adminAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, forgotPassword } = useShop();

  // Check user after Google OAuth redirect
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (user.email === ADMIN_EMAIL) {
          persistAdminSession({
            email: user.email,
            name: user.user_metadata?.full_name || "Admin",
          });
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/user-dashboard", { replace: true });
        }
      }
    }

    checkUser();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await googleSignIn();
    if (error) setError(error.message || "Google sign-in failed.");
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login({
      email,
      password,
      name,
      createAccount: mode === "create",
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Check if the logged-in user is admin
    const userEmail = email.trim().toLowerCase();
    if (isAdminEmail(userEmail)) {
      setStoredRole("admin");
      persistAdminSession({
        name: result.data?.account_name || "Admin",
        email: userEmail,
      });
      navigate("/admin/dashboard");
      return;
    }

    navigate("/user-dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: "480px" }}>
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              🛒 Shop<span className="accent">Sphere</span>
            </Link>
            <span className="shop-kicker">
              {mode === "create"
                ? "Create your account"
                : "Welcome back"}
            </span>
            <h1>
              {mode === "create"
                ? "Start shopping with ShopSphere"
                : "Login to continue shopping"}
            </h1>
            <p>
              Your account and login details are securely verified through
              Supabase.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "0" }}>
            {mode === "create" && (
              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  margin: "13px 0",
                  color: "var(--text-secondary)",
                  fontSize: ".8rem",
                  fontWeight: 700,
                }}
              >
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={{
                    padding: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    font: "inherit",
                  }}
                />
              </label>
            )}

            <label
              style={{
                display: "grid",
                gap: "6px",
                margin: "13px 0",
                color: "var(--text-secondary)",
                fontSize: ".8rem",
                fontWeight: 700,
              }}
            >
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  font: "inherit",
                }}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: "6px",
                margin: "13px 0",
                color: "var(--text-secondary)",
                fontSize: ".8rem",
                fontWeight: 700,
              }}
            >
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
                required
                style={{
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  font: "inherit",
                }}
              />
            </label>

            {error && (
              <p
                className="auth-error"
                style={{
                  color: "#ef4444",
                  fontSize: ".85rem",
                  marginTop: "8px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary auth-submit shop-full-btn"
              disabled={submitting}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                marginTop: "20px",
              }}
            >
              {submitting
                ? "Please wait..."
                : mode === "create"
                  ? "Create Account"
                  : "Login"}
            </button>
          </form>

          <div className="auth-divider" style={{ margin: "24px 0" }}>
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="btn shop-full-btn"
            onClick={handleGoogleLogin}
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              background: "#ffffff",
              color: "#333",
              border: "1px solid #ccc",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div
            className="shop-modal-links"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            <button
              type="button"
              onClick={() => forgotPassword(email)}
              style={{
                border: 0,
                background: "transparent",
                color: "var(--accent-light, #a78bfa)",
                cursor: "pointer",
                fontSize: ".78rem",
              }}
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "create" : "login");
                setError("");
              }}
              style={{
                border: 0,
                background: "transparent",
                color: "var(--accent-light, #a78bfa)",
                cursor: "pointer",
                fontSize: ".78rem",
              }}
            >
              {mode === "login" ? "Create account" : "Already have an account?"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}