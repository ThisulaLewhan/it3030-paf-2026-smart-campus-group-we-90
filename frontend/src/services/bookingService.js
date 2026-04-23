import api from "./api";

const endpoint = "/bookings";

const bookingService = {
  endpoint,
  getAll: () => api.get(endpoint),
  getById: (id) => api.get(`${endpoint}/${id}`),
  create: (payload) => api.post(endpoint, payload),
  update: (id, payload) => api.put(`${endpoint}/${id}`, payload),
  remove: (id) => api.delete(`${endpoint}/${id}`),
  getMyBookings: () => api.get(`${endpoint}/my-bookings`),
  getAdminBookings: () => api.get(`${endpoint}/admin/all`),
  approve: (id) => api.patch(`${endpoint}/${id}/approve`),
  reject: (id, reason) => api.patch(`${endpoint}/${id}/reject`, { reason }),
  cancel: (id) => api.patch(`${endpoint}/${id}/cancel`),
};

export default bookingService;
