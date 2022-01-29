import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/gravity-forms", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/gravity-forms/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/gravity-forms", payload);
  },
  delete(id) {
    return axios.delete(`/api/gravity-forms/${id}`);
  },
};
