import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

function LandingPage() {
  const { isAuthenticated } = useAuth();
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: "Bookings",
      description: "Reserve rooms, labs, and campus resources with real-time availability tracking.",
      color: "blue",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: "Resources",
      description: "Manage labs, equipment, and shared campus facilities from one central hub.",
      color: "emerald",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      title: "Notifications",
      description: "Stay up to date with campus alerts, announcements, and activity updates.",
      color: "amber",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      title: "Support Tickets",
      description: "Report issues, track resolutions, and get campus support quickly.",
      color: "violet",
    },
  ];

  const stats = [
    { value: "24/7", label: "Campus Access" },
    { value: "100%", label: "Digital Services" },
    { value: "Fast", label: "Response Time" },
    { value: "Secure", label: "Data Protection" },
  ];

  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <span className="landing-nav-logo">SC</span>
            <span className="landing-nav-name">Smart Campus</span>
          </div>
          <nav className="landing-nav-links">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-nav-cta">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-link">Sign In</Link>
                <Link to="/register" className="landing-nav-cta">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="landing-hero-orb landing-hero-orb-1" />
          <div className="landing-hero-orb landing-hero-orb-2" />
          <div className="landing-hero-orb landing-hero-orb-3" />
        </div>
        <div className="landing-hero-content">
          <span className="landing-hero-badge">✨ University Platform</span>
          <h1 className="landing-hero-title">
            Your Campus,<br />
            <span className="landing-hero-gradient-text">All in One Place</span>
          </h1>
          <p className="landing-hero-description">
            Smart Campus brings all university-related activities into one unified platform.
            Manage bookings, track notifications, access resources, and handle support — faster, simpler, and smarter.
          </p>
          <div className="landing-hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-btn-primary">
                Open Dashboard
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing-btn-primary">
                  Create Account
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link to="/login" className="landing-btn-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          {stats.map((stat) => (
            <div className="landing-stat" key={stat.label}>
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-features-inner">
          <div className="landing-features-header">
            <span className="landing-section-eyebrow">Platform Features</span>
            <h2 className="landing-section-title">Everything you need for campus life</h2>
            <p className="landing-section-subtitle">
              Access all university services from one central hub. No more jumping between different systems.
            </p>
          </div>
          <div className="landing-features-grid">
            {features.map((feature) => (
              <div className={`landing-feature-card landing-feature-${feature.color}`} key={feature.title}>
                <div className="landing-feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <div className="landing-cta-card">
            <h2>Ready to get started?</h2>
            <p>Join Smart Campus today and simplify your university experience.</p>
            <div className="landing-cta-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="landing-btn-primary">
                  Go to Dashboard
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="landing-btn-primary">
                    Create Your Account
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <Link to="/login" className="landing-btn-secondary">
                    Sign In Instead
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span className="landing-nav-logo">SC</span>
            <span>Smart Campus</span>
          </div>
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} Smart Campus. Built for university communities.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
