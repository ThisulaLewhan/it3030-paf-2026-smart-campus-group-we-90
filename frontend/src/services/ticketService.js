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
};

export default ticketService;
