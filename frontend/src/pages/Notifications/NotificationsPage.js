import notificationService from "../../services/notificationService";

function NotificationsPage() {
  return (
    <section className="page-card">
      <h1>Notifications Module</h1>
      <p>
        Notification templates, delivery channels, and campus-wide alerts can be
        implemented here as a separate feature stream.
      </p>
      <p>
        Starter endpoint: <code>{notificationService.endpoint}</code>
      </p>
    </section>
  );
}

export default NotificationsPage;
