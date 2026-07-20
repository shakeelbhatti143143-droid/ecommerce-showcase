import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../assets/subabaseclient";
import { getUserRole, setStoredRole } from "../../services/auth";
import { persistAdminSession } from "../../services/adminAuth";

export default function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    async function handleAuth() {
      try {
        // First, try to get the session - Supabase may have already processed the hash
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const role = getUserRole(session.user);
          setStoredRole(role);
          
          if (role === "admin") {
            persistAdminSession({
              email: session.user.email,
              name: session.user.user_metadata?.full_name || "Admin",
            });
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/user-dashboard", { replace: true });
          }
          return;
        }

        // If no session, check the hash fragment directly
        const hash = window.location.hash.substring(1);
        if (!hash && mounted) {
          navigate("/login", { replace: true });
          return;
        }

        // Parse the access token from hash and set the session
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!sessionError && data?.user && mounted) {
            const role = getUserRole(data.user);
            setStoredRole(role);

            if (role === "admin") {
              persistAdminSession({
                email: data.user.email,
                name: data.user.user_metadata?.full_name || "Admin",
              });
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/user-dashboard", { replace: true });
            }
            return;
          }
        }

        // If still no session after a short delay, listen for auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && currentSession?.user && mounted) {
            const role = getUserRole(currentSession.user);
            setStoredRole(role);
            subscription.unsubscribe();

            if (role === "admin") {
              persistAdminSession({
                email: currentSession.user.email,
                name: currentSession.user.user_metadata?.full_name || "Admin",
              });
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/user-dashboard", { replace: true });
            }
          }
        });

        // Timeout fallback
        timeoutId = setTimeout(() => {
          if (mounted) {
            subscription.unsubscribe();
            navigate("/login", { replace: true });
          }
        }, 5000);

        return () => {
          clearTimeout(timeoutId);
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Callback error:", err);
        if (mounted) {
          navigate("/login", { replace: true });
        }
      }
    }

    handleAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Authentication Error</h1>
              <p>{error}</p>
              <p>
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/login")}
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="dashboard-loading">
              <div className="dashboard-loading-spinner" />
              <p>Completing sign in...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}