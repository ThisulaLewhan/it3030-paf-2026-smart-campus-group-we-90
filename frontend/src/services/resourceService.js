import api from "./api";

const endpoint = "/resources";

const resourceService = {
  endpoint,
  getAll: () => api.get(endpoint),
  getById: (id) => api.get(`${endpoint}/${id}`),
  create: (payload) => api.post(endpoint, payload),
  update: (id, payload) => api.put(`${endpoint}/${id}`, payload),
  remove: (id) => api.delete(`${endpoint}/${id}`),
};

export default resourceService;
