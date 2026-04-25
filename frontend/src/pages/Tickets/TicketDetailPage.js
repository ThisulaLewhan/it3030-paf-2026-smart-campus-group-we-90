import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";
import userService from "../../services/userService";
import "./Tickets.css";

/** Allowed next statuses for TECHNICIAN role. */
const TECH_TRANSITIONS = {
  OPEN:        ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED:    ["IN_PROGRESS"],
  CLOSED:      [],
  REJECTED:    [],
};

/** Allowed next statuses for ADMIN role. */
const ADMIN_TRANSITIONS = {
  OPEN:        ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED:    ["CLOSED", "IN_PROGRESS"],
  CLOSED:      [],
  REJECTED:    [],
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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Reject (ADMIN)
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMsg, setRejectMsg] = useState("");

  // Assign technician modal (ADMIN)
  const [technicians, setTechnicians] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  // Success toast
  const [toast, setToast] = useState(null);

  // Comments
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentMsg, setCommentMsg] = useState("");

  // Attachments upload
  const fileInputRef = useRef(null);
  const [uploadMsg, setUploadMsg] = useState("");

  // Attachment blob URLs for thumbnail/lightbox display
  const [blobUrls, setBlobUrls] = useState({});
  const [loadingBlobs, setLoadingBlobs] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { url, filename } | null

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Only ADMIN / TECHNICIAN may see attachments — skip the fetch for USER to avoid 403
      const shouldFetchAttachments = role === "ADMIN" || role === "TECHNICIAN";
      const [ticketRes, attachRes, commRes] = await Promise.all([
        ticketService.getTicketDetail(id),
        shouldFetchAttachments
          ? ticketService.getTicketAttachments(id).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        ticketService.getTicketComments(id),
      ]);
      setTicket(ticketRes.data);
      setAttachments(attachRes.data);
      setComments(commRes.data);
    } catch {
      setError("Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }, [id, role]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (role !== "ADMIN") return;
    userService.getTechnicians()
      .then((res) => setTechnicians(res.data))
      .catch(() => setTechnicians([]));
  }, [role]);

  // Fetch raw image bytes for thumbnails/lightbox once ticket + attachments are loaded
  useEffect(() => {
    if (!ticket || attachments.length === 0) return;
    const canView =
      role === "ADMIN" ||
      (role === "TECHNICIAN" && ticket.assignedTechnician === userEmail);
    if (!canView) return;

    let cancelled = false;
    setLoadingBlobs(true);

    (async () => {
      const urls = {};
      await Promise.all(
        attachments.map(async (a) => {
          try {
            const res = await ticketService.getAttachmentImageBlob(id, a.id);
            if (!cancelled) urls[a.id] = URL.createObjectURL(res.data);
          } catch { /* skip blobs that fail to load */ }
        })
      );
      if (!cancelled) {
        setBlobUrls(urls);
        setLoadingBlobs(false);
      }
    })();

    return () => { cancelled = true; };
  }, [ticket, attachments, role, userEmail, id]);

  // Revoke stale blob URLs to avoid memory leaks
  useEffect(() => {
    return () => { Object.values(blobUrls).forEach(URL.revokeObjectURL); };
  }, [blobUrls]);

  // ── Status update ─────────────────────────────────────────────────────────
  async function handleStatusAdvance() {
    if (!selectedStatus) return;
    try {
      const res = await ticketService.updateTicketStatus(id, {
        newStatus: selectedStatus,
        ...(selectedStatus === "RESOLVED" ? { resolutionNotes } : {}),
      });
      setTicket(res.data);
      setSelectedStatus("");
      setResolutionNotes("");
      setStatusMsg("Status updated.");
    } catch (err) {
      setStatusMsg(
        err.response?.data?.message ?? err.response?.data ?? "Failed to update status."
      );
    }
  }

  // ── Reject (ADMIN only) ───────────────────────────────────────────────────
  async function handleReject() {
    if (!rejectReason.trim()) {
      setRejectMsg("Rejection reason is required.");
      return;
    }
    try {
      const res = await ticketService.updateTicketStatus(id, {
        newStatus: "REJECTED",
        rejectionReason: rejectReason.trim(),
      });
      setTicket(res.data);
      setRejectReason("");
      setRejectMsg("Ticket rejected.");
    } catch (err) {
      setRejectMsg(
        err.response?.data?.message ?? err.response?.data ?? "Failed to reject ticket."
      );
    }
  }

  // ── Assign technician modal (ADMIN) ───────────────────────────────────────
  function openAssignModal() {
    setSelectedTechId("");
    setAssignError(null);
    setAssignModalOpen(true);
  }

  async function handleAssign() {
    if (!selectedTechId) { setAssignError("Please select a technician."); return; }
    setAssigning(true);
    setAssignError(null);
    try {
      const res = await ticketService.assignTicketTechnician(id, selectedTechId);
      setTicket(res.data);
      setAssignModalOpen(false);
      showToast("Technician assigned successfully.");
    } catch (err) {
      setAssignError(
        err.response?.data?.message ?? err.response?.data ?? "Assignment failed."
      );
    } finally {
      setAssigning(false);
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  // ── Comments ──────────────────────────────────────────────────────────────
  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await ticketService.addTicketComment(id, newComment.trim());
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
      const res = await ticketService.editTicketComment(id, commentId, editingContent.trim());
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
      await ticketService.deleteTicketComment(id, commentId);
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
      const res = await ticketService.uploadTicketAttachments(id, form);
      setAttachments((prev) => [...prev, ...res.data]);
      setUploadMsg(`${files.length} file(s) uploaded.`);
    } catch (err) {
      setUploadMsg(err.response?.data || "Upload failed.");
    } finally {
      fileInputRef.current.value = "";
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isAdmin      = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";
  const canAdvanceStatus = isAdmin || isTechnician;
  const canViewAttachments = isAdmin || (isTechnician && ticket?.assignedTechnician === userEmail);
  const allowedNextStatuses = ticket
    ? (isAdmin ? ADMIN_TRANSITIONS[ticket.status] ?? [] : TECH_TRANSITIONS[ticket.status] ?? [])
    : [];

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

      {/* ── Admin: Assign Technician (always visible to ADMIN) ── */}
      {isAdmin && (
        <div className="page-card detail-card">
          <h2>Assign Technician</h2>
          <dl className="detail-grid">
            <dt>Currently Assigned</dt>
            <dd>
              {ticket.assignedTechnician
                ? ticket.assignedTechnician
                : <em>Not assigned yet</em>}
            </dd>
          </dl>
          <div className="control-group" style={{ marginTop: "0.75rem" }}>
            <button className="btn btn-primary" onClick={openAssignModal}>
              {ticket.assignedTechnician ? "Reassign Technician" : "Assign Technician"}
            </button>
          </div>

          {/* Reject sub-section — only when ticket is OPEN */}
          {ticket.status === "OPEN" && (
            <div
              className="control-group"
              style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}
            >
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
          )}
        </div>
      )}

      {/* ── Update Status (ADMIN / TECHNICIAN only) ── */}
      {canAdvanceStatus && allowedNextStatuses.length > 0 && (
        <div className="page-card detail-card">
          <h2>Update Status</h2>
          <p className="state-msg" style={{ margin: "0 0 0.75rem", padding: 0 }}>
            Current: <strong>{ticket.status?.replace(/_/g, " ")}</strong>
          </p>
          <div className="form-group">
            <label>New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">— select —</option>
              {allowedNextStatuses.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          {selectedStatus === "RESOLVED" && (
            <div className="form-group" style={{ marginTop: "0.5rem" }}>
              <label>
                Resolution Notes <span className="required">*</span>
              </label>
              <textarea
                className="notes-input"
                placeholder="Describe how this was resolved…"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
          )}
          <div style={{ marginTop: "0.75rem" }}>
            <button
              className="btn btn-primary"
              onClick={handleStatusAdvance}
              disabled={!selectedStatus}
            >
              Save Status
            </button>
          </div>
          {statusMsg && <p className="form-msg">{statusMsg}</p>}
        </div>
      )}

      {/* ── Attachments (ADMIN / assigned TECHNICIAN only) ── */}
      {canViewAttachments && (
        <div className="page-card detail-card">
          <h2>Attachments ({attachments.length}/3)</h2>
          {loadingBlobs && <p className="state-msg">Loading images…</p>}
          {!loadingBlobs && attachments.length === 0 && (
            <p className="state-msg">No attachments on this ticket.</p>
          )}
          {!loadingBlobs && attachments.length > 0 && (
            <div className="attachment-thumbnail-grid">
              {attachments.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="attachment-thumb-btn"
                  onClick={() => setLightbox({ url: blobUrls[a.id], filename: a.filename })}
                  disabled={!blobUrls[a.id]}
                  title={`${a.filename} (${(a.sizeBytes / 1024).toFixed(1)} KB)`}
                >
                  {blobUrls[a.id] ? (
                    <img src={blobUrls[a.id]} alt={a.filename} className="attachment-thumb" />
                  ) : (
                    <span className="attachment-thumb-placeholder">🖼</span>
                  )}
                  <span className="attachment-thumb-name">{a.filename}</span>
                  <span className="attachment-thumb-meta">
                    {(a.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
      {/* ── Image lightbox ── */}
      {lightbox && (
        <div
          className="modal-overlay"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Image preview: ${lightbox.filename}`}
        >
          <div className="modal-box lightbox-box" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-filename">{lightbox.filename}</span>
              <button
                className="detail-toast-close lightbox-close"
                onClick={() => setLightbox(null)}
                aria-label="Close image preview"
              >
                ✕
              </button>
            </div>
            {lightbox.url ? (
              <img src={lightbox.url} alt={lightbox.filename} className="lightbox-img" />
            ) : (
              <p className="state-msg">Image not available.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Assign technician modal (ADMIN) ── */}
      {assignModalOpen && (
        <div className="modal-overlay" onClick={() => setAssignModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Technician</h2>
            <p className="modal-subtitle">
              Currently assigned:{" "}
              {ticket.assignedTechnician
                ? <strong>{ticket.assignedTechnician}</strong>
                : <em>Not assigned yet</em>}
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
                onClick={() => setAssignModalOpen(false)}
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

      {/* ── Success toast ── */}
      {toast && (
        <div className="detail-toast">
          {toast}
          <button className="detail-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  );
}

export default TicketDetailPage;
