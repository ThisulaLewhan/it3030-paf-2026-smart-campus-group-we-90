import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// SVG icon components for sidebar menu items
const icons = {
  dashboard: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  profile: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  activity: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  security: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  notifications: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  resources: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  bookings: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  tickets: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  admin: (
    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
};

// Master configuration dictionary for all navigational routes on the frontend!
// By adding the 'allowedRoles' array prop, we dynamically secure elements from the DOM without writing dozens of messy if-else checks
const moduleLinks = [
  // General section
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", section: "General" },
  { to: "/profile", label: "My Profile", icon: "profile", section: "General" },
  { to: "/security", label: "Account Security", icon: "security", section: "General" },
  { to: "/notifications", label: "Notifications", icon: "notifications", section: "General" },

  // Services section
  { to: "/resources", label: "Resources", icon: "resources", section: "Services" },
  { to: "/bookings", label: "Bookings", icon: "bookings", section: "Services" },
  { to: "/tickets", label: "Support Tickets", icon: "tickets", section: "Services" },

  // Administration section
  // Explicitly restricted structural elements that require massive privilege
  { to: "/admin/users", label: "User Roles", icon: "admin", allowedRoles: ["ADMIN"], section: "Admin" },
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

  // Group links by section
  const sections = [];
  let currentSection = null;

  visibleLinks.forEach((link) => {
    if (link.section !== currentSection) {
      currentSection = link.section;
      sections.push({ label: link.section, links: [] });
    }
    sections[sections.length - 1].links.push(link);
  });

  return (
    <aside className="sidebar">
      {sections.map((section, idx) => (
        <div key={section.label}>
          {idx > 0 && <div className="sidebar-divider" />}
          <div className="sidebar-section-label">{section.label}</div>
          <ul>
            {section.links.map((link) => (
              <li key={link.to}>
                <NavLink
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? " active" : ""}`
                  }
                  to={link.to}
                >
                  {icons[link.icon]}
                  <span>{link.label}</span>

                  {/* Optional: Visually tag heavily restricted elements so Admins know they are in a protected area */}
                  {link.allowedRoles && link.allowedRoles.includes('ADMIN') && (
                    <span className="sidebar-admin-badge">Admin</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="sidebar-footer">
        <span className="sidebar-footer-dot" />
        Smart Campus v1.0
      </div>
    </aside>
  );
}

export default Sidebar;
