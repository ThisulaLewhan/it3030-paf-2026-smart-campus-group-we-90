import bookingService from "../../services/bookingService";

function BookingsPage() {
  return (
    <section className="page-card">
      <h1>Bookings Module</h1>
      <p>
        The bookings team can build reservation flows, approval rules, and
        availability checks here without affecting the other modules.
      </p>
      <p>
        Starter endpoint: <code>{bookingService.endpoint}</code>
      </p>
    </section>
  );
}

export default BookingsPage;
