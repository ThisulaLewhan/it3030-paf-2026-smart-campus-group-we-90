import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";
import userService from "../../services/userService";
import "./Tickets.css";

const STATUSES   = ["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
const PRIORITIES = ["", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CATEGORIES = [
  "", "ELECTRICAL", "PLUMBING", "HVAC",
  "IT_SUPPORT", "STRUCTURAL", "CLEANING", "OTHER",
];

/** Allowed next-status transitions a technician may pick from. */
const TECH_TRANSITIONS = {
  OPEN:        ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED:    ["IN_PROGRESS"],
  CLOSED:      [],
  REJECTED:    [],
};

function priorityRowClass(priority) {
  switch (priority?.toUpperCase()) {
    case "CRITICAL": return "priority-row-critical";
    case "HIGH":     return "priority-row-high";
    case "MEDIUM":   return "priority-row-medium";
    case "LOW":      return "priority-row-low";
    default:         return "";
  }
}

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleDateString() : "—";
}

// ── Ticket card ─────────────────────────────────────────────────────────────
function TicketCard({ ticket, role, onAssign, onUpdateStatus }) {
  const navigate = useNavigate();
  const transitions = TECH_TRANSITIONS[ticket.status] ?? [];

  return (
    <div
      className={`ticket-card${
        role === "TECHNICIAN" ? ` ${priorityRowClass(ticket.priority)}` : ""
      }`}
    >
      <div className="ticket-card-top">
        <span className="ticket-card-title">{ticket.title}</span>
        <div className="ticket-card-badges">
          <span className={`badge priority-${ticket.priority?.toLowerCase()}`}>
            {ticket.priority}
          </span>
          <span className={`badge status-${ticket.status?.toLowerCase()}`}>
            {ticket.status?.replace(/_/g, " ")}
          </span>
          <span className="badge badge-category">
            {ticket.category?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="ticket-card-meta">
        <span>Created: {formatDate(ticket.createdAt)}</span>
        {role === "ADMIN" && (
          <span>
            Assigned:{" "}
            {ticket.assignedTechnician ?? <em>Unassigned</em>}
          </span>
        )}
      </div>

      <div className="ticket-card-actions">
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => navigate(`/tickets/${ticket.id}`)}
        >
          View Details
        </button>

        {role === "TECHNICIAN" && transitions.length > 0 && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onUpdateStatus(ticket)}
          >
            Update Status
          </button>
        )}

        {role === "ADMIN" && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onAssign(ticket)}
          >
            Assign Technician
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
function TicketListPage() {
  const { user } = useAuth();
  const role = user?.role; // "USER" | "TECHNICIAN" | "ADMIN"

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    assignedTechnician: "",
  });

  // Assign-technician modal (ADMIN)
  const [assignModal,    setAssignModal]    = useState(null); // { ticketId, ticketTitle }
  const [technicians,    setTechnicians]    = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [assigning,      setAssigning]      = useState(false);
  const [assignError,    setAssignError]    = useState(null);

  // Quick-status-update modal (TECHNICIAN)
  const [statusModal,     setStatusModal]     = useState(null); // { ticket }
  const [selectedStatus,  setSelectedStatus]  = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [statusUpdating,  setStatusUpdating]  = useState(false);
  const [statusError,     setStatusError]     = useState(null);

  // ── Data fetch ──────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ticketService.getTickets();
      setTickets(res.data);
    } catch {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Load technician list when assign modal opens
  useEffect(() => {
    if (!assignModal) return;
    userService.getTechnicians()
      .then((res) => setTechnicians(res.data))
      .catch(()  => setTechnicians([]));
  }, [assignModal]);

  // ── ADMIN filters (client-side) ─────────────────────────────────────────
  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  function clearFilters() {
    setFilters({ status: "", priority: "", category: "", assignedTechnician: "" });
  }

  const visibleTickets = role === "ADMIN"
    ? tickets.filter((t) => {
        if (filters.status   && t.status   !== filters.status)   return false;
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.category && t.category !== filters.category) return false;
        if (filters.assignedTechnician) {
          const needle = filters.assignedTechnician.toLowerCase();
          if (!(t.assignedTechnician ?? "").toLowerCase().includes(needle)) return false;
        }
        return true;
      })
    : tickets;

  // ── Assign technician (ADMIN) ───────────────────────────────────────────
  function openAssignModal(ticket) {
    setAssignModal({ ticketId: ticket.id, ticketTitle: ticket.title });
    setSelectedTechId("");
    setAssignError(null);
  }
  function closeAssignModal() { setAssignModal(null); }

  async function handleAssign() {
    if (!selectedTechId) { setAssignError("Please select a technician."); return; }
    setAssigning(true);
    setAssignError(null);
    try {
      await ticketService.assignTicketTechnician(assignModal.ticketId, selectedTechId);
      closeAssignModal();
      fetchTickets();
    } catch (err) {
      setAssignError(err.response?.data?.message ?? "Assignment failed.");
    } finally {
      setAssigning(false);
    }
  }

  // ── Quick status update (TECHNICIAN) ───────────────────────────────────
  function openStatusModal(ticket) {
    const allowed = TECH_TRANSITIONS[ticket.status] ?? [];
    setStatusModal({ ticket });
    setSelectedStatus(allowed[0] ?? "");
    setResolutionNotes("");
    setStatusError(null);
  }
  function closeStatusModal() { setStatusModal(null); }

  async function handleStatusUpdate() {
    if (!selectedStatus) return;
    setStatusUpdating(true);
    setStatusError(null);
    try {
      await ticketService.updateTicketStatus(statusModal.ticket.id, {
        newStatus: selectedStatus,
        ...(selectedStatus === "RESOLVED" ? { resolutionNotes } : {}),
      });
      closeStatusModal();
      fetchTickets();
    } catch (err) {
      setStatusError(
        err.response?.data?.message ?? err.response?.data ?? "Update failed."
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section className="page-card">
      {/* Page header */}
      <div className="ticket-list-header">
        <h1>
          {role === "USER"       && "My Tickets"}
          {role === "TECHNICIAN" && "Assigned Tickets"}
          {role === "ADMIN"      && "All Tickets"}
        </h1>
        {role === "USER" && (
          <a href="/tickets/new" className="btn btn-primary">
            + Create New Ticket
          </a>
        )}
      </div>

      {/* ADMIN filter bar */}
      {role === "ADMIN" && (
        <div className="filter-bar">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || "All Statuses"}</option>
            ))}
          </select>

          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p || "All Priorities"}</option>
            ))}
          </select>

          <select name="category" value={filters.category} onChange={handleFilterChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c ? c.replace(/_/g, " ") : "All Categories"}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="assignedTechnician"
            placeholder="Filter by technician email"
            value={filters.assignedTechnician}
            onChange={handleFilterChange}
          />

          <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      )}

      {/* State messages */}
      {loading && <p className="state-msg">Loading tickets…</p>}
      {error   && <p className="state-msg error">{error}</p>}
      {!loading && !error && visibleTickets.length === 0 && (
        <p className="state-msg">No tickets found.</p>
      )}

      {/* Ticket card grid */}
      {!loading && !error && visibleTickets.length > 0 && (
        <div className="ticket-card-grid">
          {visibleTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              role={role}
              onAssign={openAssignModal}
              onUpdateStatus={openStatusModal}
            />
          ))}
        </div>
      )}

      {/* ── Assign technician modal (ADMIN) ── */}
      {assignModal && (
        <div className="modal-overlay" onClick={closeAssignModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Technician</h2>
            <p className="modal-subtitle">
              Ticket: <strong>{assignModal.ticketTitle}</strong>
            </p>
            <div className="form-group">
              <label>Select Technician</label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
              >
                <option value="">— choose —</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>
            {assignError && <p className="field-error">{assignError}</p>}
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={closeAssignModal}
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={assigning}
              >
                {assigning ? "Assigning…" : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick status update modal (TECHNICIAN) ── */}
      {statusModal && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Update Status</h2>
            <p className="modal-subtitle">
              Ticket: <strong>{statusModal.ticket.title}</strong>
            </p>
            <p className="modal-subtitle">
              Current:{" "}
              <span
                className={`badge status-${statusModal.ticket.status?.toLowerCase()}`}
              >
                {statusModal.ticket.status?.replace(/_/g, " ")}
              </span>
            </p>

            <div className="form-group">
              <label>New Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {(TECH_TRANSITIONS[statusModal.ticket.status] ?? []).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            {selectedStatus === "RESOLVED" && (
              <div className="form-group">
                <label>
                  Resolution Notes <span className="required">*</span>
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how this was resolved…"
                />
              </div>
            )}

            {statusError && <p className="field-error">{statusError}</p>}

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={closeStatusModal}
                disabled={statusUpdating}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={statusUpdating || !selectedStatus}
              >
                {statusUpdating ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TicketListPage;
