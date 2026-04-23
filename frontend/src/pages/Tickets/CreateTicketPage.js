import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";
import userService from "../../services/userService";
import "./Tickets.css";

const CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "HVAC",
  "IT_SUPPORT",
  "STRUCTURAL",
  "CLEANING",
  "OTHER",
];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_IMAGES = 3;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  priority: "",
  resourceId: "",
  location: "",
  preferredContact: "",
};

function CreateTicketPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [assignedTechnicianId, setAssignedTechnicianId] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [techLoading, setTechLoading] = useState(false);
  const [techError, setTechError] = useState(null);
  const [images, setImages] = useState([]); // [{ file, preview }]
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fetch technicians whenever the current user changes (fixes stale-auth / hard-refresh issue)
  useEffect(() => {
    if (currentUser?.role !== "ADMIN") return;
    setTechLoading(true);
    setTechError(null);
    userService
      .getAllUsers()
      .then((res) => {
        // Backend Role enum only has USER and ADMIN — show all non-USER accounts
        const eligible = res.data.filter((u) => u.role !== "USER");
        setTechnicians(eligible);
      })
      .catch(() => setTechError("Could not load technicians"))
      .finally(() => setTechLoading(false));
  }, [currentUser]); // depend on currentUser object, not derived boolean

  // ── Field change ─────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  // ── Image selection ───────────────────────────────────────────────────────
  function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    const imageErrors = [];
    const valid = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        imageErrors.push(`"${file.name}" is not a jpg/jpeg/png image.`);
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        imageErrors.push(`"${file.name}" exceeds 5 MB.`);
        continue;
      }
      valid.push(file);
    }

    const combined = [...images, ...valid.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))];

    if (combined.length > MAX_IMAGES) {
      imageErrors.push(`You can attach at most ${MAX_IMAGES} images.`);
      const trimmed = combined.slice(0, MAX_IMAGES);
      setImages(trimmed);
    } else {
      setImages(combined);
    }

    if (imageErrors.length) {
      setErrors((prev) => ({ ...prev, images: imageErrors.join(" ") }));
    } else {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    // Reset input so same file can be re-selected after removal
    fileInputRef.current.value = "";
  }

  function removeImage(index) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setErrors((prev) => ({ ...prev, images: null }));
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    else if (form.title.trim().length < 5) e.title = "Title must be at least 5 characters.";
    if (!form.category) e.category = "Please select a category.";
    if (!form.description.trim()) e.description = "Description is required.";
    else if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters.";
    if (!form.priority) e.priority = "Please select a priority.";
    return e;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create the ticket
      const payload = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
        resourceId: form.resourceId.trim() || undefined,
        location: form.location.trim() || undefined,
        preferredContact: form.preferredContact.trim() || undefined,
        assignedTechnicianId: assignedTechnicianId || null,
      };
      const res = await ticketService.create(payload);
      const ticketId = res.data.id;

      // 2. Upload images if any
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(({ file }) => formData.append("files", file));
        await ticketService.uploadAttachments(ticketId, formData);
      }

      // Clean up object URLs
      images.forEach(({ preview }) => URL.revokeObjectURL(preview));

      navigate(`/tickets/${ticketId}`, { state: { created: true } });
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="page-card">
      <div className="form-page-header">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/tickets")}
        >
          ← Back
        </button>
        <h1>New Incident Ticket</h1>
      </div>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form className="ticket-form" onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className={`form-group ${errors.title ? "has-error" : ""}`}>
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Brief summary of the issue"
            value={form.title}
            onChange={handleChange}
            maxLength={120}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        {/* Category + Priority side-by-side */}
        <div className="form-row">
          <div className={`form-group ${errors.category ? "has-error" : ""}`}>
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select id="category" name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>

          <div className={`form-group ${errors.priority ? "has-error" : ""}`}>
            <label htmlFor="priority">
              Priority <span className="required">*</span>
            </label>
            <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
              <option value="">Select priority…</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.priority && <span className="field-error">{errors.priority}</span>}
          </div>
        </div>

        {/* Description */}
        <div className={`form-group ${errors.description ? "has-error" : ""}`}>
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the issue in detail…"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
          {errors.description && (
            <span className="field-error">{errors.description}</span>
          )}
        </div>

        {/* Resource ID + Location side-by-side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="resourceId">Resource ID</label>
            <input
              id="resourceId"
              name="resourceId"
              type="text"
              placeholder="e.g. ROOM-204"
              value={form.resourceId}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Building A, Floor 2"
              value={form.location}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Preferred contact */}
        <div className="form-group">
          <label htmlFor="preferredContact">Preferred Contact</label>
          <input
            id="preferredContact"
            name="preferredContact"
            type="text"
            placeholder="Phone or email for follow-up"
            value={form.preferredContact}
            onChange={handleChange}
          />
        </div>

        {/* Assign Technician — ADMIN only */}
        {isAdmin && (
          <div className="form-group">
            <label htmlFor="assignedTechnicianId">
              Assign Technician{" "}
              <span className="hint">(optional)</span>
            </label>
            {techLoading ? (
              <p className="hint">Loading technicians…</p>
            ) : (
              <select
                id="assignedTechnicianId"
                value={assignedTechnicianId}
                onChange={(e) => setAssignedTechnicianId(e.target.value)}
              >
                <option value="">Select a technician… (optional)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} – {t.email}
                  </option>
                ))}
              </select>
            )}
            {techError && <span className="field-error">{techError}</span>}
          </div>
        )}

        {/* Image upload */}
        <div className="form-group">
          <label>
            Images{" "}
            <span className="hint">(optional · jpg/jpeg/png · max 5 MB each · up to {MAX_IMAGES})</span>
          </label>

          {images.length > 0 && (
            <div className="image-preview-grid">
              {images.map(({ preview, file }, idx) => (
                <div key={idx} className="image-preview-item">
                  <img src={preview} alt={file.name} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                  <span className="image-name">{file.name}</span>
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_IMAGES && (
            <>
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
              <label htmlFor="image-upload" className="btn btn-secondary upload-btn">
                + Add Images ({images.length}/{MAX_IMAGES})
              </label>
            </>
          )}

          {errors.images && <span className="field-error">{errors.images}</span>}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/tickets")}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CreateTicketPage;
