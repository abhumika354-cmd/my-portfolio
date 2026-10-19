
import { useState } from "react";
import "./Admin.css";

const API_URL = "/api";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (response.status === 404) {
          throw new Error(
            "Login API route not found. Please check the backend admin login route."
          );
        }

        if (response.status >= 500) {
          throw new Error(
            "Server error. Please check the backend logs and try again."
          );
        }

        throw new Error(data.message || "Invalid username or password.");
      }

      if (!data.token) {
        throw new Error(
          "Login response did not include an authentication token."
        );
      }

      sessionStorage.setItem("adminToken", data.token);

      window.location.replace("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the live backend. Please try again."
          : err.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-login-card">
        <div className="admin-icon">🔐</div>

        <p className="admin-eyebrow">PORTFOLIO CONTROL PANEL</p>

        <h1>Admin Login</h1>

        <p className="admin-description">
          Sign in to manage your portfolio.
        </p>

        <form className="admin-form" onSubmit={handleLogin}>
          <label htmlFor="admin-username">Username</label>

          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            placeholder="Enter admin username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={100}
            required
            disabled={loading}
          />

          <label htmlFor="admin-password">Password</label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter admin password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={128}
            required
            disabled={loading}
          />

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <a className="admin-back-link" href="/">
          ← Back to Portfolio
        </a>
      </section>
    </main>
  );
}

export default AdminLogin;
