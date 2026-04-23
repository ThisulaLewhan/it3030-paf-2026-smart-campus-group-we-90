import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationPanel from "./NotificationPanel";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || "Campus User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CU";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <NavLink to="/" className="app-brand" aria-label="Go to home">
          <span className="app-brand-mark">SC</span>
          <span className="app-brand-copy">
            <span className="app-brand-title">Smart Campus</span>
            <span className="app-brand-subtitle">Operations Hub</span>
          </span>
        </NavLink>

        {isAuthenticated ? (
          <nav className="app-nav">
            <NotificationPanel />

            <div className="header-user-cluster">
              <NavLink
                to="/dashboard"
                className="header-user-card"
                aria-label="Go to dashboard"
              >
                <span className="header-user-avatar">{initials}</span>
                <span className="header-user-copy">
                  <span className="header-user-greeting">Signed in as</span>
                  <span className="header-user-name-row">
                    <span className="header-user-name">{displayName}</span>
                  </span>
                </span>
              </NavLink>

              <button
                type="button"
                className="header-logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </nav>
        ) : (
          <nav className="app-nav">
            <NavLink
              className="app-nav-link"
              to="/login"
            >
              Sign In
            </NavLink>
            <NavLink
              className="app-nav-cta"
              to="/register"
            >
              Get Started
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
