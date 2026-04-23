import bookingService from "../../services/bookingService";

function BookingsPage() {
  return (
    <section className="page-card">
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <h1 style={{ marginBottom: '0.5rem' }}>Bookings Module</h1>
        <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
          The bookings team can build reservation flows, approval rules, and
          availability checks here without affecting the other modules.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Starter endpoint: <code>{bookingService.endpoint}</code>
        </p>
      </div>
    </section>
  );
}

export default BookingsPage;
