function Home() {
  return (
    <section className="page-card">
      <h1>Smart Campus Dashboard</h1>
      <p>
        This workspace is now split into independent frontend and backend
        modules so teams can build resources, bookings, tickets, and
        notifications without stepping on each other.
      </p>
      <ul>
        <li>Frontend pages live in feature-based folders under `src/pages`.</li>
        <li>API calls are grouped by module under `src/services`.</li>
        <li>Spring controllers, services, repositories, and entities mirror the same modules.</li>
      </ul>
    </section>
  );
}

export default Home;
