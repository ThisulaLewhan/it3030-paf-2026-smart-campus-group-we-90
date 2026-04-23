import { useEffect, useMemo, useState } from "react";
import notificationService from "../../services/notificationService";
import "./NotificationsPage.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setStatus({ type: "", message: "" });
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Unable to load notifications right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.read);
    }

    if (filter === "read") {
      return notifications.filter((notification) => notification.read);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const handleMarkAsRead = async (notificationId) => {
    try {
      setBusyId(notificationId);
      await notificationService.markAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      setStatus({
        type: "error",
        message: "Unable to mark that notification as read.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      setBusyId(notificationId);
      await notificationService.deleteNotification(notificationId);
      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      setStatus({
        type: "error",
        message: "Unable to delete that notification.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setBulkBusy(true);
      await notificationService.markAllAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
      setStatus({ type: "success", message: "All notifications marked as read." });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Unable to mark all notifications as read.",
      });
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <section className="notifications-page">
      <div className="notifications-hero">
        <div>
          <p className="notifications-eyebrow">Notification Center</p>
          <h1>All campus notifications in one place</h1>
          <p className="notifications-subtitle">
            Review updates, track unread items, and manage your alerts without leaving the app.
          </p>
        </div>
        <div className="notifications-summary">
          <span className="notifications-summary-number">{unreadCount}</span>
          <span className="notifications-summary-label">Unread</span>
        </div>
      </div>

      <div className="notifications-card">
        <div className="notifications-toolbar">
          <div className="notifications-filters">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`notifications-filter ${filter === item.key ? "active" : ""}`}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="notifications-toolbar-actions">
            <button
              type="button"
              className="notifications-secondary-button"
              onClick={loadNotifications}
              disabled={loading || bulkBusy}
            >
              Refresh
            </button>
            <button
              type="button"
              className="notifications-primary-button"
              onClick={handleMarkAllAsRead}
              disabled={bulkBusy || unreadCount === 0}
            >
              {bulkBusy ? "Updating..." : "Mark All as Read"}
            </button>
          </div>
        </div>

        {status.message && (
          <div
            className={`notifications-status ${
              status.type === "error" ? "notifications-status-error" : "notifications-status-success"
            }`}
          >
            {status.message}
          </div>
        )}

        {loading ? (
          <div className="notifications-empty">
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <p>No notifications found for this filter.</p>
            <span>Try switching between all, unread, and read items.</span>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`notifications-item ${notification.read ? "is-read" : "is-unread"}`}
              >
                <div className="notifications-item-main">
                  <div className="notifications-item-top">
                    <span className={`notifications-type type-${notification.type?.toLowerCase?.() || "info"}`}>
                      {notification.type}
                    </span>
                    <span className="notifications-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="notifications-message">{notification.message}</p>
                  <p className="notifications-state">
                    {notification.read ? "Read" : "Unread"}
                  </p>
                </div>

                <div className="notifications-item-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      className="notifications-secondary-button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={busyId === notification.id}
                    >
                      {busyId === notification.id ? "Saving..." : "Mark as Read"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="notifications-danger-button"
                    onClick={() => handleDelete(notification.id)}
                    disabled={busyId === notification.id}
                  >
                    {busyId === notification.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NotificationsPage;
