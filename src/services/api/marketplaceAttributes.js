import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/marketplace-attributes", { params: query });
  },
  listOne(id) {
    return axios.get("/api/marketplace-attributes/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/marketplace-attributes/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketplace-attributes", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketplace-attributes/${id}`);
  },
};
