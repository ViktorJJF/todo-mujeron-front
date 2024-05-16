import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/companies", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/companies/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/companies", payload);
  },
  delete(id) {
    return axios.delete(`/api/companies/${id}`);
  },
};
