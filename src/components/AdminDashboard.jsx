
import { useCallback, useEffect, useState } from "react";
import "./Admin.css";

const API_URL = "http://localhost:5000/api";

const emptyProject = {
  title: "",
  description: "",
  tech_stack: "",
  project_link: "",
  image_url: "",
};

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);

  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const token = sessionStorage.getItem("adminToken");

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("adminToken");
    window.location.replace("/admin/login");
  }, []);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadProjects = useCallback(async () => {
    const response = await fetch(`${API_URL}/projects`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load projects.");
    }

    setProjects(data.projects || []);
  }, []);

  const loadMessages = useCallback(async () => {
    const response = await fetch(`${API_URL}/contact`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load messages.");
    }

    setMessages(data.messages || []);
  }, [token, handleLogout]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to verify admin access.");
      }

      setAdmin(data.admin);
      await Promise.all([loadProjects(), loadMessages()]);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, [token, handleLogout, loadProjects, loadMessages]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handleProjectChange(event) {
    const { name, value } = event.target;

    setProjectForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image_url") {
      setImagePreviewError(false);
    }
  }

  function resetProjectForm() {
    setEditingId(null);
    setProjectForm({ ...emptyProject });
    setImagePreviewError(false);
  }

  function startEditing(project) {
    setEditingId(project.id);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      tech_stack: project.tech_stack || "",
      project_link: project.project_link || "",
      image_url: project.image_url || "",
    });

    setImagePreviewError(false);
    setActiveTab("projects");
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleProjectSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const url = editingId
        ? `${API_URL}/projects/${editingId}`
        : `${API_URL}/projects`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify(projectForm),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save project.");
      }

      resetProjectForm();
      setNotice(data.message || "Project saved successfully.");
      await loadProjects();
    } catch (err) {
      setError(err.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete project "${project.title}"?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/projects/${project.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete project.");
      }

      if (editingId === project.id) {
        resetProjectForm();
      }

      setNotice(data.message || "Project deleted successfully.");
      await loadProjects();
    } catch (err) {
      setError(err.message || "Unable to delete project.");
    }
  }

  async function deleteMessage(message) {
    if (!window.confirm(`Delete message from ${message.name}?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/contact/${message.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete message.");
      }

      setMessages((previous) =>
        previous.filter((item) => item.id !== message.id)
      );

      setNotice("Contact message deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete message.");
    }
  }

  async function refreshMessages() {
    setError("");
    setNotice("");

    try {
      await loadMessages();
    } catch (err) {
      setError(err.message || "Unable to refresh messages.");
    }
  }

  const styles = {
    panel: {
      background: "rgba(255, 255, 255, 0.04)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "14px",
      padding: "22px",
      marginBottom: "22px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      marginTop: "7px",
      borderRadius: "8px",
      border: "1px solid #51476b",
      background: "#151321",
      color: "#fff",
      font: "inherit",
    },
    button: {
      padding: "10px 15px",
      border: "1px solid #7761b5",
      borderRadius: "8px",
      background: "#302449",
      color: "#fff",
      cursor: "pointer",
      font: "inherit",
    },
    primary: {
      padding: "11px 17px",
      border: "none",
      borderRadius: "8px",
      background: "#8b5cf6",
      color: "#fff",
      cursor: "pointer",
      font: "inherit",
      fontWeight: 600,
    },
    danger: {
      padding: "9px 13px",
      border: "1px solid #a74760",
      borderRadius: "8px",
      background: "#401c2a",
      color: "#ffd9e2",
      cursor: "pointer",
      font: "inherit",
    },
    preview: {
      display: "block",
      width: "100%",
      maxWidth: "500px",
      maxHeight: "280px",
      objectFit: "cover",
      objectPosition: "center",
      borderRadius: "12px",
      border: "1px solid rgba(189, 131, 255, 0.35)",
      marginTop: "12px",
      background: "#151321",
    },
  };

  if (loading) {
    return (
      <main className="admin-page">
        <p className="admin-description">Verifying admin access...</p>
      </main>
    );
  }

  if (error && !admin) {
    return (
      <main className="admin-page">
        <section className="admin-login-card">
          <h1>Connection Error</h1>
          <p className="admin-error">{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
          <button
            className="admin-secondary-button"
            onClick={handleLogout}
          >
            Back to Login
          </button>
        </section>
      </main>
    );
  }

  if (!admin) return null;

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar">
        <a href="/" className="admin-brand">
          My Portfolio <span>Admin</span>
        </a>

        <button className="admin-logout" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <section className="admin-dashboard-content">
        <p className="admin-eyebrow">CONTROL PANEL</p>
        <h1>Welcome, {admin.username}!</h1>
        <p className="admin-description">
          Manage your portfolio content from one place.
        </p>

        {error && (
          <div role="alert" style={{ ...styles.panel, color: "#ffb8c6" }}>
            {error}
          </div>
        )}

        {notice && (
          <div role="status" style={{ ...styles.panel, color: "#a7f3d0" }}>
            {notice}
          </div>
        )}

        <div className="admin-stats">
          <article
            className="admin-stat-card"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("projects")}
          >
            <span>📁</span>
            <h2>Projects</h2>
            <p>Manage your portfolio projects.</p>
            <small>{projects.length} projects</small>
          </article>

          <article
            className="admin-stat-card"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("messages")}
          >
            <span>✉️</span>
            <h2>Messages</h2>
            <p>View messages submitted through your contact form.</p>
            <small>{messages.length} messages</small>
          </article>

          <article className="admin-stat-card">
            <span>🛡️</span>
            <h2>Security</h2>
            <p>Your admin session is verified by the backend.</p>
            <small>JWT authentication active</small>
          </article>
        </div>

        <section style={{ marginTop: "30px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "22px",
            }}
          >
            <button
              style={{
                ...styles.button,
                ...(activeTab === "projects"
                  ? { background: "#8b5cf6", borderColor: "#8b5cf6" }
                  : {}),
              }}
              onClick={() => {
                setActiveTab("projects");
                setError("");
                setNotice("");
              }}
            >
              Manage Projects
            </button>

            <button
              style={{
                ...styles.button,
                ...(activeTab === "messages"
                  ? { background: "#8b5cf6", borderColor: "#8b5cf6" }
                  : {}),
              }}
              onClick={() => {
                setActiveTab("messages");
                setError("");
                setNotice("");
              }}
            >
              Contact Messages
            </button>
          </div>

          {activeTab === "projects" && (
            <>
              <section style={styles.panel}>
                <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>

                <form
                  onSubmit={handleProjectSubmit}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <label>
                    Project Title *
                    <input
                      style={styles.input}
                      name="title"
                      value={projectForm.title}
                      onChange={handleProjectChange}
                      maxLength={255}
                      required
                    />
                  </label>

                  <label>
                    Tech Stack *
                    <input
                      style={styles.input}
                      name="tech_stack"
                      value={projectForm.tech_stack}
                      onChange={handleProjectChange}
                      maxLength={1000}
                      placeholder="React, Node.js, MySQL"
                      required
                    />
                  </label>

                  <label style={{ gridColumn: "1 / -1" }}>
                    Description *
                    <textarea
                      style={{ ...styles.input, minHeight: "110px" }}
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectChange}
                      maxLength={5000}
                      required
                    />
                  </label>

                  <label>
                    Project Link
                    <input
                      style={styles.input}
                      type="url"
                      name="project_link"
                      value={projectForm.project_link}
                      onChange={handleProjectChange}
                      placeholder="https://..."
                    />
                  </label>

                  <label>
                    Image URL
                    <input
                      style={styles.input}
                      type="url"
                      name="image_url"
                      value={projectForm.image_url}
                      onChange={handleProjectChange}
                      placeholder="https://..."
                    />
                  </label>

                  {/* LIVE IMAGE PREVIEW */}
                  {projectForm.image_url.trim() && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <h3 style={{ marginBottom: "8px" }}>
                        Image Preview
                      </h3>

                      {imagePreviewError ? (
                        <p role="alert" style={{ color: "#fca5a5" }}>
                          Image not found. check the URL and paste a direct
                          image link.
                        </p>
                      ) : (
                        <img
                          key={projectForm.image_url}
                          src={projectForm.image_url.trim()}
                          alt="Project preview"
                          style={styles.preview}
                          onError={() => setImagePreviewError(true)}
                          onLoad={() => setImagePreviewError(false)}
                        />
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="submit"
                      style={styles.primary}
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                          ? "Update Project"
                          : "Add Project"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        style={styles.button}
                        onClick={resetProjectForm}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section style={styles.panel}>
                <h2>Your Projects</h2>

                {projects.length === 0 ? (
                  <p>No projects found. Add your first project above.</p>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {projects.map((project) => (
                      <article
                        key={project.id}
                        style={{
                          ...styles.panel,
                          marginBottom: 0,
                        }}
                      >
                        {project.image_url && (
                          <img
                            src={project.image_url}
                            alt={`${project.title} preview`}
                            loading="lazy"
                            style={styles.preview}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        )}

                        <h3 style={{ marginTop: "14px" }}>
                          {project.title}
                        </h3>

                        <p style={{ whiteSpace: "pre-wrap" }}>
                          {project.description}
                        </p>

                        <p>
                          <strong>Tech stack:</strong> {project.tech_stack}
                        </p>

                        {project.project_link && (
                          <p>
                            <a
                              href={project.project_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open Project
                            </a>
                          </p>
                        )}

                        {project.image_url && (
                          <p>
                            <a
                              href={project.image_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Full Image
                            </a>
                          </p>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <button
                            style={styles.button}
                            onClick={() => startEditing(project)}
                          >
                            Edit
                          </button>

                          <button
                            style={styles.danger}
                            onClick={() => deleteProject(project)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === "messages" && (
            <section style={styles.panel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <h2>Contact Messages</h2>

                <button style={styles.button} onClick={refreshMessages}>
                  Refresh Messages
                </button>
              </div>

              {messages.length === 0 ? (
                <p>
                  No messages found. Submit a test message from your
                  portfolio contact form.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      style={{
                        ...styles.panel,
                        marginBottom: 0,
                      }}
                    >
                      <h3>{message.name}</h3>

                      <p>
                        <strong>Email:</strong>{" "}
                        <a href={`mailto:${message.email}`}>
                          {message.email}
                        </a>
                      </p>

                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {message.message}
                      </p>

                      {message.created_at && (
                        <small>
                          Received:{" "}
                          {new Date(message.created_at).toLocaleString()}
                        </small>
                      )}

                      <div style={{ marginTop: "14px" }}>
                        <button
                          style={styles.danger}
                          onClick={() => deleteMessage(message)}
                        >
                          Delete Message
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>

        <a className="admin-back-link" href="/">
          ← View Public Portfolio
        </a>
      </section>
    </main>
  );
}

export default AdminDashboard;
