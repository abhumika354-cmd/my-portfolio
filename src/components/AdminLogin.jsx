
import { useState } from "react";
import "./Admin.css";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      sessionStorage.setItem("adminToken", data.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend is not running. Please start the backend."
          : err.message
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
