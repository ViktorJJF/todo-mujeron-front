import axios from "axios";
export default {
  list(params) {
    return axios.get("/api/marketing-campaigns", { params });
  },
  update(id, payload) {
    return axios.put(`/api/marketing-campaigns/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketing-campaigns", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketing-campaigns/${id}`);
  },
};
