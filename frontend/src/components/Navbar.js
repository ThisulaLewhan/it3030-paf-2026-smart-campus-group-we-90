import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationPanel from "./NotificationPanel";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Bounce them back to the login wall instantaneously
    navigate("/login");
  };

  return (
    <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
      <div className="app-brand" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2d3748' }}>Smart Campus</div>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {isAuthenticated ? (
          <>
            <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/dashboard" style={{ textDecoration: 'none', color: '#4a5568' }}>
              Dashboard
            </NavLink>

            {/* Isolated Notification System injected seamlessly */}
            <NotificationPanel />

            {/* Quick User Actions */}
            <div className="user-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid #e2e8f0', paddingLeft: '15px' }}>
              <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                {user?.name || 'Loading...'} 
                {user?.role && <span style={{ fontSize: '0.7rem', background: '#cdf6e3', color: '#047857', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>{user.role}</span>}
              </span>
              
              <button 
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e0',
                  color: '#4a5568',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#f7fafc'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <NavLink
            className={({ isActive }) => (isActive ? "active" : "")}
            to="/login"
            style={{ textDecoration: 'none', color: '#3182ce', fontWeight: 'bold' }}
          >
            Secure Login
          </NavLink>
        )}

      </nav>
    </header>
  );
}

export default Navbar;
