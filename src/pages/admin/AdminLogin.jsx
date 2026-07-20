import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginAdmin,
  persistAdminSession,
} from "../../services/adminAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAdmin") === "true") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await loginAdmin(email, password);

      if (error) {
        setError(error);
        return;
      }

      await persistAdminSession(data.user);

      navigate("/admin/dashboard");
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">

        <div className="admin-login-header">
          <div className="admin-login-icon">🛡️</div>
          <h1>Admin Portal</h1>
          <p>Login with your admin account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="admin-login-form"
          noValidate
        >
          {error && (
            <div className="admin-login-error">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              className="form-input"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              className="form-input"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="admin-back-link">
            ← Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}