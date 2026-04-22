import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Master configuration dictionary for all navigational routes on the frontend!
// By adding the 'allowedRoles' array prop, we dynamically secure elements from the DOM without writing dozens of messy if-else checks
const moduleLinks = [
  // Universally visible to any logged-in student/user
  { to: "/profile", label: "My Profile" },
  { to: "/security", label: "Account Security" },
  { to: "/notifications/preferences", label: "Notification Preferences" },
  { to: "/resources", label: "Resources" }, 
  { to: "/bookings", label: "Bookings" },
  { to: "/tickets", label: "Support Tickets" },
  
  // Explicitly restricted structural elements that require massive privilege
  { to: "/admin/users", label: "User Roles", allowedRoles: ["ADMIN"] },
  { to: "/admin/system", label: "System Config", allowedRoles: ["ADMIN"] },
];

function Sidebar() {
  // Directly tap the Context Provider to read the raw memory state continuously
  const { user } = useAuth();
  const userRole = user?.role;

  // Single source-of-truth filter loop
  // It mechanically strips unapproved links cleanly from the React DOM before rendering
  const visibleLinks = moduleLinks.filter((link) => {
    // 1. If no specific roles are enforced, the module is globally accessible to anyone
    if (!link.allowedRoles || link.allowedRoles.length === 0) return true;
    
    // 2. If it is strict, cross-reference the user's DB Enum immediately
    return userRole && link.allowedRoles.includes(userRole);
  });

  return (
    <aside className="sidebar" style={{ width: '250px', padding: '25px 20px', background: '#f8fafc', height: '100%', minHeight: '100vh', borderRight: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
      
      <h2 style={{ fontSize: '0.85rem', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', paddingLeft: '5px' }}>
        Menu Context
      </h2>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Magically iterate only over structurally cleared UI components */}
        {visibleLinks.map((link) => (
          <li key={link.to}>
            <NavLink
              className={({ isActive }) => (isActive ? "active" : "")}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                textDecoration: 'none',
                color: isActive ? '#2b6cb0' : '#4a5568',
                backgroundColor: isActive ? '#ebf8ff' : 'transparent',
                borderRadius: '8px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
              })}
            >
              <span>{link.label}</span>
              
              {/* Optional: Visually tag heavily restricted elements so Admins know they are in a protected area */}
              {link.allowedRoles && link.allowedRoles.includes('ADMIN') && (
                <span style={{ fontSize: '0.65rem', background: '#fed7d7', color: '#c53030', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  ADMIN
                </span>
              )}
            </NavLink>
          </li>
        ))}

      </ul>
    </aside>
  );
}

export default Sidebar;
