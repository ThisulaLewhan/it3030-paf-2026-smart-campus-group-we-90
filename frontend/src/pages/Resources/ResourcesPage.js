import resourceService from "../../services/resourceService";

function ResourcesPage() {
  return (
    <section className="page-card">
      <h1>Resources Module</h1>
      <p>
        The resources team can manage labs, rooms, equipment, and any shared
        campus facility from this page.
      </p>
      <p>
        Starter endpoint: <code>{resourceService.endpoint}</code>
      </p>
    </section>
  );
}

export default ResourcesPage;
