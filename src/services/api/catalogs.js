import axios from "axios";
export default {
  find(id) {
    return axios.get(`/api/catalogs/${id}`)
  },
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/catalogs", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/catalogs/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/catalogs", payload);
  },
  delete(id) {
    return axios.delete(`/api/catalogs/${id}`);
  },
};
