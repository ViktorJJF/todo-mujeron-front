import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/template-messages", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/template-messages/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/template-messages", payload);
  },
  delete(id) {
    return axios.delete(`/api/template-messages/${id}`);
  },
};
