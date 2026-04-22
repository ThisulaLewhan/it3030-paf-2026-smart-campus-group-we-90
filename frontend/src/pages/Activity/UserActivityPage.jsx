import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import userActivityService from "../../services/userActivityService";
import "./UserActivityPage.css";

function UserActivityPage() {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    let isMounted = true;

    const loadActivity = async () => {
      try {
        setStatus({ type: "", message: "" });
        const items = await userActivityService.getRecentActivity();
        if (isMounted) {
          setActivity(items);
        }
      } catch (error) {
        if (isMounted) {
          setStatus({
            type: "error",
            message: "Unable to load recent activity right now.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="user-activity-page">
      <div className="user-activity-hero">
        <div>
          <p className="user-activity-eyebrow">Account Activity</p>
          <h1>Recent activity for {user?.name || "your account"}</h1>
          <p className="user-activity-subtitle">
            Review account-related actions in one place. The page is structured so backend activity feeds can be connected cleanly later.
          </p>
        </div>
      </div>

      <div className="user-activity-card">
        <div className="user-activity-card-header">
          <div>
            <h2>Recent Actions</h2>
            <p>Sign-ins, profile changes, notification reads, and other account events.</p>
          </div>
        </div>

        {status.message && (
          <div
            className={`user-activity-status ${
              status.type === "error"
                ? "user-activity-status-error"
                : "user-activity-status-success"
            }`}
          >
            {status.message}
          </div>
        )}

        {loading ? (
          <div className="user-activity-empty">
            <p>Loading recent activity...</p>
          </div>
        ) : activity.length === 0 ? (
          <div className="user-activity-empty">
            <p>No recent account activity to show right now.</p>
          </div>
        ) : (
          <div className="user-activity-timeline">
            {activity.map((item) => (
              <article className="user-activity-item" key={item.id}>
                <div className={`user-activity-dot type-${item.type}`} />
                <div className="user-activity-content">
                  <div className="user-activity-meta">
                    <span className="user-activity-type">{item.type}</span>
                    <span className="user-activity-time">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default UserActivityPage;
