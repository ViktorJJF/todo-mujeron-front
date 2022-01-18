import axios from "axios";
export default {
  list(query) {
    return axios.get("/api/retail-rocket-tags", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/retail-rocket-tags/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/retail-rocket-tags", payload);
  },
  delete(id) {
    return axios.delete(`/api/retail-rocket-tags/${id}`);
  },
};
