import api from "./api";

const endpoint = "/incident-tickets";

const ticketService = {
  endpoint,

  // Tickets
  getAll: (params) => api.get(endpoint, { params }),
  getById: (id) => api.get(`${endpoint}/${id}`),
  create: (payload) => api.post(endpoint, payload),

  // Status workflow
  updateStatus: (id, payload) => api.patch(`${endpoint}/${id}/status`, payload),
  reject: (id, reason) => api.patch(`${endpoint}/${id}/reject`, { reason }),
  assign: (id, technicianId) => api.patch(`${endpoint}/${id}/assign`, { technicianId }),

  // Attachments
  getAttachments: (id) => api.get(`${endpoint}/${id}/attachments`),
  uploadAttachments: (id, formData) =>
    api.post(`${endpoint}/${id}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Comments
  getComments: (id) => api.get(`${endpoint}/${id}/comments`),
  addComment: (id, content) => api.post(`${endpoint}/${id}/comments`, { content }),
  editComment: (id, commentId, content) =>
    api.put(`${endpoint}/${id}/comments/${commentId}`, { content }),
  deleteComment: (id, commentId) => api.delete(`${endpoint}/${id}/comments/${commentId}`),

  // ── /api/tickets module (distinct from /api/incident-tickets) ──────────
  getTickets: () => api.get("/tickets"),
  getTicketDetail: (id) => api.get(`/tickets/${id}`),
  updateTicketStatus: (id, payload) => api.patch(`/tickets/${id}/status`, payload),
  assignTicketTechnician: (id, technicianId) =>
    api.patch(`/tickets/${id}/assign`, { technicianId }),
  getTicketAttachments: (id) => api.get(`/tickets/${id}/attachments`),
  uploadTicketAttachments: (id, formData) =>
    api.post(`/tickets/${id}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getTicketComments: (id) => api.get(`/tickets/${id}/comments`),
  addTicketComment: (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  editTicketComment: (id, commentId, content) =>
    api.put(`/tickets/${id}/comments/${commentId}`, { content }),
  deleteTicketComment: (id, commentId) =>
    api.delete(`/tickets/${id}/comments/${commentId}`),

  /**
   * Unified ticket creation — sends ticket JSON + optional images in one multipart request.
   * The caller should build a FormData with:
   *   formData.append("ticket", new Blob([JSON.stringify(payload)], { type: "application/json" }))
   *   formData.append("files", file) for each image
   */
  createNewTicket: (formData) =>
    api.post("/tickets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** Fetches a single attachment's raw bytes as a Blob (for thumbnail / lightbox display). */
  getAttachmentImageBlob: (ticketId, attachmentId) =>
    api.get(`/tickets/${ticketId}/attachments/${attachmentId}`, { responseType: "blob" }),
};

export default ticketService;
