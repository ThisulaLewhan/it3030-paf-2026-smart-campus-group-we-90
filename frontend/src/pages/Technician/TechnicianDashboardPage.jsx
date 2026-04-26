import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";
import notificationService from "../../services/notificationService";
import technicianProfileService from "../../services/technicianProfileService";
import "./TechnicianPages.css";

const STATUS_LABELS = {
  assigned: "Assigned",
  inProgress: "In Progress",
  resolved: "Resolved",
  urgent: "Urgent",
};

const QUICK_ACTIONS = [
  {
    title: "Assigned Tickets",
    description: "Review the issues currently routed to you and keep work moving.",
    to: "/tickets",
  },
  {
    title: "Notifications",
    description: "Stay updated on alerts, changes, and assignment activity.",
    to: "/notifications",
  },
  {
    title: "Technician Profile",
    description: "Keep your availability, contact info, and specialization current.",
    to: "/profile",
  },
];

const normalizeText = (value) => (value || "").trim().toLowerCase();

const formatDisplayName = (value, fallback = "Unknown") => {
  if (!value) {
    return fallback;
  }

  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) {
    return "No date available";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "No date available";
  }

  return parsedDate.toLocaleString();
};

function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [ticketsResponse, notificationsResponse] = await Promise.all([
          ticketService.getTickets(),
          notificationService.getMyNotifications(),
        ]);

        if (!isMounted) {
          return;
        }

        setTickets(Array.isArray(ticketsResponse.data) ? ticketsResponse.data : []);
        setNotifications(Array.isArray(notificationsResponse) ? notificationsResponse : []);
      } catch (loadError) {
        if (isMounted) {
          setError("Unable to load technician dashboard data right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const technicianProfile = useMemo(
    () => technicianProfileService.getProfile(user),
    [user]
  );

  const assignedTickets = useMemo(() => {
    const technicianIdentifiers = [
      normalizeText(user?.id),
      normalizeText(user?.email),
      normalizeText(user?.name),
    ].filter(Boolean);

    return tickets.filter((ticket) =>
      technicianIdentifiers.includes(normalizeText(ticket.assignedTechnician))
    );
  }, [tickets, user?.email, user?.id, user?.name]);

  const summaryCounts = useMemo(() => {
    const counts = {
      assigned: assignedTickets.length,
      inProgress: 0,
      resolved: 0,
      urgent: 0,
    };

    assignedTickets.forEach((ticket) => {
      const normalizedStatus = normalizeText(ticket.status);
      const normalizedPriority = normalizeText(ticket.priority);

      if (["in progress", "in_progress", "progress"].includes(normalizedStatus)) {
        counts.inProgress += 1;
      }

      if (["resolved", "closed", "completed", "done"].includes(normalizedStatus)) {
        counts.resolved += 1;
      }

      if (["urgent", "high"].includes(normalizedPriority)) {
        counts.urgent += 1;
      }
    });

    return counts;
  }, [assignedTickets]);

  const recentTickets = useMemo(
    () =>
      [...assignedTickets]
        .sort(
          (left, right) =>
            new Date(right.updatedAt || right.createdAt || 0) -
            new Date(left.updatedAt || left.createdAt || 0)
        )
        .slice(0, 5),
    [assignedTickets]
  );

  const recentNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  const completedCount = summaryCounts.resolved;

  return (
    <section className="technician-page">
      <div className="technician-hero">
        <div className="technician-hero-copy">
          <p className="technician-eyebrow">Technician Dashboard</p>
          <h1>Welcome back, {user?.name || "Technician"}</h1>
          <p className="technician-subtitle">
            Track your ticket load, watch urgent work, and stay on top of new technician updates from one place.
          </p>
        </div>

        <div className="technician-hero-panel">
          <span className="technician-hero-label">Availability</span>
          <strong>{technicianProfile.availabilityStatus || "Available"}</strong>
          <span className="technician-hero-meta">
            {technicianProfile.specialization || technicianProfile.department || "General technician support"}
          </span>
        </div>
      </div>

      {error && <div className="technician-status technician-status-error">{error}</div>}

      <div className="technician-summary-grid">
        {Object.entries(summaryCounts).map(([key, value]) => (
          <article key={key} className={`technician-summary-card technician-summary-${key}`}>
            <span className="technician-summary-label">{STATUS_LABELS[key]}</span>
            <strong>{value}</strong>
            <p>
              {key === "assigned" && "Tickets currently assigned to you."}
              {key === "inProgress" && "Active work that is still underway."}
              {key === "resolved" && "Assigned tickets completed successfully."}
              {key === "urgent" && "High-priority work requiring attention."}
            </p>
          </article>
        ))}
      </div>

      <div className="technician-content-grid">
        <section className="technician-card technician-span-two">
          <div className="technician-card-header">
            <div>
              <h2>Recent Assigned Tickets</h2>
              <p>Your latest assigned issues sorted by recent activity.</p>
            </div>
            <Link className="technician-inline-link" to="/tickets">
              View all tickets
            </Link>
          </div>

          {loading ? (
            <div className="technician-empty-state">Loading ticket activity...</div>
          ) : recentTickets.length === 0 ? (
            <div className="technician-empty-state">
              No assigned tickets yet. New work will appear here once tickets are routed to you.
            </div>
          ) : (
            <div className="technician-ticket-list">
              {recentTickets.map((ticket) => (
                <article key={ticket.id} className="technician-ticket-item">
                  <div>
                    <div className="technician-ticket-top">
                      <span className="technician-ticket-title">{ticket.title || "Untitled ticket"}</span>
                      <span className={`technician-ticket-priority priority-${normalizeText(ticket.priority) || "normal"}`}>
                        {formatDisplayName(ticket.priority, "Normal")}
                      </span>
                    </div>
                    <p className="technician-ticket-description">
                      {ticket.description || "No ticket description available."}
                    </p>
                  </div>
                  <div className="technician-ticket-meta">
                    <span>{formatDisplayName(ticket.status, "Open")}</span>
                    <span>{formatDate(ticket.updatedAt || ticket.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="technician-card">
          <div className="technician-card-header">
            <div>
              <h2>Recent Notifications</h2>
              <p>Latest updates from the system related to your work.</p>
            </div>
            <Link className="technician-inline-link" to="/notifications">
              Open notifications
            </Link>
          </div>

          {loading ? (
            <div className="technician-empty-state">Loading notifications...</div>
          ) : recentNotifications.length === 0 ? (
            <div className="technician-empty-state">
              No recent notifications right now.
            </div>
          ) : (
            <div className="technician-notification-list">
              {recentNotifications.map((notification) => (
                <article key={notification.id} className="technician-notification-item">
                  <div className="technician-notification-line">
                    <span className={`technician-notification-dot ${notification.read ? "read" : "unread"}`}></span>
                    <strong>{formatDisplayName(notification.type, "Update")}</strong>
                  </div>
                  <p>{notification.message}</p>
                  <span>{formatDate(notification.createdAt)}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="technician-card">
          <div className="technician-card-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Jump straight to the tools you use most often.</p>
            </div>
          </div>

          <div className="technician-action-list">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.to} to={action.to} className="technician-action-item">
                <div>
                  <strong>{action.title}</strong>
                  <p>{action.description}</p>
                </div>
                <span>Open</span>
              </Link>
            ))}
          </div>

          <div className="technician-metric-footer">
            <span>Completed ticket count</span>
            <strong>{completedCount}</strong>
          </div>
        </section>
      </div>
    </section>
  );
}

export default TechnicianDashboardPage;
