import axios from "axios";

export default {
  list(query = {}) {
    return axios.get("/api/shortcodesValues", { params: query });
  },
  get(id) {
    return axios.get(`/api/shortcodesValues/${id}`);
  },
  create(payload) {
    return axios.post("/api/shortcodesValues", payload);
  },
  update(id, payload) {
    return axios.put(`/api/shortcodesValues/${id}`, payload);
  },
  delete(id) {
    return axios.delete(`/api/shortcodesValues/${id}`);
  },
};
