import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";
import "./Tickets.css";

const STATUSES = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORIES = [
  "",
  "ELECTRICAL",
  "PLUMBING",
  "HVAC",
  "IT_SUPPORT",
  "STRUCTURAL",
  "CLEANING",
  "OTHER",
];

function TicketListPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    assignedTechnician: "",
  });

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function fetchTickets() {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
      );
      const res = await ticketService.getAll(params);
      setTickets(res.data);
    } catch (err) {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function clearFilters() {
    setFilters({ status: "", priority: "", category: "", assignedTechnician: "" });
  }

  return (
    <section className="page-card">
      <div className="ticket-list-header">
        <h1>Incident Tickets</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/tickets/new")}
        >
          + New Ticket
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All Statuses"}
            </option>
          ))}
        </select>

        <select name="priority" value={filters.priority} onChange={handleFilterChange}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p || "All Priorities"}
            </option>
          ))}
        </select>

        <select name="category" value={filters.category} onChange={handleFilterChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c ? c.replace("_", " ") : "All Categories"}
            </option>
          ))}
        </select>

        {currentUser?.role === "ADMIN" && (
          <input
            type="text"
            name="assignedTechnician"
            placeholder="Technician username"
            value={filters.assignedTechnician}
            onChange={handleFilterChange}
          />
        )}

        <button className="btn btn-secondary" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {loading && <p className="state-msg">Loading tickets…</p>}
      {error && <p className="state-msg error">{error}</p>}

      {!loading && !error && tickets.length === 0 && (
        <p className="state-msg">No tickets found.</p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="ticket-table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="ticket-title">{ticket.title}</td>
                  <td>{ticket.category?.replace("_", " ")}</td>
                  <td>
                    <span className={`badge priority-${ticket.priority?.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${ticket.status?.toLowerCase()}`}>
                      {ticket.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td>{ticket.assignedTechnician || <em>Unassigned</em>}</td>
                  <td>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default TicketListPage;
