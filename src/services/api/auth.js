import axios from "axios";
export default {
  login(email, password, corporation) {
    return axios.post("/api/login", { email, password, corporation });
  },
  editUser(id, payload) {
    return axios.put(`/api/users/${id}`, payload);
  },
  updatePassword(id, newPassword) {
    return axios.put(`/api/users/${id}/update-password`, { newPassword });
  },
  refreshToken() {
    return axios.get("/api/token");
  },
  roleAuthorization(query) {
    return axios.get("/api/auth", { params: query });
  },
};
