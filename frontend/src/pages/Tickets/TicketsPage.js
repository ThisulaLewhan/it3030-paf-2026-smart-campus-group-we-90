import ticketService from "../../services/ticketService";

function TicketsPage() {
  return (
    <section className="page-card">
      <h1>Tickets Module</h1>
      <p>
        Use this area for incident reporting, technician assignments, and issue
        tracking across the campus.
      </p>
      <p>
        Starter endpoint: <code>{ticketService.endpoint}</code>
      </p>
    </section>
  );
}

export default TicketsPage;
