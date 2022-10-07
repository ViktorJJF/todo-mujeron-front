import axios from "axios";
export default {
  list(query = { sort: "createdAt", order: "1" }) {
    if (query.telefonoId === null) query.telefonoId = "";
    return axios.get("/api/marketplaces", { params: query });
  },
  listOne(id) {
    return axios.get("/api/marketplaces/" + id);
  },
  update(id, payload) {
    return axios.put(`/api/marketplaces/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/marketplaces", payload);
  },
  delete(id) {
    return axios.delete(`/api/marketplaces/${id}`);
  },
};
