import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/users", { params: query });
  },
  listOne(id){
    return axios.get(`/api/users/${id}`)
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
  delete(id) {
    return axios.delete(`/api/users/${id}`);
  },
};