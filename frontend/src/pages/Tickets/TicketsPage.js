import ticketService from "../../services/ticketService";

function TicketsPage() {
  return (
    <section className="page-card">
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <h1 style={{ marginBottom: '0.5rem' }}>Tickets Module</h1>
        <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
          Use this area for incident reporting, technician assignments, and issue
          tracking across the campus.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Starter endpoint: <code>{ticketService.endpoint}</code>
        </p>
      </div>
    </section>
  );
}

export default TicketsPage;
