import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="app-header">
      <div className="app-brand">Smart Campus Management System</div>
      <nav>
        <NavLink className={({ isActive }) => (isActive ? "active" : "")} to="/">
          Dashboard
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "active" : "")}
          to="/auth/login"
        >
          Sign In
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
