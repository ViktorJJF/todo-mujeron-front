import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/marketplace-categories", { params: query });
  },
  listOne(id) {
    return axios.get("/api/marketplace-categories/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/marketplace-categories/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketplace-categories", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketplace-categories/${id}`);
  },
};
