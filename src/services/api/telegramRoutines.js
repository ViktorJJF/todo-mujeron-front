import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    return axios.get("/api/telegram-routines", { params: query });
  },
  listOne(id) {
    return axios.get(`/api/telegram-routines/${id}`);
  },
  update(id, payload) {
    return axios.put(`/api/telegram-routines/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/telegram-routines", payload);
  },
  delete(id) {
    return axios.delete(`/api/telegram-routines/${id}`);
  },
  executeRoutine(id) {
    return axios.post(`/api/telegram-routines/${id}/execute`);
  },
};
