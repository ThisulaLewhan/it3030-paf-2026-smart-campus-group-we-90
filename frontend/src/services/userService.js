import api from "./api";

const endpoint = "/users";

const userService = {
  endpoint,
  updateProfile: (payload) => api.put(`${endpoint}/me`, payload),
};

export default userService;
