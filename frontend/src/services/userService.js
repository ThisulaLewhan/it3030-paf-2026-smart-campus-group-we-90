import api from "./api";

const endpoint = "/users";

const userService = {
  endpoint,
  getAllUsers: () => api.get(endpoint),
  updateProfile: (payload) => api.put(`${endpoint}/me`, payload),
  updateRole: (userId, payload) => api.put(`${endpoint}/${userId}/role`, payload),
};

export default userService;
