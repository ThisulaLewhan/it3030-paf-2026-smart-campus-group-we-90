import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <section className="unauthorized-page">
      <div className="unauthorized-card">
        <p className="unauthorized-eyebrow">Access Restricted</p>
        <h1>You do not have permission to view this page.</h1>
        <p className="unauthorized-copy">
          Your account does not currently have the required access for this section of the smart campus system.
        </p>
        <Link to="/dashboard" className="unauthorized-button">
          Return to Dashboard
        </Link>
      </div>
    </section>
  );
}

export default Unauthorized;
