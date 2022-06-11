import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/marketplace-sources", { params: query });
  },
  listOne(id) {
    return axios.get("/api/marketplace-sources/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/marketplace-sources/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketplace-sources", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketplace-sources/${id}`);
  },
};
