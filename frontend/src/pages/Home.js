import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

// SVG icon components for dashboard cards
const cardIcons = {
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  tickets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
};

function Home() {
  const { user } = useAuth();

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

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
        icon: "profile",
      },
      {
        title: "Notifications",
        description: "Stay on top of alerts, updates, and unread activity.",
        to: "/notifications",
        accent: "amber",
        icon: "notifications",
      },
      {
        title: "Bookings",
        description: "Manage room, lab, and resource reservations.",
        to: "/bookings",
        accent: "emerald",
        icon: "bookings",
      },
      {
        title: "Support Tickets",
        description: "Track requests, issues, and campus support tasks.",
        to: "/tickets",
        accent: "slate",
        icon: "tickets",
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
          icon: "admin",
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
          <h1>{greeting}, {user?.name || "Campus User"}</h1>
          <p className="dashboard-subtitle">
            Start from the actions you use most and keep your campus work moving from one place.
          </p>
        </div>

        <div className="dashboard-role-panel">
          <span className="dashboard-role-label">Signed in as</span>
          <strong className="dashboard-role-value">{formattedRole}</strong>
          <Link className="dashboard-role-link" to="/security">
            Account Security →
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Quick Actions</h2>
          <p>Open the parts of the system you're most likely to need next.</p>
        </div>

        <div className="dashboard-grid">
          {actionCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`dashboard-card dashboard-card-${card.accent}`}
            >
              <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                  {cardIcons[card.icon]}
                </div>
                <span className="dashboard-card-badge">{card.title}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="dashboard-card-link">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
