import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/facebook-audiences", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/facebook-audiences/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/facebook-audiences", payload);
  },
  delete(id) {
    return axios.delete(`/api/facebook-audiences/${id}`);
  },
};
