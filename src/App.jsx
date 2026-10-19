
import { useEffect, useState } from "react";
import profile from "./assets/profile.jpg";
import GlassScene from "./components/GlassScene";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const profileLinks = {
  github: "https://github.com/abhumika354-cmd",
  linkedin: "https://www.linkedin.com/in/bhumika-rani-8713a7348/",
  email: "abhumika354@gmail.com",
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Projects loaded from MySQL through the backend API
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState({
    type: "",
    message: "",
  });

  // Fetch projects from the backend
  useEffect(() => {
    // Avoid unnecessary public API requests on admin pages
    const path = window.location.pathname;

    if (path === "/admin/login" || path === "/admin/dashboard") {
      setProjectsLoading(false);
      return;
    }

    let active = true;

    const fetchProjects = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/projects"
        );

        if (!response.ok) {
          throw new Error("Failed to load projects");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.projects)) {
          throw new Error("Invalid projects response");
        }

        if (active) {
          setProjects(data.projects);
          setProjectsError("");
        }
      } catch (error) {
        console.error("Projects API error:", error);

        if (active) {
          setProjectsError(
            "Projects could not be loaded. Please check that the backend server is running."
          );
        }
      } finally {
        if (active) {
          setProjectsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      active = false;
    };
  }, []);

  // Update contact form fields
  const handleContactChange = (event) => {
    const { name, value } = event.target;

    setContactForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (contactStatus.message) {
      setContactStatus({ type: "", message: "" });
    }
  };

  // Submit contact message to the backend
  const handleContactSubmit = async (event) => {
    event.preventDefault();

    if (contactLoading) return;

    setContactLoading(true);
    setContactStatus({ type: "", message: "" });

    try {
      const response = await fetch(
        "http://localhost:5000/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: contactForm.name.trim(),
            email: contactForm.email.trim(),
            message: contactForm.message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to send your message."
        );
      }

      setContactForm({
        name: "",
        email: "",
        message: "",
      });

      setContactStatus({
        type: "success",
        message: "Your message has been sent successfully!",
      });
    } catch (error) {
      console.error("Contact form error:", error);

      setContactStatus({
        type: "error",
        message:
          error.message ||
          "Could not send your message. Please try again.",
      });
    } finally {
      setContactLoading(false);
    }
  };

  // Admin page routing
  // Keep these checks after all hooks and before the public portfolio return.
  const currentPath = window.location.pathname;

  if (currentPath === "/admin/login") {
    return <AdminLogin />;
  }

  if (currentPath === "/admin/dashboard") {
    return <AdminDashboard />;
  }

  // Public portfolio starts here
  return (
    <main>
      {/* NAVBAR */}
      <header className="navbar">
        <a
          href="#home"
          className="brand"
          aria-label="Go to homepage"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-symbol">&lt;/&gt;</span>
          <span>
            MyPortfolio<span className="brand-dot">.</span>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <a
            className="nav-contact"
            href="#contact"
            onClick={() => setMenuOpen(false)}
          >
            Let's Talk <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-grid" />
        <GlassScene />

        <div className="hero-content">
          <div className="availability">
            <span className="availability-dot" />
            OPEN TO INTERNSHIP OPPORTUNITIES
          </div>

          <p className="hero-intro">HELLO, I'M</p>

          <h1 className="hero-title">Bhumika</h1>

          <h2 className="hero-role">
            Aspiring <span>Software Developer</span>
          </h2>

          <p className="hero-description">
            I'm a Computer Science student who enjoys turning ideas into
            interactive digital experiences. I'm learning, building, and
            exploring new technologies one project at a time.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="button-primary">
              Explore My Work <span aria-hidden="true">↗</span>
            </a>

            <a
              href="/resume.pdf"
              download="Bhumika_Resume.pdf"
              className="button-secondary"
            >
              Download Resume <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* HERO SOCIAL LINKS */}
          <div className="hero-socials">
            <span>LET'S CONNECT</span>

            <a
              href={profileLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my GitHub profile"
            >
              GH
            </a>

            <a
              href={profileLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my LinkedIn profile"
            >
              in
            </a>

            <a
              href={`mailto:${profileLinks.email}`}
              aria-label="Email me"
            >
              @
            </a>
          </div>
        </div>

        {/* PROFILE PHOTO */}
        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="profile-frame">
            <div className="profile-image-wrap">
              <img
                className="profile-image"
                src={profile}
                alt="Portrait of Bhumika"
              />
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <span className="floating-icon purple-icon">✦</span>
            <div>
              <strong>Creative Mind</strong>
              <small>Ideas into reality</small>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span className="floating-icon blue-icon">&lt;/&gt;</span>
            <div>
              <strong>Always Learning</strong>
              <small>Growing every day</small>
            </div>
          </div>

          <div className="spark spark-one">✦</div>
          <div className="spark spark-two">✧</div>
          <div className="spark spark-three">·</div>
        </div>

        <a href="#about" className="scroll-indicator">
          <span className="scroll-line" />
          SCROLL TO EXPLORE
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      {/* ABOUT SECTION */}
      <section className="portfolio-section" id="about">
        <span className="section-eyebrow">01 — ABOUT ME</span>

        <h2>
          A little about <span className="gradient-text">me.</span>
        </h2>

        <p className="section-description">
          I'm a B.Tech Computer Science student passionate about software
          development, problem-solving, and creating useful digital
          experiences.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <span className="about-icon">🎓</span>
            <h3>My Education</h3>
            <p>
              Currently pursuing B.Tech in Computer Science and Engineering.
            </p>
          </div>

          <div className="about-card">
            <span className="about-icon">💻</span>
            <h3>My Interests</h3>
            <p>
              Web development, programming, data science, and learning new
              technologies.
            </p>
          </div>

          <div className="about-card">
            <span className="about-icon">🚀</span>
            <h3>My Goal</h3>
            <p>
              To grow as a software developer by building projects and
              gaining practical experience.
            </p>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section
        className="portfolio-section alternate-section"
        id="skills"
      >
        <span className="section-eyebrow">02 — MY SKILLS</span>

        <h2>
          Tools I work <span className="gradient-text">with.</span>
        </h2>

        <p className="section-description">
          Technologies I'm learning and using to build projects and strengthen
          my development skills.
        </p>

        <div className="skills-grid">
          <div className="skill-card">
            <span>⌨️</span>
            <h3>C / C++</h3>
            <p>Programming fundamentals</p>
          </div>

          <div className="skill-card">
            <span>🐍</span>
            <h3>Python</h3>
            <p>Programming and ML projects</p>
          </div>

          <div className="skill-card">
            <span>🌐</span>
            <h3>HTML & CSS</h3>
            <p>Web page structure and styling</p>
          </div>

          <div className="skill-card">
            <span>⚡</span>
            <h3>JavaScript</h3>
            <p>Interactive web development</p>
          </div>

          <div className="skill-card">
            <span>⚛️</span>
            <h3>React</h3>
            <p>Component-based user interfaces</p>
          </div>

          <div className="skill-card">
            <span>🛠️</span>
            <h3>MERN Basics</h3>
            <p>MongoDB, Express, React, Node.js</p>
          </div>
        </div>

        <p className="skills-note">
          I keep improving my skills through practice, coursework, and personal
          projects.
        </p>
      </section>

      {/* PROJECTS SECTION — DATA FROM MYSQL API */}
      <section className="portfolio-section" id="projects">
        <span className="section-eyebrow">03 — MY PROJECTS</span>

        <h2>
          Things I've <span className="gradient-text">built.</span>
        </h2>

        <p className="section-description">
          A selection of projects that reflect my learning and interest in
          software development.
        </p>

        <div className="projects-grid">
          {projectsLoading ? (
            <p className="section-description">Loading projects...</p>
          ) : projectsError ? (
            <p className="section-description">{projectsError}</p>
          ) : projects.length === 0 ? (
            <p className="section-description">
              No projects have been added yet.
            </p>
          ) : (
            projects.map((project, index) => {
              const title = (project.title || "").toLowerCase();

              const emoji = title.includes("skillsync")
                ? "🎯"
                : title.includes("automata")
                  ? "🤖"
                  : title.includes("exam score")
                    ? "📊"
                    : title.includes("evaluation")
                      ? "🎓"
                      : "💻";

              const techStack = project.tech_stack
                ? project.tech_stack
                  .split(",")
                  .map((tech) => tech.trim())
                  .filter(Boolean)
                : [];

              return (
                <article className="project-card" key={project.id}>
                  {project.image_url && (
                    <div className="project-image-wrap">
                      <img
                        src={project.image_url}
                        alt={`${project.title} project preview`}
                        className="project-image"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.parentElement.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="project-number">
                    PROJECT {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="project-emoji">{emoji}</div>

                  <h3>{project.title}</h3>

                  <p>{project.description}</p>

                  <div className="project-tags">
                    {techStack.map((tech, techIndex) => (
                      <span key={`${project.id}-${techIndex}`}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  {project.project_link ? (
                    <a
                      className="project-status"
                      href={project.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Project ↗
                    </a>
                  ) : (
                    <span className="project-status">
                      Student Project
                    </span>
                  )}
                </article>
              );
            })
          )}
        </div>

        <p className="projects-note">
          Project links can be added once your repositories are ready to share.
        </p>
      </section>

      {/* CONTACT SECTION — SAVES MESSAGES TO MYSQL */}
      <section
        className="portfolio-section alternate-section"
        id="contact"
      >
        <span className="section-eyebrow">04 — GET IN TOUCH</span>

        <h2>
          Let's build something <span className="gradient-text">great.</span>
        </h2>

        <p className="section-description">
          I'm interested in learning opportunities, internships,
          collaborations, and connecting with fellow developers.
        </p>

        <div className="contact-card">
          <span className="contact-icon">✉️</span>

          <h3>Have an opportunity in mind?</h3>

          <p>Feel free to reach out. I'd be happy to connect!</p>

          <form
            className="contact-form"
            onSubmit={handleContactSubmit}
          >
            <div className="contact-form-group">
              <label htmlFor="contact-name">Your Name</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={contactForm.name}
                onChange={handleContactChange}
                maxLength={100}
                autoComplete="name"
                required
                disabled={contactLoading}
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="contact-email">Your Email</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={contactForm.email}
                onChange={handleContactChange}
                maxLength={255}
                autoComplete="email"
                required
                disabled={contactLoading}
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="contact-message">Your Message</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Write your message here..."
                value={contactForm.message}
                onChange={handleContactChange}
                maxLength={5000}
                rows={5}
                required
                disabled={contactLoading}
              />
            </div>

            <button
              type="submit"
              className="button-primary"
              disabled={contactLoading}
            >
              {contactLoading ? "Sending..." : "Send Message"}
              {!contactLoading && (
                <span aria-hidden="true"> ↗</span>
              )}
            </button>

            {contactStatus.message && (
              <p
                className={`contact-form-status ${contactStatus.type === "success"
                    ? "contact-success"
                    : "contact-error"
                  }`}
                role="status"
                aria-live="polite"
              >
                {contactStatus.message}
              </p>
            )}
          </form>

          <div className="contact-links">
            <a
              href={profileLinks.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>

            <a
              href={profileLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>

          <p className="contact-email">{profileLinks.email}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <a href="#home" className="brand">
          <span className="brand-symbol">&lt;/&gt;</span>
          <span>
            MyPortfolio<span className="brand-dot">.</span>
          </span>
        </a>

        <p>Designed & built by Bhumika with React and CSS.</p>

        <a href="#home" className="back-to-top">
          Back to top ↑
        </a>
      </footer>
    </main>
  );
}

export default App;
