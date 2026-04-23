import { useEffect, useState } from "react";
import notificationPreferencesService from "../../services/notificationPreferencesService";
import "./NotificationPreferencesPage.css";

const preferenceItems = [
  {
    key: "bookings",
    title: "Bookings",
    description: "Get updates about reservation approvals, changes, and availability alerts.",
  },
  {
    key: "tickets",
    title: "Tickets",
    description: "Receive support ticket updates, assignment changes, and resolution notices.",
  },
  {
    key: "comments",
    title: "Comments",
    description: "Stay informed when someone replies or adds discussion activity relevant to you.",
  },
];

function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState({
    bookings: true,
    tickets: true,
    comments: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const data = await notificationPreferencesService.getPreferences();
        if (isMounted) {
          setPreferences(data);
        }
      } catch (error) {
        if (isMounted) {
          setStatus({
            type: "error",
            message: "Unable to load notification preferences right now.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      const savedPreferences = await notificationPreferencesService.savePreferences(preferences);
      setPreferences(savedPreferences);
      setStatus({
        type: "success",
        message: "Notification preferences saved successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Unable to save notification preferences right now.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="notification-preferences-page">
      <div className="notification-preferences-hero">
        <div>
          <p className="notification-preferences-eyebrow">Preferences</p>
          <h1>Notification Preferences</h1>
          <p className="notification-preferences-subtitle">
            Choose which types of campus notifications you want to receive. The page is structured so backend persistence can be connected cleanly later.
          </p>
        </div>
      </div>

      <div className="notification-preferences-card">
        <div className="notification-preferences-card-header">
          <div>
            <h2>Notification Categories</h2>
            <p>Enable or disable the alerts that matter most to you.</p>
          </div>
        </div>

        {loading ? (
          <div className="notification-preferences-status">
            Loading your notification preferences...
          </div>
        ) : (
          <form className="notification-preferences-form" onSubmit={handleSubmit}>
            {status.message && (
              <div
                className={`notification-preferences-status ${
                  status.type === "error"
                    ? "notification-preferences-status-error"
                    : "notification-preferences-status-success"
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="notification-preferences-list">
              {preferenceItems.map((item) => (
                <label className="notification-preferences-item" key={item.key}>
                  <div className="notification-preferences-item-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>

                  <span className="notification-preferences-toggle">
                    <input
                      type="checkbox"
                      checked={preferences[item.key]}
                      onChange={() => handleToggle(item.key)}
                      disabled={isSaving}
                    />
                    <span className="notification-preferences-toggle-ui" />
                  </span>
                </label>
              ))}
            </div>

            <div className="notification-preferences-actions">
              <button
                type="submit"
                className="notification-preferences-button"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default NotificationPreferencesPage;
