import React, { useState, useEffect } from "react";
import { getUsers, getUserOrderCount } from "../../services/ecommerceService";

const ADMIN_EMAIL = "shakeelbhatti143143@gmail.com";

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data || []);
        const map = {};
        await Promise.all(
          (data || []).map(async (u) => {
            try {
              map[u.id] = await getUserOrderCount(u.id);
            } catch {
              map[u.id] = 0;
            }
          })
        );
        setCounts(map);
      } catch (e) {
        console.error(e);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="admin-messages-section">
      <div className="admin-section-header">
        <h3>Registered Users ({users.length})</h3>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="admin-empty">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-empty">
                  No registered users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.full_name || "—"}</strong>
                  </td>
                  <td>
                    <a href={`mailto:${u.email}`} className="admin-email-link">
                      {u.email}
                    </a>
                  </td>
                  <td className="admin-date-cell">{formatDate(u.created_at)}</td>
                  <td>{counts[u.id] ?? 0}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        u.email?.toLowerCase() === ADMIN_EMAIL ? "approved" : "read"
                      }`}
                    >
                      {u.email?.toLowerCase() === ADMIN_EMAIL ? "Admin" : "Customer"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
