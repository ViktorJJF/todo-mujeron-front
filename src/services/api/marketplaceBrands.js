import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/marketplace-brands", { params: query });
  },
  listOne(id) {
    return axios.get("/api/marketplace-brands/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/marketplace-brands/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketplace-brands", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketplace-brands/${id}`);
  },
};
