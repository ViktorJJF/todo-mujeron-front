import axios from "axios";

export default {
  list(query = { sort: "createdAt", order: "desc" }) {
    return axios.get("/api/cloud-storage-links", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/cloud-storage-links/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/cloud-storage-links", payload);
  },
  delete(id) {
    return axios.delete(`/api/cloud-storage-links/${id}`);
  },
};
