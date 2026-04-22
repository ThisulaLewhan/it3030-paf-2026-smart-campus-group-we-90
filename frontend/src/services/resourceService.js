import api from "./api";

const endpoint = "/resources";

const resourceService = {
  getAll: () => api.get(endpoint),
  create: (data) => api.post(endpoint, data),
};

export default resourceService;
