import { NavLink } from "react-router-dom";

const moduleLinks = [
  { to: "/resources", label: "Resources" },
  { to: "/bookings", label: "Bookings" },
  { to: "/tickets", label: "Tickets" },
  { to: "/notifications", label: "Notifications" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Modules</h2>
      <p>Each feature area can now be developed independently.</p>
      <ul>
        {moduleLinks.map((link) => (
          <li key={link.to}>
            <NavLink
              className={({ isActive }) => (isActive ? "active" : "")}
              to={link.to}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
