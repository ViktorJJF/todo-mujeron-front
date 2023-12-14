import axios from "axios";
export default {
  list(query = { sort: "name", order: "1" }) {
    return axios.get("/api/llm-tracker", { params: query });
  },
  update(id, payload) {
    return axios.put(`/api/llm-tracker/${id}`, payload);
  },
  create(payload) {
    return axios.post("/api/llm-tracker", payload);
  },
  delete(id) {
    return axios.delete(`/api/llm-tracker/${id}`);
  },
};
