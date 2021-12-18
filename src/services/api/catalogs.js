import axios from "axios";
export default {
  find(id, query) {
    return axios.get(`/api/catalogs/${id}`, { params: query })
  },
  findDefault() {
    return axios.get("/api/catalogs/default")
  },
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/catalogs", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/catalogs/${id}`, payload);
  },
  setIsDefault(id) {
    return axios.post(`/api/catalogs/${id}/default`)
  },
  create(payload) {
    return axios.post("/api/catalogs", payload);
  },
  delete(id) {
    return axios.delete(`/api/catalogs/${id}`);
  },
};
