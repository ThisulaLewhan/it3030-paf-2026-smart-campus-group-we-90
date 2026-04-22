import api from "./api";

const securityService = {
  changePassword: (payload) => api.post("/auth/change-password", payload),
};

export default securityService;
