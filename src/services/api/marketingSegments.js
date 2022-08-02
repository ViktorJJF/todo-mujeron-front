import axios from "axios";
export default {
  list(params) {
    return axios.get("/api/marketing-segments", { params });
  },
  update(id, payload) {
    return axios.put(`/api/marketing-segments/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketing-segments", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketing-segments/${id}`);
  },
};
