import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  const formattedRole = useMemo(() => {
    if (!user?.role) {
      return "Campus User";
    }

    return user.role
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [user?.role]);

  const actionCards = useMemo(() => {
    const baseCards = [
      {
        title: "My Profile",
        description: "Review your account details and personal settings.",
        to: "/profile",
        accent: "blue",
      },
      {
        title: "Notifications",
        description: "Stay on top of alerts, updates, and unread activity.",
        to: "/notifications",
        accent: "amber",
      },
      {
        title: "Bookings",
        description: "Manage room, lab, and resource reservations.",
        to: "/bookings",
        accent: "emerald",
      },
      {
        title: "Support Tickets",
        description: "Track requests, issues, and campus support tasks.",
        to: "/tickets",
        accent: "slate",
      },
    ];

    if (user?.role === "ADMIN") {
      return [
        ...baseCards,
        {
          title: "User Management",
          description: "Review users and update roles across the system.",
          to: "/admin/users",
          accent: "rose",
        },
      ];
    }

    return baseCards;
  }, [user?.role]);

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <p className="dashboard-eyebrow">Smart Campus Dashboard</p>
          <h1>Welcome back, {user?.name || "Campus User"}</h1>
          <p className="dashboard-subtitle">
            Start from the actions you use most and keep your campus work moving from one place.
          </p>
        </div>

        <div className="dashboard-role-panel">
          <span className="dashboard-role-label">Signed in as</span>
          <strong className="dashboard-role-value">{formattedRole}</strong>
          <Link className="dashboard-role-link" to="/security">
            Account Security
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Quick Actions</h2>
          <p>Open the parts of the system you’re most likely to need next.</p>
        </div>

        <div className="dashboard-grid">
          {actionCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`dashboard-card dashboard-card-${card.accent}`}
            >
              <div className="dashboard-card-top">
                <span className="dashboard-card-badge">{card.title}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="dashboard-card-link">Open</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
