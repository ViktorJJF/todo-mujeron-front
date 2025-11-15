import axios from "axios";

export default {
  list(query = { sort: "startTime", order: "-1" }) {
    return axios.get("/api/routine-executions", { params: query });
  },
  listOne(id) {
    return axios.get(`/api/routine-executions/${id}`);
  },
  getStats(query = {}) {
    return axios.get("/api/routine-executions/stats", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/routine-executions/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/routine-executions", payload);
  },
  delete(id) {
    return axios.delete(`/api/routine-executions/${id}`);
  },
};
