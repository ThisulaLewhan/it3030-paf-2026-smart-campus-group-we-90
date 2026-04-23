import resourceService from "../../services/resourceService";

function ResourcesPage() {
  return (
    <section className="page-card">
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <h1 style={{ marginBottom: '0.5rem' }}>Resources Module</h1>
        <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
          The resources team can manage labs, rooms, equipment, and any shared
          campus facility from this page.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Starter endpoint: <code>{resourceService.endpoint}</code>
        </p>
      </div>
    </section>
  );
}

export default ResourcesPage;
