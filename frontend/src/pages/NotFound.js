import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="notfound-page">
      <div className="notfound-card">
        <p className="notfound-eyebrow">404</p>
        <h1>We couldn’t find that page.</h1>
        <p className="notfound-copy">
          The page you requested does not exist or may have been moved. You can head back to the dashboard and continue from there.
        </p>
        <Link to="/dashboard" className="notfound-button">
          Return to Dashboard
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
