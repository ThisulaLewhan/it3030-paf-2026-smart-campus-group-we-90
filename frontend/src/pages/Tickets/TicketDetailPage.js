import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";
import userService from "../../services/userService";
import "./Tickets.css";

const NEXT_STATUS = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
  RESOLVED: "CLOSED",
};

function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const role = currentUser?.role; // "ADMIN" | "TECHNICIAN" | "USER"
  const userEmail = currentUser?.email;

  const [ticket, setTicket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Reject
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMsg, setRejectMsg] = useState("");

  // Assign
  const [technicianId, setTechnicianId] = useState("");
  const [assignMsg, setAssignMsg] = useState("");
  const [technicians, setTechnicians] = useState([]);

  // Comments
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentMsg, setCommentMsg] = useState("");

  // Attachments upload
  const fileInputRef = useRef(null);
  const [uploadMsg, setUploadMsg] = useState("");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (role !== "ADMIN") return;
    userService.getTechnicians()
      .then((res) => setTechnicians(res.data))
      .catch(() => setTechnicians([]));
  }, [role]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [ticketRes, attachRes, commRes] = await Promise.all([
        ticketService.getById(id),
        ticketService.getAttachments(id),
        ticketService.getComments(id),
      ]);
      setTicket(ticketRes.data);
      setAttachments(attachRes.data);
      setComments(commRes.data);
    } catch {
      setError("Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }

  // ── Status update ─────────────────────────────────────────────────────────
  async function handleStatusAdvance() {
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    try {
      const res = await ticketService.updateStatus(id, {
        status: next,
        resolutionNotes: resolutionNotes || undefined,
      });
      setTicket(res.data);
      setResolutionNotes("");
      setStatusMsg("Status updated.");
    } catch (err) {
      setStatusMsg(err.response?.data || "Failed to update status.");
    }
  }

  // ── Reject ────────────────────────────────────────────────────────────────
  async function handleReject() {
    if (!rejectReason.trim()) {
      setRejectMsg("Rejection reason is required.");
      return;
    }
    try {
      const res = await ticketService.reject(id, rejectReason.trim());
      setTicket(res.data);
      setRejectReason("");
      setRejectMsg("Ticket rejected.");
    } catch (err) {
      setRejectMsg(err.response?.data || "Failed to reject ticket.");
    }
  }

  // ── Assign ────────────────────────────────────────────────────────────────
  async function handleAssign() {
    if (!technicianId.trim()) {
      setAssignMsg("Technician ID is required.");
      return;
    }
    try {
      const res = await ticketService.assign(id, technicianId.trim());
      setTicket(res.data);
      setTechnicianId("");
      setAssignMsg("Technician assigned.");
    } catch (err) {
      setAssignMsg(err.response?.data || "Failed to assign technician.");
    }
  }

  // ── Comments ──────────────────────────────────────────────────────────────
  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await ticketService.addComment(id, newComment.trim());
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      setCommentMsg("");
    } catch {
      setCommentMsg("Failed to post comment.");
    }
  }

  async function handleEditComment(commentId) {
    if (!editingContent.trim()) return;
    try {
      const res = await ticketService.editComment(id, commentId, editingContent.trim());
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? res.data : c))
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch {
      setCommentMsg("Failed to edit comment.");
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await ticketService.deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setCommentMsg("Failed to delete comment.");
    }
  }

  // ── Attachments ───────────────────────────────────────────────────────────
  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    try {
      const res = await ticketService.uploadAttachments(id, form);
      setAttachments((prev) => [...prev, ...res.data]);
      setUploadMsg(`${files.length} file(s) uploaded.`);
    } catch (err) {
      setUploadMsg(err.response?.data || "Upload failed.");
    } finally {
      fileInputRef.current.value = "";
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isAdmin = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";
  const isAssignedTechnician = ticket?.assignedTechnician === userEmail;
  const canAdvanceStatus =
    isAdmin || isTechnician || isAssignedTechnician;
  const nextStatus = ticket ? NEXT_STATUS[ticket.status] : null;

  if (loading) return <p className="state-msg">Loading…</p>;
  if (error) return <p className="state-msg error">{error}</p>;
  if (!ticket) return null;

  return (
    <div className="ticket-detail">
      {/* ── Header ── */}
      <div className="detail-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate("/tickets")}>
          ← Back
        </button>
        <h1>{ticket.title}</h1>
        <div className="detail-badges">
          <span className={`badge status-${ticket.status?.toLowerCase()}`}>
            {ticket.status?.replace("_", " ")}
          </span>
          <span className={`badge priority-${ticket.priority?.toLowerCase()}`}>
            {ticket.priority}
          </span>
          {ticket.category && (
            <span className="badge badge-category">
              {ticket.category.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* ── Details grid ── */}
      <div className="page-card detail-card">
        <dl className="detail-grid">
          <dt>Description</dt>
          <dd>{ticket.description || "—"}</dd>
          <dt>Location</dt>
          <dd>{ticket.location || "—"}</dd>
          <dt>Resource</dt>
          <dd>{ticket.resourceId || "—"}</dd>
          <dt>Preferred Contact</dt>
          <dd>{ticket.preferredContact || "—"}</dd>
          <dt>Submitted By</dt>
          <dd>{ticket.createdBy}</dd>
          <dt>Assigned To</dt>
          <dd>{ticket.assignedTechnician || <em>Unassigned</em>}</dd>
          <dt>Created</dt>
          <dd>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "—"}</dd>
          <dt>Updated</dt>
          <dd>{ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : "—"}</dd>
          {ticket.resolutionNotes && (
            <>
              <dt>Resolution Notes</dt>
              <dd>{ticket.resolutionNotes}</dd>
            </>
          )}
          {ticket.rejectionReason && (
            <>
              <dt>Rejection Reason</dt>
              <dd className="text-danger">{ticket.rejectionReason}</dd>
            </>
          )}
        </dl>
      </div>

      {/* ── Admin controls ── */}
      {isAdmin && ticket.status === "OPEN" && (
        <div className="page-card detail-card">
          <h2>Admin Controls</h2>

          <div className="control-group">
            <h3>Assign Technician</h3>
            <div className="inline-form">
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
              >
                <option value="">— Select a technician —</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAssign}>
                Assign
              </button>
            </div>
            {assignMsg && <p className="form-msg">{assignMsg}</p>}
          </div>

          <div className="control-group">
            <h3>Reject Ticket</h3>
            <div className="inline-form">
              <input
                type="text"
                placeholder="Reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <button className="btn btn-danger" onClick={handleReject}>
                Reject
              </button>
            </div>
            {rejectMsg && <p className="form-msg">{rejectMsg}</p>}
          </div>
        </div>
      )}

      {/* ── Status advance controls (admin / technician / assigned) ── */}
      {canAdvanceStatus && nextStatus && (
        <div className="page-card detail-card">
          <h2>Update Status</h2>
          <p>
            Advance from <strong>{ticket.status}</strong> →{" "}
            <strong>{nextStatus.replace("_", " ")}</strong>
          </p>
          {nextStatus === "RESOLVED" && (
            <textarea
              className="notes-input"
              placeholder="Resolution notes (optional)"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          )}
          <button className="btn btn-primary" onClick={handleStatusAdvance}>
            Mark as {nextStatus.replace("_", " ")}
          </button>
          {statusMsg && <p className="form-msg">{statusMsg}</p>}
        </div>
      )}

      {/* ── Attachments ── */}
      <div className="page-card detail-card">
        <h2>Attachments ({attachments.length}/3)</h2>
        {attachments.length === 0 && <p className="state-msg">No attachments.</p>}
        <ul className="attachment-list">
          {attachments.map((a) => (
            <li key={a.id} className="attachment-item">
              <span className="attachment-icon">🖼</span>
              <span>{a.filename}</span>
              <span className="attachment-meta">
                {(a.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                {a.uploadedAt ? new Date(a.uploadedAt).toLocaleDateString() : ""}
              </span>
            </li>
          ))}
        </ul>
        {attachments.length < 3 && (
          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleUpload}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn btn-secondary">
              Upload Images
            </label>
            {uploadMsg && <p className="form-msg">{uploadMsg}</p>}
          </div>
        )}
      </div>

      {/* ── Comments ── */}
      <div className="page-card detail-card">
        <h2>Comments ({comments.length})</h2>

        {comments.length === 0 && <p className="state-msg">No comments yet.</p>}

        <ul className="comment-list">
          {comments.map((c) => {
            const isOwner = c.authorId === userEmail;
            const canDelete = isOwner || isAdmin;
            return (
              <li key={c.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{c.authorId}</span>
                  <span className="comment-date">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                    {c.updatedAt !== c.createdAt && " (edited)"}
                  </span>
                </div>

                {editingCommentId === c.id ? (
                  <div className="comment-edit">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                    />
                    <div className="comment-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditComment(c.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="comment-body">{c.content}</p>
                    <div className="comment-actions">
                      {isOwner && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setEditingCommentId(c.id);
                            setEditingContent(c.content);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {commentMsg && <p className="form-msg">{commentMsg}</p>}

        <form className="comment-form" onSubmit={handleAddComment}>
          <textarea
            placeholder="Add a comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
}

export default TicketDetailPage;
