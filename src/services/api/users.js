import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/users", { params: query });
  },
  listOne(id, query) {
    return axios.get(`/api/users/${id}`, { params: query })
  },
  update(id, payload) {
    return axios.put(`/api/users/${id}`, payload);
  },
  updatePassword(id, newPassword) {
    return axios.put(`/api/users/${id}/update-password`, { newPassword });
  },
  create(payload) {
    return axios.post("/api/register", payload);
  },
  createCorporation(payload) {
    return axios.post("/api/register/corporation", payload);
  },
  delete(id) {
    return axios.delete(`/api/users/${id}`);
  },
};