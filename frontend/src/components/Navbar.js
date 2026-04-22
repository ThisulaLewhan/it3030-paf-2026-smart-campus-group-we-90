import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationPanel from "./NotificationPanel";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || "Campus User";
  const firstName = displayName.split(" ")[0];
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
        <NavLink to="/dashboard" className="app-brand" aria-label="Go to dashboard">
          <span className="app-brand-mark">SC</span>
          <span className="app-brand-copy">
            <span className="app-brand-title">Smart Campus</span>
            <span className="app-brand-subtitle">Admin and user workspace</span>
          </span>
        </NavLink>

        {isAuthenticated ? (
          <nav className="app-nav">
            <NavLink
              className={({ isActive }) =>
                `app-nav-link${isActive ? " active" : ""}`
              }
              to="/dashboard"
            >
              Dashboard
            </NavLink>

            <NotificationPanel />

            <div className="header-user-cluster">
              <NavLink
                to="/profile"
                className="header-user-card"
                aria-label="Open profile"
              >
                <span className="header-user-avatar">{initials}</span>
                <span className="header-user-copy">
                  <span className="header-user-greeting">Signed in as {firstName}</span>
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
          <NavLink
            className="app-nav-link"
            to="/login"
          >
            Secure Login
          </NavLink>
        )}
      </div>
    </header>
  );
}

export default Navbar;
