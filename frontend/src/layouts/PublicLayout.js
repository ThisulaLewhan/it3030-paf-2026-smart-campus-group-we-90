import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="public-page-content">
        <Outlet />
      </div>
    </div>
  );
}

export default PublicLayout;
