import api from "./api";

const endpoint = "/resources";

const resourceService = {
  getAll: () => api.get(endpoint),
};

export default resourceService;
