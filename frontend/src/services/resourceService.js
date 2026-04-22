import api from "./api";

const endpoint = "/resources";

const resourceService = {
  getAll: () => api.get(endpoint),
  search: (params) => api.get(`${endpoint}/search`, { params }),
  create: (data) => api.post(endpoint, data),
  update: (id, data) => api.put(`${endpoint}/${id}`, data),
  remove: (id) => api.delete(`${endpoint}/${id}`),
};

export default resourceService;
